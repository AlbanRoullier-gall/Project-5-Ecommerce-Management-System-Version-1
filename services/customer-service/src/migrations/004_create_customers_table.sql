-- Migration: Create customers table
-- Description: Creates the main table for customer information

CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    civility_id INTEGER NOT NULL REFERENCES civilities(civility_id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    socio_professional_category_id INTEGER NOT NULL REFERENCES socio_professional_categories(category_id),
    phone_number VARCHAR(20),
    birthday DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Create index on first_name and last_name for search
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(first_name, last_name);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_customers_created ON customers(created_at);

-- Add comments for documentation
COMMENT ON TABLE customers IS 'Main table for customer information';
COMMENT ON COLUMN customers.customer_id IS 'Primary key for the customer';
COMMENT ON COLUMN customers.civility_id IS 'Reference to civility';
COMMENT ON COLUMN customers.first_name IS 'First name of the customer';
COMMENT ON COLUMN customers.last_name IS 'Last name of the customer';
COMMENT ON COLUMN customers.email IS 'Email address of the customer';
COMMENT ON COLUMN customers.password_hash IS 'Hashed password of the customer';
COMMENT ON COLUMN customers.socio_professional_category_id IS 'Reference to socio-professional category';
COMMENT ON COLUMN customers.phone_number IS 'Phone number of the customer';
COMMENT ON COLUMN customers.birthday IS 'Birthday of the customer';
COMMENT ON COLUMN customers.is_active IS 'Whether the customer account is active';
COMMENT ON COLUMN customers.created_at IS 'When the customer was created';
COMMENT ON COLUMN customers.updated_at IS 'When the customer was last updated';
