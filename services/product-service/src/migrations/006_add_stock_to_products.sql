-- Migration: Add stock column to products table
-- Description: Adds a stock quantity field to track product inventory

ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0;

-- Create index on stock for filtering
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- Add comment for documentation
COMMENT ON COLUMN products.stock IS 'Stock quantity available for the product';

