// Gateway key generation for the bot.
// Copied from lib/gateway/keyGen.js to avoid Next.js alias coupling.

import crypto from "node:crypto";

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const KEY_RANDOM_LEN = 48;
const TOKEN_PREFIX = "ogt-";

function getKeyHashSalt() {
  const salt = process.env.GATEWAY_KEY_HASH_SALT;
  if (!salt) throw new Error("GATEWAY_KEY_HASH_SALT missing");
  return salt;
}

export function hashGatewayKey(plain) {
  return crypto
    .createHash("sha256")
    .update(plain + getKeyHashSalt())
    .digest("hex");
}

export function generateGatewayKey() {
  const bytes = crypto.randomBytes(KEY_RANDOM_LEN);
  let body = "";
  for (let i = 0; i < KEY_RANDOM_LEN; i++) {
    body += ALPHABET[bytes[i] % ALPHABET.length];
  }
  const plain = `${TOKEN_PREFIX}${body}`;
  return {
    plain,
    hash: hashGatewayKey(plain),
    prefix: plain.slice(0, 12),
    last4: plain.slice(-4),
  };
}
