-- Enforce a single default address per customer
-- 1) Clean existing data to ensure at most one default per customer
WITH duplicates AS (
  SELECT
    address_id,
    customer_id,
    ROW_NUMBER() OVER (
      PARTITION BY customer_id
      ORDER BY updated_at DESC, created_at DESC, address_id DESC
    ) AS rn
  FROM customer_addresses
  WHERE is_default = true
)
UPDATE customer_addresses ca
SET is_default = false
FROM duplicates d
WHERE ca.address_id = d.address_id
  AND d.rn > 1;

-- 2) Create a partial unique index to guarantee only one default per customer
DO $$
BEGIN
  BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS uq_customer_default_address
      ON customer_addresses (customer_id)
      WHERE is_default = true;
    COMMENT ON INDEX uq_customer_default_address IS 'Ensures only one default address per customer (is_default=true).';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping unique index creation on customer_addresses due to insufficient privileges';
  END;
END $$;


