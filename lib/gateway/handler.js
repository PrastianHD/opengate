// Gateway core handler for /v1/chat/completions.
//
// Flow:
//   1. authenticate     → user + key + effectiveRpm
//   2. checkRpm         → Upstash sliding window
//   3. parse body       → { model, stream, messages, ... }
//   4. resolve model    → models row (provider, upstream_model, pricing)
//   5. enforce model_whitelist on the key
//   6. balance check    → must be > 0
//   7. pickUpstreamKey  → with retry on 429/5xx/401/403 across keys
//   8. adapter.prepareRequest → fetch upstream
//   9. on success:
//      - non-streaming: parse usage, debit, log, return
//      - streaming: tee stream, debit + log on completion (background)
//
// Errors are reported in OpenAI-compatible shape:
//   { error: { message, type, code } }

import { authenticate, touchGatewayKey } from "./auth.js";
import { checkRpm } from "./rateLimit.js";
import { computeCost } from "./cost.js";
import { getAdapter } from "@/lib/providers";
import { pickUpstreamKey, markUpstreamKeyFailure } from "@/lib/providers/keyRotation";
import { makeStreamProxy, ensureIncludeUsage } from "./stream.js";
import { createServiceClient } from "@/lib/supabase/server";

const MAX_UPSTREAM_ATTEMPTS = 3;

