-- Migration: Create orders table
-- Description: Creates the main table for orders

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    customer_snapshot JSONB,
    total_amount_ht DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount_ttc DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on customer_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- Create index on payment_method for filtering
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_method);

-- Add comments for documentation
COMMENT ON TABLE orders IS 'Main table for orders';
COMMENT ON COLUMN orders.id IS 'Primary key for the order';
COMMENT ON COLUMN orders.customer_id IS 'Reference to the customer';
COMMENT ON COLUMN orders.customer_snapshot IS 'JSON snapshot of customer data at time of order';
COMMENT ON COLUMN orders.total_amount_ht IS 'Total amount excluding VAT';
COMMENT ON COLUMN orders.total_amount_ttc IS 'Total amount including VAT';
COMMENT ON COLUMN orders.payment_method IS 'Payment method used';
COMMENT ON COLUMN orders.notes IS 'Additional notes for the order';
COMMENT ON COLUMN orders.created_at IS 'When the order was created';
COMMENT ON COLUMN orders.updated_at IS 'When the order was last updated';
