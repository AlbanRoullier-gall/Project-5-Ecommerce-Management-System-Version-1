-- Migration: Create credit_note_items table
-- Description: Creates the table for credit note items

CREATE TABLE IF NOT EXISTS credit_note_items (
    id SERIAL PRIMARY KEY,
    credit_note_id INTEGER NOT NULL REFERENCES credit_notes(id) ON DELETE CASCADE,
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

-- Create index on credit_note_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_credit_note_items_credit_note ON credit_note_items(credit_note_id);

-- Create index on product_id for filtering
CREATE INDEX IF NOT EXISTS idx_credit_note_items_product ON credit_note_items(product_id);

-- Add comments for documentation
COMMENT ON TABLE credit_note_items IS 'Table for credit note items';
COMMENT ON COLUMN credit_note_items.id IS 'Primary key for the credit note item';
COMMENT ON COLUMN credit_note_items.credit_note_id IS 'Reference to the credit note';
COMMENT ON COLUMN credit_note_items.product_id IS 'Reference to the product';
COMMENT ON COLUMN credit_note_items.quantity IS 'Quantity of the product';
COMMENT ON COLUMN credit_note_items.unit_price_ht IS 'Unit price excluding VAT';
COMMENT ON COLUMN credit_note_items.unit_price_ttc IS 'Unit price including VAT';
COMMENT ON COLUMN credit_note_items.vat_rate IS 'VAT rate percentage';
COMMENT ON COLUMN credit_note_items.total_price_ht IS 'Total price excluding VAT';
COMMENT ON COLUMN credit_note_items.total_price_ttc IS 'Total price including VAT';
COMMENT ON COLUMN credit_note_items.created_at IS 'When the credit note item was created';
COMMENT ON COLUMN credit_note_items.updated_at IS 'When the credit note item was last updated';
