// Shared catalog of models displayed on /models and /pricing
// 4 confirmed models. OpenGate sells at markup (hybrid: pay-as-you-go + packages).
// IDR rate: 1 USD = Rp 18,000

export const MODELS = [
  {
    slug: "deepseek-v4-flash",
    name: "Deepseek V4 Flash",
    provider: "Deepseek",
    tier: "fast",
    inputPrice: 0.17,   // ~Rp 3,060/M
    outputPrice: 0.34,  // ~Rp 6,120/M
    context: "128K",
    speed: 198,
    description:
      "Lightweight Deepseek variant. Fast, cheap, and capable for high-volume tasks.",
    contextLong: "128k context",
    output: "8k output",
    tools: false,
    vision: false,
  },
  {
    slug: "mimo-v2.5",
    name: "Mimo V2.5",
    provider: "Xiaomi",
    tier: "fast",
    inputPrice: 0.10,   // ~Rp 1,800/M — cheapest
    outputPrice: 0.20,  // ~Rp 3,600/M
    context: "128K",
    speed: 180,
    description:
      "Xiaomi's fast and lightweight model. Great for chat, classification, and everyday tasks.",
    contextLong: "128k context",
    output: "8k output",
    tools: false,
    vision: false,
  },
  {
    slug: "nemotron-3-ultra-550b-a55b",
    name: "Nemotron 3 Ultra 550B",
    provider: "NVIDIA",
    tier: "standard",
    inputPrice: 0.25,   // ~Rp 4,500/M
    outputPrice: 0.50,  // ~Rp 9,000/M
    context: "128K",
    speed: 85,
    description:
      "NVIDIA's large open model. Strong reasoning and instruction following at scale.",
    contextLong: "128k context",
    output: "8k output",
    tools: true,
    vision: false,
  },
  {
    slug: "gemma-4-31b-it",
    name: "Gemma 4 31B",
    provider: "Google",
    tier: "standard",
    inputPrice: 0.20,   // ~Rp 3,600/M
    outputPrice: 0.40,  // ~Rp 7,200/M
    context: "128K",
    speed: 110,
    description:
      "Google's Gemma 4 model. Balanced performance for multilingual and coding tasks.",
    contextLong: "128k context",
    output: "8k output",
    tools: true,
    vision: true,
  },
];

// ── Packages (bonus token for bulk buys) ──

export const PACKAGES = [
  { id: "starter", token: 10_000_000, price: 5_000, bonus: 0, label: "10M", priceLabel: "Rp 5.000" },
  { id: "basic", token: 50_000_000, price: 18_000, bonus: 10, label: "50M", priceLabel: "Rp 18.000" },
  { id: "pro", token: 100_000_000, price: 30_000, bonus: 20, label: "100M", priceLabel: "Rp 30.000", featured: true },
  { id: "power", token: 500_000_000, price: 120_000, bonus: 30, label: "500M", priceLabel: "Rp 120.000" },
];

// ── Filter helpers ──

export const TIERS = ["all", "flagship", "standard", "fast"];

export const PROVIDERS = [
  "all",
  "Deepseek",
  "Xiaomi",
  "NVIDIA",
  "Google",
];
