-- Migration: Create categories table
-- Description: Creates the reference table for product categories

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for fast lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Add comments for documentation
COMMENT ON TABLE categories IS 'Reference table for product categories';
COMMENT ON COLUMN categories.id IS 'Primary key for the category';
COMMENT ON COLUMN categories.name IS 'Name of the category';
COMMENT ON COLUMN categories.description IS 'Description of the category';
COMMENT ON COLUMN categories.created_at IS 'When the category was created';
COMMENT ON COLUMN categories.updated_at IS 'When the category was last updated';

-- Insert default categories
INSERT INTO categories (name, description) VALUES 
    ('Electronics', 'Electronic devices and accessories'),
    ('Clothing', 'Clothing and fashion items'),
    ('Books', 'Books and educational materials'),
    ('Home & Garden', 'Home and garden products'),
    ('Sports', 'Sports and fitness equipment'),
    ('Toys', 'Toys and games'),
    ('Beauty', 'Beauty and personal care products'),
    ('Automotive', 'Automotive parts and accessories'),
    ('Food & Beverages', 'Food and beverage products'),
    ('Health', 'Health and wellness products')
ON CONFLICT DO NOTHING;