export async function handleChatCompletions(request) {
  const startedAt = Date.now();

  // ---------------- 1. Authenticate ----------------
  const auth = await authenticate(request);
  if (!auth.ok) return openaiError(auth.status, auth.error);
  const { user, key, effectiveRpm } = auth;

  // ---------------- 2. RPM rate limit ----------------
  const rpm = await checkRpm({ userId: user.id, rpm: effectiveRpm });
  if (!rpm.ok) {
    await logRateLimit(user.id, key.id, "rpm_exceeded", { limit: rpm.limit });
    return openaiError(
      429,
      { code: "rpm_exceeded", message: `Rate limit ${rpm.limit}/min exceeded` },
      rpmHeaders(rpm)
    );
  }

  // ---------------- 3. Parse body ----------------
  let body;
  try {
    body = await request.json();
  } catch {
    return openaiError(400, {
      code: "invalid_json",
      message: "Request body is not valid JSON",
    });
  }
  const requestedModel = body?.model;
  if (!requestedModel || typeof requestedModel !== "string") {
    return openaiError(400, {
      code: "invalid_request",
      message: "`model` is required",
    });
  }
  const wantsStream = !!body.stream;

  // ---------------- 4. Resolve model ----------------
  const sb = createServiceClient();
  const { data: model, error: modelErr } = await sb
    .from("models")
    .select(
      "id, slug, enabled, provider_id, upstream_model_id, " +
        "input_price_per_m_micro_cents, output_price_per_m_micro_cents, " +
        "providers(slug, base_url, adapter, default_headers, enabled)"
    )
    .eq("slug", requestedModel)
    .maybeSingle();

  if (modelErr) {
    return openaiError(500, {
      code: "model_lookup_failed",
      message: modelErr.message,
    });
  }
  if (!model || !model.enabled) {
    return openaiError(404, {
      code: "model_not_found",
      message: `Model '${requestedModel}' is not available`,
    });
  }
  if (!model.providers?.enabled) {
    return openaiError(503, {
      code: "provider_disabled",
      message: "Provider for this model is currently disabled",
    });
  }

  // ---------------- 5. Per-key whitelist ----------------
  if (
    Array.isArray(key.model_whitelist) &&
    key.model_whitelist.length > 0 &&
    !key.model_whitelist.includes(requestedModel)
  ) {
    await logRateLimit(user.id, key.id, "model_not_allowed", {
      requested: requestedModel,
    });
    return openaiError(403, {
      code: "model_not_allowed",
      message: `This API key cannot access '${requestedModel}'`,
    });
  }

  // ---------------- 6. Balance precheck ----------------
  if (user.balance_micro_cents <= 0) {
    await logRateLimit(user.id, key.id, "balance_exhausted", {
      balance: user.balance_micro_cents,
    });
    return openaiError(402, {
      code: "insufficient_credit",
      message: "Top up your OpenGate balance to continue",
    });
  }

  // ---------------- 7+8. Pick key & call upstream ----------------
  const adapter = getAdapter(model.providers.adapter);
  const upstreamBody = wantsStream ? ensureIncludeUsage(body) : body;

  let upstreamResp = null;
  let chosenKey = null;
  let lastErrStatus = 0;
  let lastErrText = "";

  for (let attempt = 0; attempt < MAX_UPSTREAM_ATTEMPTS; attempt++) {
    const picked = await pickUpstreamKey(model.provider_id);
    if (!picked) {
      return openaiError(503, {
        code: "no_upstream_key",
        message: "No upstream API key available for this provider",
      });
    }
    chosenKey = picked;

    const { url, init } = adapter.prepareRequest({
      baseUrl: model.providers.base_url,
      apiKey: picked.plaintext,
      defaultHeaders: model.providers.default_headers || {},
      upstreamModel: model.upstream_model_id,
      body: upstreamBody,
      stream: wantsStream,
    });

    let resp;
    try {
      resp = await fetch(url, init);
    } catch (err) {
      // Network-level failure — treat as 502 and retry on a different key.
      lastErrStatus = 502;
      lastErrText = err?.message || "Upstream fetch failed";
      await markUpstreamKeyFailure({
        keyId: picked.id,
        status: 502,
        errorMessage: lastErrText,
      });
      continue;
    }

    if (resp.ok) {
      upstreamResp = resp;
      break;
    }

    // Non-OK
    const errText = await safeReadText(resp);
    lastErrStatus = resp.status;
    lastErrText = errText;

    if (adapter.isRetriableError(resp.status)) {
      await markUpstreamKeyFailure({
        keyId: picked.id,
        status: resp.status,
        errorMessage: errText,
      });
      continue;
    }
    // Non-retriable — surface immediately.
    await markUpstreamKeyFailure({
      keyId: picked.id,
      status: resp.status,
      errorMessage: errText,
    });
    return openaiError(resp.status, {
      code: "upstream_error",
      message: clipError(errText),
    });
  }

  if (!upstreamResp) {
    return openaiError(502, {
      code: "upstream_unavailable",
      message: clipError(lastErrText) || `Upstream returned ${lastErrStatus}`,
    });
  }

  // Touch the gateway key (fire-and-forget)
  touchGatewayKey(key.id);

  // ---------------- 9a. Streaming branch ----------------
  if (wantsStream) {
    const ttft = Date.now() - startedAt;
    const proxy = makeStreamProxy({ upstream: upstreamResp, adapter });

    // Settle billing in the background once the stream finishes. We use
    // a dummy reader on a tee to know when the client has consumed the
    // whole response.
    const [forClient, forBilling] = proxy.stream.tee();

    drainAndBill({
      drainStream: forBilling,
      adapter,
      proxy,
      user,
      key,
      model,
      provider: model.providers,
      chosenKey,
      ttftMs: ttft,
      startedAt,
    }).catch((e) => console.error("billing drain failed:", e));

    return new Response(forClient, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-OpenGate-Model": model.slug,
      },
    });
  }

  // ---------------- 9b. Non-streaming branch ----------------
  const json = await upstreamResp.json();
  const usage = adapter.parseUsage(json) || {
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
  };
  const cost = computeCost({
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    inputPricePerMMicroCents: model.input_price_per_m_micro_cents,
    outputPricePerMMicroCents: model.output_price_per_m_micro_cents,
  });
  const durationMs = Date.now() - startedAt;

  // Settle billing — debit first so the usage_log row's cost reflects the
  // actual deduction (and skips logging cost if balance ran out mid-flight).
  const settled = await settleBilling({
    user,
    key,
    model,
    provider: model.providers,
    chosenKey,
    usage,
    cost,
    durationMs,
    statusCode: 200,
    isStream: false,
    ttftMs: null,
  });

  return new Response(JSON.stringify(json), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-OpenGate-Model": model.slug,
      "X-OpenGate-Cost-MicroCents": String(cost),
      "X-OpenGate-Balance-MicroCents": String(settled.newBalance),
    },
  });
}

