-- services/auth-service/src/migrations/003_add_backoffice_rejection.sql

-- Ajouter la colonne is_backoffice_rejected seulement si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_backoffice_rejected'
    ) THEN
        ALTER TABLE users ADD COLUMN is_backoffice_rejected BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
