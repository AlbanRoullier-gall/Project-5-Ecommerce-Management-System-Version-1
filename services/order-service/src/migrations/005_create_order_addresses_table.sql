-- Migration: Create order_addresses table
-- Description: Creates the table for storing order addresses (shipping/billing)

CREATE TABLE IF NOT EXISTS order_addresses (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('shipping', 'billing')),
    address_snapshot JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on order_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_order_addresses_order ON order_addresses(order_id);

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS idx_order_addresses_type ON order_addresses(type);

-- Add comments for documentation
COMMENT ON TABLE order_addresses IS 'Table for storing order addresses (shipping/billing)';
COMMENT ON COLUMN order_addresses.id IS 'Primary key for the address';
COMMENT ON COLUMN order_addresses.order_id IS 'Reference to the order';
COMMENT ON COLUMN order_addresses.type IS 'Type of address (shipping or billing)';
COMMENT ON COLUMN order_addresses.address_snapshot IS 'JSON snapshot of address data at time of order';
COMMENT ON COLUMN order_addresses.created_at IS 'When the address was created';
COMMENT ON COLUMN order_addresses.updated_at IS 'When the address was last updated';
