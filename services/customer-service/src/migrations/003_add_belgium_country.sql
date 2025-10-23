-- Migration: Add Belgium as default country
-- Description: Adds Belgium to the countries table and sets it as the default

-- Insert Belgium into countries table (only if it doesn't exist)
INSERT INTO countries (country_name) 
SELECT 'Belgique' 
WHERE NOT EXISTS (SELECT 1 FROM countries WHERE country_name = 'Belgique');
