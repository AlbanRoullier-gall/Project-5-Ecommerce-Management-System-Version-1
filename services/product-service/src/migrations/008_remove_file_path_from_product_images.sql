-- Migration: Remove file_path column from product_images table
-- Description: Removes the file_path column as all images are now stored in image_data (BYTEA)
--              This migration assumes all existing images have been migrated to image_data

-- Drop the file_path column
ALTER TABLE product_images 
DROP COLUMN IF EXISTS file_path;

-- Remove the comment (no longer needed)
COMMENT ON TABLE product_images IS 'Table for product images stored in database (image_data BYTEA)';
