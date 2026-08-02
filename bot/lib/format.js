// Formatting helpers for the Telegram bot.

/**
 * Format IDR currency.
 * @param {number} amount - Amount in Rupiah
 */
export function formatIDR(amount) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

/**
 * Format token count.
 * @param {number} tokens
 */
export function formatTokens(tokens) {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return tokens.toLocaleString("id-ID");
}

/**
 * Mask an API key for display.
 * @param {string} prefix - e.g. "ogt-aB3xQ9zP"
 * @param {string} last4 - e.g. "zQ9p"
 */
export function maskKey(prefix, last4) {
  return `${prefix}...${last4}`;
}

/**
 * Convert micro-cents to IDR.
 * 1 USD = 18,000 IDR, 1 USD = 1,000,000 micro-cents
 */
export function microCentsToIDR(microCents) {
  return Math.round(microCents * 0.018);
}
