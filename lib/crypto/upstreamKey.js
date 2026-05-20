import crypto from "node:crypto";

// AES-256-GCM at-rest encryption for upstream provider API keys.
// Key material: 32 bytes, hex-encoded, in env UPSTREAM_KEY_ENCRYPTION_KEY.
// Format on disk: base64( iv (12) || authTag (16) || ciphertext )

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;

function getKey() {
  const hex = process.env.UPSTREAM_KEY_ENCRYPTION_KEY;
  if (!hex) {
    throw new Error(
      "UPSTREAM_KEY_ENCRYPTION_KEY missing. Generate with: openssl rand -hex 32"
    );
  }
  if (hex.length !== 64) {
    throw new Error(
      "UPSTREAM_KEY_ENCRYPTION_KEY must be 32 bytes hex (64 chars)"
    );
  }
  return Buffer.from(hex, "hex");
}

export function encryptUpstreamKey(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

export function decryptUpstreamKey(encoded) {
  const key = getKey();
  const blob = Buffer.from(encoded, "base64");
  const iv = blob.subarray(0, IV_LEN);
  const tag = blob.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ciphertext = blob.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

export function lastFour(plaintext) {
  return plaintext.slice(-4);
}
