-- Migration: Create product_image_variants table
-- Description: Creates the table for product image variants (thumbnails, etc.)

CREATE TABLE IF NOT EXISTS product_image_variants (
    id SERIAL PRIMARY KEY,
    image_id INTEGER NOT NULL REFERENCES product_images(id) ON DELETE CASCADE,
    variant_type VARCHAR(20) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    file_size INTEGER NOT NULL,
    quality INTEGER NOT NULL DEFAULT 90,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on image_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_product_image_variants_image ON product_image_variants(image_id);

-- Create index on variant_type for filtering
CREATE INDEX IF NOT EXISTS idx_product_image_variants_type ON product_image_variants(variant_type);

-- Add comments for documentation
COMMENT ON TABLE product_image_variants IS 'Table for product image variants (thumbnails, etc.)';
COMMENT ON COLUMN product_image_variants.id IS 'Primary key for the variant';
COMMENT ON COLUMN product_image_variants.image_id IS 'Reference to the parent image';
COMMENT ON COLUMN product_image_variants.variant_type IS 'Type of variant (thumbnail, small, medium, large, original)';
COMMENT ON COLUMN product_image_variants.file_path IS 'Path to the variant file';
COMMENT ON COLUMN product_image_variants.width IS 'Width of the variant in pixels';
COMMENT ON COLUMN product_image_variants.height IS 'Height of the variant in pixels';
COMMENT ON COLUMN product_image_variants.file_size IS 'Size of the variant file in bytes';
COMMENT ON COLUMN product_image_variants.quality IS 'Quality of the variant (1-100)';
COMMENT ON COLUMN product_image_variants.created_at IS 'When the variant was created';
