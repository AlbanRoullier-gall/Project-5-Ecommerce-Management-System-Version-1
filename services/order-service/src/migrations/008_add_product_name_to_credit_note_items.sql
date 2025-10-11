-- Migration: Add product_name column to credit_note_items table
-- Description: Adds a product_name column to store the product name snapshot

ALTER TABLE credit_note_items
ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN credit_note_items.product_name IS 'Product name snapshot at time of credit note';

