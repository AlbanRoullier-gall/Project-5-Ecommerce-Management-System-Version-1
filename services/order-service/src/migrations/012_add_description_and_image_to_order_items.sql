-- Migration: Add description and image_url columns to order_items table
-- Description: Adds description and image_url columns to store product snapshot data
-- This harmonizes order items with cart items and product data

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN order_items.description IS 'Product description snapshot at time of order';
COMMENT ON COLUMN order_items.image_url IS 'Product image URL snapshot at time of order';