// ---------------- helpers ----------------

async function drainAndBill({
  drainStream,
  adapter,
  proxy,
  user,
  key,
  model,
  provider,
  chosenKey,
  ttftMs,
  startedAt,
}) {
  const reader = drainStream.getReader();
  while (true) {
    const { done } = await reader.read();
    if (done) break;
  }
  const usage = proxy.getUsage() || {
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
  };
  const cost = computeCost({
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    inputPricePerMMicroCents: model.input_price_per_m_micro_cents,
    outputPricePerMMicroCents: model.output_price_per_m_micro_cents,
  });
  await settleBilling({
    user,
    key,
    model,
    provider,
    chosenKey,
    usage,
    cost,
    durationMs: Date.now() - startedAt,
    statusCode: 200,
    isStream: true,
    ttftMs,
  });
}

async function settleBilling({
  user,
  key,
  model,
  provider,
  chosenKey,
  usage,
  cost,
  durationMs,
  statusCode,
  isStream,
  ttftMs,
}) {
  const sb = createServiceClient();

  const { data: logRow, error: logErr } = await sb
    .from("usage_log")
    .insert({
      user_id: user.id,
      gateway_key_id: key.id,
      model_id: model.id,
      provider_id: model.provider_id,
      upstream_key_id: chosenKey.id,
      endpoint: "/v1/chat/completions",
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      total_tokens:
        usage.total_tokens ||
        (usage.input_tokens || 0) + (usage.output_tokens || 0),
      cost_micro_cents: cost,
      duration_ms: durationMs,
      status_code: statusCode,
      is_stream: isStream,
      ttft_ms: ttftMs,
    })
    .select("id")
    .single();

  if (logErr) {
    console.error("usage_log insert failed:", logErr);
  }

  if (cost > 0) {
    const { error: debitErr } = await sb.rpc("debit_credit", {
      p_user_id: user.id,
      p_amount_micro_cents: cost,
      p_usage_log_id: logRow?.id || null,
      p_description: `${model.slug} via ${provider.slug}`,
    });
    if (debitErr) console.error("debit_credit failed:", debitErr);

    // Also bump the per-key spending counter (advisory; cap is checked at auth).
    await sb
      .from("gateway_keys")
      .update({
        spending_used_micro_cents: key.spending_used_micro_cents + cost,
      })
      .eq("id", key.id);
  }

  // Read fresh balance for the response header
  const { data: u } = await sb
    .from("users")
    .select("balance_micro_cents")
    .eq("id", user.id)
    .single();

  return { newBalance: u?.balance_micro_cents ?? 0, usageLogId: logRow?.id };
}

async function logRateLimit(userId, keyId, kind, context) {
  const sb = createServiceClient();
  await sb.from("rate_limit_events").insert({
    user_id: userId,
    gateway_key_id: keyId,
    kind,
    context,
  });
}

function rpmHeaders(rpm) {
  return {
    "X-RateLimit-Limit": String(rpm.limit),
    "X-RateLimit-Remaining": String(rpm.remaining),
    "X-RateLimit-Reset": String(rpm.reset),
  };
}

function openaiError(status, error, extraHeaders = {}) {
  return new Response(
    JSON.stringify({
      error: {
        message: error.message,
        type: error.code || "gateway_error",
        code: error.code || null,
      },
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...extraHeaders,
      },
    }
  );
}

async function safeReadText(resp) {
  try {
    return await resp.text();
  } catch {
    return "";
  }
}

function clipError(text) {
  if (!text) return "";
  return text.length > 500 ? text.slice(0, 500) + "…" : text;
}
