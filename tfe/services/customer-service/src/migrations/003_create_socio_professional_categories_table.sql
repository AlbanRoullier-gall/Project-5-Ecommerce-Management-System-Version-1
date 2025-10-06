-- Migration: Create socio_professional_categories table
-- Description: Creates the reference table for socio-professional categories

CREATE TABLE IF NOT EXISTS socio_professional_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on category_name for fast lookups
CREATE INDEX IF NOT EXISTS idx_socio_professional_categories_name ON socio_professional_categories(category_name);

-- Add comments for documentation
COMMENT ON TABLE socio_professional_categories IS 'Reference table for socio-professional categories';
COMMENT ON COLUMN socio_professional_categories.category_id IS 'Primary key for the category';
COMMENT ON COLUMN socio_professional_categories.category_name IS 'Name of the socio-professional category';
COMMENT ON COLUMN socio_professional_categories.created_at IS 'When the category was created';

-- Insert default socio-professional categories
INSERT INTO socio_professional_categories (category_name) VALUES 
    ('Employee'),
    ('Manager'),
    ('Executive'),
    ('Professional'),
    ('Self-employed'),
    ('Student'),
    ('Retired'),
    ('Unemployed'),
    ('Other')
ON CONFLICT DO NOTHING;
