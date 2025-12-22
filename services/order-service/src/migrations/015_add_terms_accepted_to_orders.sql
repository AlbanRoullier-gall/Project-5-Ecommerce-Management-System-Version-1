-- Migration: Add terms_accepted and terms_accepted_at to orders table
-- Description: Adds fields to store customer consent to terms and conditions for legal traceability

-- Step 1: Add new columns
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Create index on terms_accepted for filtering
CREATE INDEX IF NOT EXISTS idx_orders_terms_accepted ON orders(terms_accepted);

-- Step 3: Create index on terms_accepted_at for date-based queries
CREATE INDEX IF NOT EXISTS idx_orders_terms_accepted_at ON orders(terms_accepted_at);

-- Add comments for documentation
COMMENT ON COLUMN orders.terms_accepted IS 'Whether the customer accepted the terms and conditions at time of order';
COMMENT ON COLUMN orders.terms_accepted_at IS 'Timestamp when the customer accepted the terms and conditions';
