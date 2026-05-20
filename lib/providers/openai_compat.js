// OpenAI-compatible adapter.
// Used by: OpenRouter, GLM, Minimax, Kiro Dev, OpenCode Free.
// Endpoint: POST {baseUrl}/chat/completions
// Auth:     Authorization: Bearer {apiKey}

export const openaiCompat = {
  slug: "openai_compat",

  prepareRequest({ baseUrl, apiKey, defaultHeaders, upstreamModel, body, stream }) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(defaultHeaders || {}),
    };

    const upstreamBody = {
      ...body,
      model: upstreamModel,
      stream: !!stream,
    };

    return {
      url: `${baseUrl.replace(/\/$/, "")}/chat/completions`,
      init: {
        method: "POST",
        headers,
        body: JSON.stringify(upstreamBody),
      },
    };
  },

  // Standard OpenAI usage block:
  // { prompt_tokens, completion_tokens, total_tokens }
  parseUsage(json) {
    const u = json?.usage;
    if (!u) return null;
    return {
      input_tokens: u.prompt_tokens ?? 0,
      output_tokens: u.completion_tokens ?? 0,
      total_tokens:
        u.total_tokens ?? (u.prompt_tokens ?? 0) + (u.completion_tokens ?? 0),
    };
  },

  // 429 = rate-limited, 5xx = upstream blip → retry with another key.
  // 401/403 = bad key, 4xx (other) = client error → don't retry.
  isRetriableError(status) {
    return status === 429 || (status >= 500 && status < 600);
  },

  // For SSE streaming responses, OpenAI emits usage in the final
  // `data: {...}` chunk before `data: [DONE]` when `stream_options:
  // {include_usage: true}`. Helper for stream parser to extract usage.
  extractStreamUsage(chunkJson) {
    return chunkJson?.usage ? this.parseUsage(chunkJson) : null;
  },
};
