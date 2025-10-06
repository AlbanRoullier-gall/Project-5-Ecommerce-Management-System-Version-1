-- Migration: Create countries table
-- Description: Creates the reference table for countries

CREATE TABLE IF NOT EXISTS countries (
    country_id SERIAL PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on country_name for fast lookups
CREATE INDEX IF NOT EXISTS idx_countries_name ON countries(country_name);

-- Add comments for documentation
COMMENT ON TABLE countries IS 'Reference table for countries';
COMMENT ON COLUMN countries.country_id IS 'Primary key for the country';
COMMENT ON COLUMN countries.country_name IS 'Name of the country';
COMMENT ON COLUMN countries.created_at IS 'When the country was created';

-- Insert default countries
INSERT INTO countries (country_name) VALUES 
    ('France'),
    ('United States'),
    ('United Kingdom'),
    ('Germany'),
    ('Spain'),
    ('Italy'),
    ('Canada'),
    ('Australia'),
    ('Japan'),
    ('China')
ON CONFLICT DO NOTHING;
