// Cost calculator.
// Pricing stored in models table as micro-cents per 1M tokens.
// micro-cents = (tokens * price_per_m_micro_cents) / 1_000_000
// We round half-up so we never undercharge.

const PER_M = 1_000_000;

export function computeCost({
  inputTokens = 0,
  outputTokens = 0,
  inputPricePerMMicroCents,
  outputPricePerMMicroCents,
}) {
  const inputCost =
    Math.ceil((inputTokens * inputPricePerMMicroCents) / PER_M);
  const outputCost =
    Math.ceil((outputTokens * outputPricePerMMicroCents) / PER_M);
  return inputCost + outputCost;
}
