import { openaiCompat } from "./openai_compat.js";
import { ollama } from "./ollama.js";
import { nvidiaNim } from "./nvidia_nim.js";

const ADAPTERS = {
  openai_compat: openaiCompat,
  ollama,
  nvidia_nim: nvidiaNim,
};

export function getAdapter(adapterSlug) {
  const adapter = ADAPTERS[adapterSlug];
  if (!adapter) {
    throw new Error(`Unknown provider adapter: ${adapterSlug}`);
  }
  return adapter;
}

export const ADAPTER_SLUGS = Object.keys(ADAPTERS);
