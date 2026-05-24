// Shared catalog of models displayed on /models and used by /pricing
// calculator. Single source so price + tier + provider stay in sync.

export const MODELS = [
  {
    name: "Claude Opus 4.7",
    provider: "Anthropic",
    tier: "flagship",
    inputPrice: 15.0,
    outputPrice: 75.0,
    context: "200K",
    speed: 42,
    description:
      "Anthropic's top-tier model. Best for deep reasoning, agentic workflows, and long-form analysis.",
    contextLong: "200k context",
    output: "32k output",
  },
  {
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    tier: "flagship",
    inputPrice: 3.0,
    outputPrice: 15.0,
    context: "200K",
    speed: 78,
    description:
      "Balanced flagship from Anthropic. Strong coding, writing, and tool use at workhorse pricing.",
    contextLong: "200k context",
    output: "16k output",
  },
  {
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    tier: "fast",
    inputPrice: 0.8,
    outputPrice: 4.0,
    context: "200K",
    speed: 156,
    description:
      "Fast and inexpensive. Ideal for chatbots, classification, and structured extraction at scale.",
    contextLong: "200k context",
    output: "8k output",
  },
  {
    name: "Minimax 2.7",
    provider: "Minimax",
    tier: "flagship",
    inputPrice: 1.2,
    outputPrice: 4.8,
    context: "256K",
    speed: 92,
    description:
      "Latest Minimax flagship with strong multilingual and multimodal capabilities.",
    contextLong: "256k context",
    output: "16k output",
  },
  {
    name: "Minimax 2.5",
    provider: "Minimax",
    tier: "standard",
    inputPrice: 0.6,
    outputPrice: 2.4,
    context: "256K",
    speed: 124,
    description:
      "Reliable, cost-effective Minimax model for general chat and content generation.",
    contextLong: "256k context",
    output: "8k output",
  },
  {
    name: "Deepseek V4 Pro",
    provider: "Deepseek",
    tier: "flagship",
    inputPrice: 0.55,
    outputPrice: 2.19,
    context: "128K",
    speed: 88,
    description:
      "Top Deepseek model. Excels at reasoning, math, and repo-scale code generation.",
    contextLong: "128k context",
    output: "16k output",
  },
  {
    name: "Deepseek V4 Flash",
    provider: "Deepseek",
    tier: "fast",
    inputPrice: 0.14,
    outputPrice: 0.28,
    context: "128K",
    speed: 198,
    description:
      "Lightweight Deepseek variant. Fast, cheap, and capable for high-volume tasks.",
    contextLong: "128k context",
    output: "8k output",
  },
  {
    name: "GLM 5.1",
    provider: "Zhipu",
    tier: "flagship",
    inputPrice: 0.5,
    outputPrice: 2.0,
    context: "128K",
    speed: 95,
    description:
      "Zhipu's flagship general-purpose model with strong Chinese and English performance.",
    contextLong: "128k context",
    output: "8k output",
  },
  {
    name: "GLM 5",
    provider: "Zhipu",
    tier: "standard",
    inputPrice: 0.3,
    outputPrice: 1.2,
    context: "128K",
    speed: 132,
    description:
      "Solid general-purpose GLM model. Reliable for chat, summarization, and tool calling.",
    contextLong: "128k context",
    output: "8k output",
  },
  {
    name: "GPT 5.3 Codex",
    provider: "OpenAI",
    tier: "flagship",
    inputPrice: 5.0,
    outputPrice: 20.0,
    context: "256K",
    speed: 64,
    description:
      "OpenAI's specialized coding model. Built for refactoring, debugging, and agentic dev workflows.",
    contextLong: "256k context",
    output: "16k output",
  },
  {
    name: "GPT 5.5",
    provider: "OpenAI",
    tier: "flagship",
    inputPrice: 8.0,
    outputPrice: 32.0,
    context: "400K",
    speed: 56,
    description:
      "OpenAI's most advanced general-purpose flagship. Multimodal, strong reasoning, broad knowledge.",
    contextLong: "400k context",
    output: "32k output",
  },
  {
    name: "GPT 5.4",
    provider: "OpenAI",
    tier: "flagship",
    inputPrice: 4.5,
    outputPrice: 18.0,
    context: "256K",
    speed: 72,
    description:
      "Previous OpenAI flagship. Excellent reasoning and tool use, slightly cheaper than 5.5.",
    contextLong: "256k context",
    output: "16k output",
  },
];

export const TIERS = ["all", "flagship", "standard", "fast"];

export const PROVIDERS = [
  "all",
  "Anthropic",
  "Minimax",
  "Deepseek",
  "Zhipu",
  "OpenAI",
];
