-- Migration: Fix credit_note_items table structure
-- Description: Migrates from old structure (unit_price, total_price) to new structure (HT/TTC/VAT)

DO $$ 
BEGIN
    -- Ajouter les nouvelles colonnes si elles n'existent pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_note_items' 
        AND column_name = 'unit_price_ht'
    ) THEN
        ALTER TABLE credit_note_items ADD COLUMN unit_price_ht DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_note_items' 
        AND column_name = 'unit_price_ttc'
    ) THEN
        ALTER TABLE credit_note_items ADD COLUMN unit_price_ttc DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_note_items' 
        AND column_name = 'vat_rate'
    ) THEN
        ALTER TABLE credit_note_items ADD COLUMN vat_rate DECIMAL(5,2) DEFAULT 21.00;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_note_items' 
        AND column_name = 'total_price_ht'
    ) THEN
        ALTER TABLE credit_note_items ADD COLUMN total_price_ht DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_note_items' 
        AND column_name = 'total_price_ttc'
    ) THEN
        ALTER TABLE credit_note_items ADD COLUMN total_price_ttc DECIMAL(10,2);
    END IF;
END $$;

-- Migrer les données existantes si les anciennes colonnes existent encore
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_note_items' 
        AND column_name = 'unit_price'
    ) THEN
        -- Calculer les valeurs HT/TTC à partir des anciennes colonnes
        -- Supposons que les anciennes valeurs étaient en TTC avec 21% de TVA
        UPDATE credit_note_items
        SET 
            unit_price_ht = unit_price / 1.21,
            unit_price_ttc = unit_price,
            total_price_ht = total_price / 1.21,
            total_price_ttc = total_price,
            vat_rate = 21.00
        WHERE unit_price_ht IS NULL;

        -- Supprimer les anciennes colonnes
        ALTER TABLE credit_note_items DROP COLUMN IF EXISTS unit_price;
        ALTER TABLE credit_note_items DROP COLUMN IF EXISTS total_price;
    END IF;
END $$;

-- Rendre les colonnes NOT NULL après migration des données
ALTER TABLE credit_note_items 
    ALTER COLUMN unit_price_ht SET NOT NULL,
    ALTER COLUMN unit_price_ttc SET NOT NULL,
    ALTER COLUMN vat_rate SET NOT NULL,
    ALTER COLUMN total_price_ht SET NOT NULL,
    ALTER COLUMN total_price_ttc SET NOT NULL;

