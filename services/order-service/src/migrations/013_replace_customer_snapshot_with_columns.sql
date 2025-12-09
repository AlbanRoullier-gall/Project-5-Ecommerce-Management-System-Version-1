-- Migration: Replace customer_snapshot JSONB with structured columns
-- Description: Replaces the JSONB customer_snapshot with individual columns for better querying and indexing

-- Step 1: Add new columns
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_first_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_last_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_phone_number VARCHAR(50);

-- Step 2: Migrate existing data from customer_snapshot JSONB to new columns
-- Handle various JSON field name formats (first_name, firstName, firstname, etc.)
UPDATE orders
SET
  customer_first_name = COALESCE(
    customer_snapshot->>'first_name',
    customer_snapshot->>'firstName',
    customer_snapshot->>'firstname',
    NULL
  ),
  customer_last_name = COALESCE(
    customer_snapshot->>'last_name',
    customer_snapshot->>'lastName',
    customer_snapshot->>'lastname',
    NULL
  ),
  customer_email = COALESCE(
    customer_snapshot->>'email',
    customer_snapshot->>'emailAddress',
    NULL
  ),
  customer_phone_number = COALESCE(
    customer_snapshot->>'phoneNumber',
    customer_snapshot->>'phone_number',
    customer_snapshot->>'phone',
    NULL
  )
WHERE customer_snapshot IS NOT NULL;

-- Step 3: Make customer_id nullable (since we can have orders without customer_id but with customer info)
ALTER TABLE orders
  ALTER COLUMN customer_id DROP NOT NULL;

-- Step 4: Add constraint to ensure we have either customer_id or customer info
ALTER TABLE orders
  ADD CONSTRAINT check_customer_info
  CHECK (
    customer_id IS NOT NULL OR 
    (customer_first_name IS NOT NULL AND customer_email IS NOT NULL)
  );

-- Step 5: Create indexes on new columns for better search performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_first_name ON orders(customer_first_name);
CREATE INDEX IF NOT EXISTS idx_orders_customer_last_name ON orders(customer_last_name);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Step 6: Drop the old customer_snapshot column
ALTER TABLE orders
  DROP COLUMN IF EXISTS customer_snapshot;

-- Add comments for documentation
COMMENT ON COLUMN orders.customer_first_name IS 'First name of the customer at time of order';
COMMENT ON COLUMN orders.customer_last_name IS 'Last name of the customer at time of order';
COMMENT ON COLUMN orders.customer_email IS 'Email of the customer at time of order';
COMMENT ON COLUMN orders.customer_phone_number IS 'Phone number of the customer at time of order';
COMMENT ON COLUMN orders.customer_id IS 'Reference to the customer (nullable if customer info is stored directly)';

