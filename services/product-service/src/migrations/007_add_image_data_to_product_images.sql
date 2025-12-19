-- Migration: Add image_data column to product_images table
-- Description: Adds a BYTEA column to store image binary data directly in the database
--              Makes file_path optional to support both storage methods during transition

-- Add image_data column to store binary image data
ALTER TABLE product_images 
ADD COLUMN IF NOT EXISTS image_data BYTEA;

-- Make file_path nullable to support both storage methods
-- Existing rows will keep their file_path, new rows can use image_data instead
ALTER TABLE product_images 
ALTER COLUMN file_path DROP NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN product_images.image_data IS 'Binary image data stored directly in the database (BYTEA format)';
COMMENT ON COLUMN product_images.file_path IS 'Path to image file on filesystem (optional, used for backward compatibility)';
