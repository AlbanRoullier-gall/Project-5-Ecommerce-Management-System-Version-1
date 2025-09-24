-- Migration: Create order_items table
-- Description: Creates the table for order items

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price_ht DECIMAL(10,2) NOT NULL,
    unit_price_ttc DECIMAL(10,2) NOT NULL,
    vat_rate DECIMAL(5,2) NOT NULL,
    total_price_ht DECIMAL(10,2) NOT NULL,
    total_price_ttc DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on order_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Create index on product_id for filtering
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Add comments for documentation
COMMENT ON TABLE order_items IS 'Table for order items';
COMMENT ON COLUMN order_items.id IS 'Primary key for the order item';
COMMENT ON COLUMN order_items.order_id IS 'Reference to the order';
COMMENT ON COLUMN order_items.product_id IS 'Reference to the product';
COMMENT ON COLUMN order_items.quantity IS 'Quantity of the product';
COMMENT ON COLUMN order_items.unit_price_ht IS 'Unit price excluding VAT';
COMMENT ON COLUMN order_items.unit_price_ttc IS 'Unit price including VAT';
COMMENT ON COLUMN order_items.vat_rate IS 'VAT rate percentage';
COMMENT ON COLUMN order_items.total_price_ht IS 'Total price excluding VAT';
COMMENT ON COLUMN order_items.total_price_ttc IS 'Total price including VAT';
COMMENT ON COLUMN order_items.created_at IS 'When the order item was created';
COMMENT ON COLUMN order_items.updated_at IS 'When the order item was last updated';
