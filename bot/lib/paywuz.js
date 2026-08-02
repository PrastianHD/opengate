// Paywuz API client for QRIS payments.
import crypto from "node:crypto";

const BASE_URL = "https://api.paywuz.id/v1";

function getApiKey() {
  const key = process.env.PAYWUZ_API_KEY;
  if (!key) throw new Error("PAYWUZ_API_KEY not set");
  return key;
}

function headers() {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };
}

/**
 * Create a QRIS transaction.
 * @param {object} opts
 * @param {string} opts.orderId - Unique order ID (1-64 chars)
 * @param {number} opts.amount - Amount in IDR
 * @param {string} [opts.description] - Payment description
 * @returns {Promise<object>} Transaction data
 */
export async function createTransaction({ orderId, amount, description }) {
  const res = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      orderId,
      amount,
      paymentMethod: "QRIS",
      metadata: description ? { description } : undefined,
    }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || json.error || "Paywuz error");
  return json.data;
}

/**
 * Check transaction status.
 * @param {string} orderId
 * @returns {Promise<object>} Transaction data
 */
export async function getTransaction(orderId) {
  const res = await fetch(`${BASE_URL}/transactions/${orderId}`, {
    headers: headers(),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || json.error || "Paywuz error");
  return json.data;
}

/**
 * Cancel a pending transaction.
 * @param {string} orderId
 * @returns {Promise<object>}
 */
export async function cancelTransaction(orderId) {
  const res = await fetch(`${BASE_URL}/transactions/${orderId}/cancel`, {
    method: "POST",
    headers: headers(),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || json.error || "Paywuz error");
  return json.data;
}

/**
 * Verify webhook signature.
 * @param {string} rawBody - Raw request body
 * @param {string} signature - X-Paywuz-Signature header value
 * @returns {boolean}
 */
export function verifyWebhook(rawBody, signature) {
  const apiKey = getApiKey();
  const expected =
    "sha256=" + crypto.createHmac("sha256", apiKey).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
