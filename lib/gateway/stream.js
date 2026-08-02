// SSE passthrough for streaming chat completions.
// Keeps OpenAI-compatible wire format (`data: {...}\n\n`) so clients see no
// difference. Inspects each chunk to capture usage from the final frame and
// rewrites the `model` field on every JSON frame so clients only ever see
// the OpenGate slug — never 9Router's internal id (e.g. "kr/…").
//
// Returns: { stream, getUsage } — getUsage() resolves once the upstream
// has finished and returns the parsed usage block (or null).

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

export function makeStreamProxy({ upstream, adapter, slug }) {
  let pendingUsage = null;
  let buffer = "";

  // When `slug` is provided we re-encode every line we emit so we can swap
  // the model field. When it is omitted we fall back to verbatim byte
  // forwarding (cheaper, used by tests / unknown adapters).
  const rewriteEnabled = typeof slug === "string" && slug.length > 0;

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (!rewriteEnabled) {
            controller.enqueue(value);
          }

          buffer += DECODER.decode(value, { stream: true });

          // Process every complete line we have. SSE separator is `\n\n`
          // but providers sometimes emit `\r\n` — index by `\n` and trim
          // each line so both forms work.
          let idx;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            const rawLine = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            const line = rawLine.trim();

            // Inspect/rewrite JSON `data:` frames; preserve everything else
            // (blank lines, comments, [DONE]) byte-for-byte when rewriting.
            if (line.startsWith("data:")) {
              const payload = line.slice(5).trim();
              if (payload && payload !== "[DONE]") {
                try {
                  const json = JSON.parse(payload);
                  const u = adapter.extractStreamUsage(json);
                  if (u) pendingUsage = u;
                  if (rewriteEnabled && json && typeof json === "object") {
                    if ("model" in json) json.model = slug;
                    controller.enqueue(
                      ENCODER.encode(`data: ${JSON.stringify(json)}\n`)
                    );
                    continue;
                  }
                } catch {
                  // Not JSON — fall through and re-emit as-is.
                }
              }
            }

            if (rewriteEnabled) {
              controller.enqueue(ENCODER.encode(rawLine + "\n"));
            }
          }
        }

        // Flush any trailing bytes (no terminating newline) verbatim so we
        // don't drop a final partial frame.
        if (rewriteEnabled && buffer.length > 0) {
          controller.enqueue(ENCODER.encode(buffer));
          buffer = "";
        }
      } catch (err) {
        controller.error(err);
        return;
      } finally {
        controller.close();
      }
    },
  });

  return {
    stream,
    getUsage: () => pendingUsage,
  };
}

// `stream_options.include_usage = true` forces OpenAI / OpenRouter / GLM /
// Minimax to emit a final usage frame on streams. Inject if absent.
export function ensureIncludeUsage(body) {
  if (!body || typeof body !== "object") return body;
  return {
    ...body,
    stream_options: {
      include_usage: true,
      ...(body.stream_options || {}),
    },
  };
}

export { ENCODER };
