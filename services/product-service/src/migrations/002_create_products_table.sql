-- Migration: Create products table
-- Description: Creates the main table for products

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    vat_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for fast lookups
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Create index on category_id for filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- Create index on price for sorting
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at);

-- Add comments for documentation
COMMENT ON TABLE products IS 'Main table for products';
COMMENT ON COLUMN products.id IS 'Primary key for the product';
COMMENT ON COLUMN products.name IS 'Name of the product';
COMMENT ON COLUMN products.description IS 'Description of the product';
COMMENT ON COLUMN products.price IS 'Price of the product (excluding VAT)';
COMMENT ON COLUMN products.vat_rate IS 'VAT rate percentage';
COMMENT ON COLUMN products.category_id IS 'Reference to product category';
COMMENT ON COLUMN products.is_active IS 'Whether the product is active';
COMMENT ON COLUMN products.created_at IS 'When the product was created';
COMMENT ON COLUMN products.updated_at IS 'When the product was last updated';
