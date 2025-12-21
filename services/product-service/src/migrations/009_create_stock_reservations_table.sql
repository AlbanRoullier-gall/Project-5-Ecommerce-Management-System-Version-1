-- Migration: Create stock_reservations table
-- Description: Creates a table to track temporary stock reservations for cart items
-- This prevents stock from being oversold when multiple clients add items to cart simultaneously

CREATE TABLE IF NOT EXISTS stock_reservations (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'confirmed', 'expired', 'released')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_stock_reservations_product ON stock_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_session ON stock_reservations(session_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_status ON stock_reservations(status);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_expires ON stock_reservations(expires_at);

-- Composite index for common queries (product + status)
CREATE INDEX IF NOT EXISTS idx_stock_reservations_product_status ON stock_reservations(product_id, status);

-- Add comments for documentation
COMMENT ON TABLE stock_reservations IS 'Temporary stock reservations for items in shopping carts';
COMMENT ON COLUMN stock_reservations.id IS 'Primary key for the reservation';
COMMENT ON COLUMN stock_reservations.product_id IS 'Reference to the product being reserved';
COMMENT ON COLUMN stock_reservations.session_id IS 'Shopping cart session ID';
COMMENT ON COLUMN stock_reservations.quantity IS 'Quantity of products reserved';
COMMENT ON COLUMN stock_reservations.status IS 'Reservation status: reserved, confirmed (converted to order), expired, released';
COMMENT ON COLUMN stock_reservations.expires_at IS 'When the reservation expires and stock should be released';
COMMENT ON COLUMN stock_reservations.created_at IS 'When the reservation was created';
COMMENT ON COLUMN stock_reservations.updated_at IS 'When the reservation was last updated';
