// Shared formatting helpers. Keep currency math centralized so the conversion
// from internal micro-cents to display USD never drifts between pages.

export const MICRO_PER_USD = 1_000_000;

export function formatUsd(microCents, fractionDigits = 4) {
  if (microCents == null) return "—";
  const usd = microCents / MICRO_PER_USD;
  return usd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 2,
  });
}

export function formatDate(iso, fallback = "—") {
  if (!iso) return fallback;
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
