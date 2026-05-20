// SSE passthrough for streaming chat completions.
// Keeps OpenAI-compatible wire format (`data: {...}\n\n`) so clients see no
// difference. Inspects each chunk to capture usage from the final frame.
//
// Returns: { stream, getUsage } — getUsage() resolves once the upstream
// has finished and returns the parsed usage block (or null).

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

export function makeStreamProxy({ upstream, adapter }) {
  let pendingUsage = null;
  let buffer = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Forward bytes verbatim
          controller.enqueue(value);

          // Inspect for usage in `data: {...}` lines
          buffer += DECODER.decode(value, { stream: true });
          let idx;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, idx).trim();
            buffer = buffer.slice(idx + 1);
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const u = adapter.extractStreamUsage(json);
              if (u) pendingUsage = u;
            } catch {
              // Not JSON — ignore (some providers send keep-alive comments).
            }
          }
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
