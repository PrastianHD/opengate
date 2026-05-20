// Gateway key generation.
// Format:  ogt-<48 base62 chars>     (e.g. ogt-aB3xQ9…)
//   - 48 chars of ~5.95 bits each ≈ 286 bits of entropy
// Storage: sha256(plain + GATEWAY_KEY_HASH_SALT) hex
// Prefix:  first 12 chars of plaintext shown in UI ("ogt-aB3xQ9zP")
// Last4:   last 4 chars of plaintext

import crypto from "node:crypto";
import { hashGatewayKey, TOKEN_PREFIX } from "./auth";

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const KEY_RANDOM_LEN = 48;

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
