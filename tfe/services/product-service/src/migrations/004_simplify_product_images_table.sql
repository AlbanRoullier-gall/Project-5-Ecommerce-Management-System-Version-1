-- Migration: Simplify product_images table
-- Description: Simplifies the product_images table to only essential fields

-- Drop existing indexes
DROP INDEX IF EXISTS idx_product_images_active;
DROP INDEX IF EXISTS idx_product_images_order;

-- Drop the existing table and recreate with simplified structure
DROP TABLE IF EXISTS product_images CASCADE;

-- Create simplified product_images table
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    order_index INTEGER DEFAULT 0
);

-- Create essential indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(order_index);

-- Add comments for documentation
COMMENT ON TABLE product_images IS 'Simplified table for product images';
COMMENT ON COLUMN product_images.id IS 'Primary key for the image';
COMMENT ON COLUMN product_images.product_id IS 'Reference to the product';
COMMENT ON COLUMN product_images.filename IS 'Original filename of the image';
COMMENT ON COLUMN product_images.file_path IS 'Path to the image file';
COMMENT ON COLUMN product_images.order_index IS 'Order index for sorting images';
