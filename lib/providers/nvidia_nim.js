// Nvidia NIM adapter.
// Endpoint: POST {baseUrl}/chat/completions  (OpenAI-compatible)
// Auth:     Authorization: Bearer {apiKey}
// Quirk:    Some NIM models expect `model` as exact org/name string and
//           respond with the same `usage` shape as OpenAI.

import { openaiCompat } from "./openai_compat.js";

export const nvidiaNim = {
  slug: "nvidia_nim",

  prepareRequest(args) {
    const r = openaiCompat.prepareRequest(args);
    // NIM specifically wants Accept: application/json (not text/event-stream
    // for non-streaming) — harmless on both branches.
    r.init.headers.Accept = "application/json";
    return r;
  },

  parseUsage(json) {
    return openaiCompat.parseUsage(json);
  },

  isRetriableError(status) {
    return openaiCompat.isRetriableError(status);
  },

  extractStreamUsage(chunk) {
    return openaiCompat.extractStreamUsage(chunk);
  },
};
