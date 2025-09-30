-- Migration 004: Create triggers for automatic timestamp management
-- Product Service Database Schema - Triggers

-- Create the trigger function for automatic updated_at management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for categories table
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for products table
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for product_images table
CREATE TRIGGER update_product_images_updated_at 
    BEFORE UPDATE ON product_images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON FUNCTION update_updated_at_column() IS 'Function to automatically update updated_at timestamp';
COMMENT ON TRIGGER update_categories_updated_at ON categories IS 'Automatically updates updated_at when category is modified';
COMMENT ON TRIGGER update_products_updated_at ON products IS 'Automatically updates updated_at when product is modified';
COMMENT ON TRIGGER update_product_images_updated_at ON product_images IS 'Automatically updates updated_at when product image is modified';
