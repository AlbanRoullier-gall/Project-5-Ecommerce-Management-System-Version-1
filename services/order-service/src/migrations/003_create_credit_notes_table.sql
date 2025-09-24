-- Migration: Create credit_notes table
-- Description: Creates the table for credit notes

CREATE TABLE IF NOT EXISTS credit_notes (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    total_amount_ht DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount_ttc DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    issue_date DATE,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on customer_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_credit_notes_customer ON credit_notes(customer_id);

-- Create index on order_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_credit_notes_order ON credit_notes(order_id);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_credit_notes_created ON credit_notes(created_at);

-- Add comments for documentation
COMMENT ON TABLE credit_notes IS 'Table for credit notes';
COMMENT ON COLUMN credit_notes.id IS 'Primary key for the credit note';
COMMENT ON COLUMN credit_notes.customer_id IS 'Reference to the customer';
COMMENT ON COLUMN credit_notes.order_id IS 'Reference to the order';
COMMENT ON COLUMN credit_notes.total_amount_ht IS 'Total amount excluding VAT';
COMMENT ON COLUMN credit_notes.total_amount_ttc IS 'Total amount including VAT';
COMMENT ON COLUMN credit_notes.reason IS 'Reason for the credit note';
COMMENT ON COLUMN credit_notes.description IS 'Description of the credit note';
COMMENT ON COLUMN credit_notes.issue_date IS 'Date when the credit note was issued';
COMMENT ON COLUMN credit_notes.payment_method IS 'Payment method for the credit note';
COMMENT ON COLUMN credit_notes.notes IS 'Additional notes for the credit note';
COMMENT ON COLUMN credit_notes.created_at IS 'When the credit note was created';
COMMENT ON COLUMN credit_notes.updated_at IS 'When the credit note was last updated';
