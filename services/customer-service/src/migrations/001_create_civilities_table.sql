-- Migration: Create civilities table
-- Description: Creates the reference table for customer civilities (Mr, Mrs, etc.)

CREATE TABLE IF NOT EXISTS civilities (
    civility_id SERIAL PRIMARY KEY,
    abbreviation VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on abbreviation for fast lookups
CREATE INDEX IF NOT EXISTS idx_civilities_abbreviation ON civilities(abbreviation);

-- Add comments for documentation
COMMENT ON TABLE civilities IS 'Reference table for customer civilities (Mr, Mrs, etc.)';
COMMENT ON COLUMN civilities.civility_id IS 'Primary key for the civility';
COMMENT ON COLUMN civilities.abbreviation IS 'Abbreviation for the civility (Mr, Mrs, etc.)';
COMMENT ON COLUMN civilities.created_at IS 'When the civility was created';

-- Insert default civilities
INSERT INTO civilities (abbreviation) VALUES 
    ('Mr'),
    ('Mrs'),
    ('Ms'),
    ('Dr'),
    ('Prof')
ON CONFLICT DO NOTHING;
