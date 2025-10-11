-- Migration: Add product_name column to credit_note_items table
-- Description: Adds a product_name column to store the product name snapshot

DO $$ 
BEGIN
    -- Ajouter la colonne product_name seulement si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_note_items' 
        AND column_name = 'product_name'
    ) THEN
        ALTER TABLE credit_note_items ADD COLUMN product_name VARCHAR(255);
    END IF;
END $$;

