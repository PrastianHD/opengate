// Script untuk encrypt upstream key lalu generate SQL insert.
// Jalankan: node scripts/setup-db.mjs

import crypto from "node:crypto";

const ENCRYPTION_KEY = "060ade5031a9da4a694537c8dd29cb0997fddfbd11c95627d45f4e182699ba2c";
const ROUTER_KEY = "sk-95d682f695a131c0-zez1b4-77670ead";

function encryptUpstreamKey(plaintext) {
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

const encrypted = encryptUpstreamKey(ROUTER_KEY);

console.log("=== ENCRYPTED UPSTREAM KEY ===");
console.log(encrypted);
console.log("");
console.log("=== SQL INSERT (run after migrations) ===");
console.log(`
-- Insert upstream key untuk 9Router
DO $$
DECLARE
  v_9router_id UUID;
BEGIN
  SELECT id INTO v_9router_id FROM providers WHERE slug = '9router';

  IF v_9router_id IS NULL THEN
    RAISE EXCEPTION '9router provider not found — run 004_9router.sql first';
  END IF;

  INSERT INTO upstream_keys (provider_id, label, api_key_encrypted, api_key_last4, enabled, priority, weight)
  VALUES (v_9router_id, '9Router Master Key', '${encrypted}', '${ROUTER_KEY.slice(-4)}', true, 1, 1);
END $$;

-- Verify
SELECT uk.id, uk.label, uk.api_key_last4, uk.enabled, p.slug as provider
FROM upstream_keys uk
JOIN providers p ON p.id = uk.provider_id;
`);
