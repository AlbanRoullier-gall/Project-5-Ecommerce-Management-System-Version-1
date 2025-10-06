-- Migration 006: Create triggers for automatic timestamp management
-- Order Service Database Schema - Triggers

-- Create the trigger function for automatic updated_at management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for orders table
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for order_items table
CREATE TRIGGER update_order_items_updated_at 
    BEFORE UPDATE ON order_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for credit_notes table
CREATE TRIGGER update_credit_notes_updated_at 
    BEFORE UPDATE ON credit_notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for credit_note_items table
CREATE TRIGGER update_credit_note_items_updated_at 
    BEFORE UPDATE ON credit_note_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for order_addresses table
CREATE TRIGGER update_order_addresses_updated_at 
    BEFORE UPDATE ON order_addresses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON FUNCTION update_updated_at_column() IS 'Function to automatically update updated_at timestamp';
COMMENT ON TRIGGER update_orders_updated_at ON orders IS 'Automatically updates updated_at when order is modified';
COMMENT ON TRIGGER update_order_items_updated_at ON order_items IS 'Automatically updates updated_at when order item is modified';
COMMENT ON TRIGGER update_credit_notes_updated_at ON credit_notes IS 'Automatically updates updated_at when credit note is modified';
COMMENT ON TRIGGER update_credit_note_items_updated_at ON credit_note_items IS 'Automatically updates updated_at when credit note item is modified';
COMMENT ON TRIGGER update_order_addresses_updated_at ON order_addresses IS 'Automatically updates updated_at when order address is modified';
