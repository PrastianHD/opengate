// Ollama adapter.
// Ollama exposes /v1/chat/completions (OpenAI-compatible since 0.1.30).
// Auth is typically not needed for self-hosted; we still send Bearer if a key
// is configured (e.g. behind a reverse proxy).

import { openaiCompat } from "./openai_compat.js";

export const ollama = {
  slug: "ollama",

  prepareRequest(args) {
    const { apiKey } = args;
    // Ollama local default has no auth — only attach Bearer if key set.
    if (!apiKey || apiKey === "none") {
      const r = openaiCompat.prepareRequest({ ...args, apiKey: "x" });
      delete r.init.headers.Authorization;
      return r;
    }
    return openaiCompat.prepareRequest(args);
  },

  parseUsage(json) {
    return openaiCompat.parseUsage(json);
  },

  isRetriableError(status) {
    // 503 = model still loading, retry on different key won't help — but
    // upstream rotation is harmless and other status codes follow the
    // standard rules.
    return openaiCompat.isRetriableError(status);
  },

  extractStreamUsage(chunk) {
    return openaiCompat.extractStreamUsage(chunk);
  },
};
