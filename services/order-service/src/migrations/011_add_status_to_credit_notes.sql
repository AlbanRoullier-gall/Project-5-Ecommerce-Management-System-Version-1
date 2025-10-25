-- Migration 011: Add status to credit_notes table
ALTER TABLE credit_notes
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending';

-- Add a check constraint for valid status values
ALTER TABLE credit_notes
ADD CONSTRAINT chk_credit_note_status CHECK (status IN ('pending', 'refunded'));

-- Add an index for faster lookups by status
CREATE INDEX idx_credit_notes_status ON credit_notes (status);
