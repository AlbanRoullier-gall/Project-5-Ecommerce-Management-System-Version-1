-- Migration 007: Create triggers for automatic timestamp management
-- Customer Service Database Schema - Triggers

-- Create the trigger function for automatic updated_at management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for customers table
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for customer_addresses table
CREATE TRIGGER update_customer_addresses_updated_at 
    BEFORE UPDATE ON customer_addresses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for customer_companies table
CREATE TRIGGER update_customer_companies_updated_at 
    BEFORE UPDATE ON customer_companies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON FUNCTION update_updated_at_column() IS 'Function to automatically update updated_at timestamp';
COMMENT ON TRIGGER update_customers_updated_at ON customers IS 'Automatically updates updated_at when customer is modified';
COMMENT ON TRIGGER update_customer_addresses_updated_at ON customer_addresses IS 'Automatically updates updated_at when address is modified';
COMMENT ON TRIGGER update_customer_companies_updated_at ON customer_companies IS 'Automatically updates updated_at when company is modified';
