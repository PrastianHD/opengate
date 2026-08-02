-- Track QRIS payment transactions via Paywuz

CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  order_id text UNIQUE NOT NULL,          -- Paywuz order ID (merchant-generated)
  package_id text NOT NULL,               -- paket id (starter/basic/pro/power)
  amount_idr integer NOT NULL,            -- amount in IDR
  status text NOT NULL DEFAULT 'pending', -- pending | success | failed | cancelled
  paywuz_id text,                         -- Paywuz transaction UUID
  payment_number text,                    -- QR string or VA number
  payment_url text,                       -- Paywuz payment URL
  paid_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_payment_tx_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_status ON payment_transactions(status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_payment_tx_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_tx_updated ON payment_transactions;
CREATE TRIGGER trg_payment_tx_updated
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_tx_timestamp();
