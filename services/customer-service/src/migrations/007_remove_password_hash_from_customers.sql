-- Migration: Remove password_hash from customers table
-- Description: Removes the password_hash column since customer-service doesn't handle authentication

-- Drop the password_hash column from customers table
ALTER TABLE customers DROP COLUMN IF EXISTS password_hash;

-- Update the comment to reflect the change
COMMENT ON TABLE customers IS 'Main table for customer information (no authentication)';
