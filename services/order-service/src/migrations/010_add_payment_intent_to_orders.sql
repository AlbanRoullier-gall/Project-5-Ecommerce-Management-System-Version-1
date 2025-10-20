-- Add payment_intent_id to orders and unique index for idempotence
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payment_intent_unique
ON orders (payment_intent_id)
WHERE payment_intent_id IS NOT NULL;


