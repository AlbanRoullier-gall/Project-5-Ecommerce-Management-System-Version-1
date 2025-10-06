-- Migration: Create product_images table
-- Description: Creates the table for product images

CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    alt_text VARCHAR(255),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on product_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_product_images_active ON product_images(is_active);

-- Create index on order_index for sorting
CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(order_index);

-- Add comments for documentation
COMMENT ON TABLE product_images IS 'Table for product images';
COMMENT ON COLUMN product_images.id IS 'Primary key for the image';
COMMENT ON COLUMN product_images.product_id IS 'Reference to the product';
COMMENT ON COLUMN product_images.filename IS 'Original filename of the image';
COMMENT ON COLUMN product_images.file_path IS 'Path to the image file';
COMMENT ON COLUMN product_images.file_size IS 'Size of the image file in bytes';
COMMENT ON COLUMN product_images.mime_type IS 'MIME type of the image';
COMMENT ON COLUMN product_images.width IS 'Width of the image in pixels';
COMMENT ON COLUMN product_images.height IS 'Height of the image in pixels';
COMMENT ON COLUMN product_images.alt_text IS 'Alternative text for the image';
COMMENT ON COLUMN product_images.description IS 'Description of the image';
COMMENT ON COLUMN product_images.is_active IS 'Whether the image is active';
COMMENT ON COLUMN product_images.order_index IS 'Order index for sorting images';
COMMENT ON COLUMN product_images.created_at IS 'When the image was created';
COMMENT ON COLUMN product_images.updated_at IS 'When the image was last updated';
