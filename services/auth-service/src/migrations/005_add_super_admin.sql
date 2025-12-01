-- services/auth-service/src/migrations/005_add_super_admin.sql

-- Migration pour ajouter le champ is_super_admin à la table users
-- Description: Ajoute le champ is_super_admin pour identifier les super administrateurs

-- Ajouter la colonne is_super_admin seulement si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_super_admin'
    ) THEN
        -- Ajouter la colonne is_super_admin
        ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
        
        -- S'assurer que toutes les valeurs NULL sont FALSE
        UPDATE users 
        SET is_super_admin = FALSE 
        WHERE is_super_admin IS NULL;
        
        -- Rendre la colonne NOT NULL
        ALTER TABLE users ALTER COLUMN is_super_admin SET NOT NULL;
        
        -- Créer un index pour améliorer les performances des requêtes
        CREATE INDEX idx_users_super_admin ON users(is_super_admin);
        
        -- Ajouter un commentaire
        COMMENT ON COLUMN users.is_super_admin IS 'Indique si l''utilisateur est un super administrateur avec accès à la gestion des utilisateurs';
    END IF;
END $$;

