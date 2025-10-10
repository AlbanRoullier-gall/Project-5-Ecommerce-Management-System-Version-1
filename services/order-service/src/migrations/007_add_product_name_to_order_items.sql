-- Migration: Add product_name column to order_items table
-- Description: Adds a product_name column to store the product name snapshot

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN order_items.product_name IS 'Product name snapshot at time of order';

