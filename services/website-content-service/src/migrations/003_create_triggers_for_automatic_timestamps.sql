-- Migration 003: Create triggers for automatic timestamp management
-- Website Content Service Database Schema - Triggers

-- Create the trigger function for automatic last_update_timestamp management
CREATE OR REPLACE FUNCTION update_last_update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_update_timestamp = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for website_pages table
CREATE TRIGGER update_website_pages_last_update_timestamp 
    BEFORE UPDATE ON website_pages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_last_update_timestamp_column();

-- Add comments for documentation
COMMENT ON FUNCTION update_last_update_timestamp_column() IS 'Function to automatically update last_update_timestamp';
COMMENT ON TRIGGER update_website_pages_last_update_timestamp ON website_pages IS 'Automatically updates last_update_timestamp when website page is modified';
