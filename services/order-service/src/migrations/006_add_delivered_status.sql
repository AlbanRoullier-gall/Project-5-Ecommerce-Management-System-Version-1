-- Migration: Add delivered status to orders
-- Description: Adds a delivered boolean field to track order delivery status

-- Add delivered column to orders table
ALTER TABLE orders ADD COLUMN delivered BOOLEAN NOT NULL DEFAULT false;

-- Create index on delivered for fast filtering
CREATE INDEX IF NOT EXISTS idx_orders_delivered ON orders(delivered);

-- Add comment for documentation
COMMENT ON COLUMN orders.delivered IS 'Whether the order has been delivered';
