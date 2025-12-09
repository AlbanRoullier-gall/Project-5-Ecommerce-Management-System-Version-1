-- Migration: Replace address_snapshot JSONB with structured columns
-- Description: Replaces the JSONB address_snapshot with individual columns for better querying and indexing

-- Step 1: Add new columns
ALTER TABLE order_addresses
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS address VARCHAR(500),
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS city VARCHAR(255),
  ADD COLUMN IF NOT EXISTS country_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Step 2: Migrate existing data from address_snapshot JSONB to new columns
UPDATE order_addresses
SET
  first_name = COALESCE(
    address_snapshot->>'firstName',
    address_snapshot->>'first_name',
    address_snapshot->>'firstname',
    NULL
  ),
  last_name = COALESCE(
    address_snapshot->>'lastName',
    address_snapshot->>'last_name',
    address_snapshot->>'lastname',
    NULL
  ),
  address = address_snapshot->>'address',
  postal_code = COALESCE(
    address_snapshot->>'postalCode',
    address_snapshot->>'postal_code',
    address_snapshot->>'postcode',
    NULL
  ),
  city = address_snapshot->>'city',
  country_name = COALESCE(
    address_snapshot->>'country',
    address_snapshot->>'countryName',
    address_snapshot->>'country_name',
    NULL
  ),
  phone = COALESCE(
    address_snapshot->>'phone',
    address_snapshot->>'phoneNumber',
    address_snapshot->>'phone_number',
    NULL
  )
WHERE address_snapshot IS NOT NULL;

-- Step 3: Make new columns NOT NULL (since address_snapshot was NOT NULL)
-- But first, set defaults for any NULL values from migration
UPDATE order_addresses
SET
  first_name = COALESCE(first_name, ''),
  last_name = COALESCE(last_name, ''),
  address = COALESCE(address, ''),
  city = COALESCE(city, ''),
  country_name = COALESCE(country_name, '')
WHERE first_name IS NULL OR last_name IS NULL OR address IS NULL OR city IS NULL OR country_name IS NULL;

ALTER TABLE order_addresses
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN last_name SET NOT NULL,
  ALTER COLUMN address SET NOT NULL,
  ALTER COLUMN city SET NOT NULL,
  ALTER COLUMN country_name SET NOT NULL;

-- Step 4: Create indexes on new columns for better search performance
CREATE INDEX IF NOT EXISTS idx_order_addresses_city ON order_addresses(city);
CREATE INDEX IF NOT EXISTS idx_order_addresses_country ON order_addresses(country_name);
CREATE INDEX IF NOT EXISTS idx_order_addresses_postal_code ON order_addresses(postal_code);

-- Step 5: Drop the old address_snapshot column
ALTER TABLE order_addresses
  DROP COLUMN IF EXISTS address_snapshot;

-- Add comments for documentation
COMMENT ON COLUMN order_addresses.first_name IS 'First name for the address';
COMMENT ON COLUMN order_addresses.last_name IS 'Last name for the address';
COMMENT ON COLUMN order_addresses.address IS 'Street address';
COMMENT ON COLUMN order_addresses.postal_code IS 'Postal/ZIP code';
COMMENT ON COLUMN order_addresses.city IS 'City';
COMMENT ON COLUMN order_addresses.country_name IS 'Country name';
COMMENT ON COLUMN order_addresses.phone IS 'Phone number (optional)';

