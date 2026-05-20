// OpenAI-compatible model list. No auth required (mirrors OpenAI/OpenRouter).
// Returns enabled models only.

import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("models")
    .select(
      "slug, display_name, context_tokens, max_output_tokens, " +
        "input_price_per_m_micro_cents, output_price_per_m_micro_cents, " +
        "supports_streaming, supports_tools, supports_vision, " +
        "providers(slug, name)"
    )
    .eq("enabled", true)
    .order("slug");

  if (error) {
    return Response.json(
      { error: { message: error.message, type: "model_list_failed" } },
      { status: 500 }
    );
  }

  const models = (data || []).map((m) => ({
    id: m.slug,
    object: "model",
    owned_by: m.providers?.slug || "opengate",
    display_name: m.display_name,
    context_window: m.context_tokens,
    max_output: m.max_output_tokens,
    pricing: {
      input_per_m_usd: m.input_price_per_m_micro_cents / 1_000_000,
      output_per_m_usd: m.output_price_per_m_micro_cents / 1_000_000,
    },
    capabilities: {
      streaming: m.supports_streaming,
      tools: m.supports_tools,
      vision: m.supports_vision,
    },
  }));

  return Response.json({
    object: "list",
    data: models,
  });
}
