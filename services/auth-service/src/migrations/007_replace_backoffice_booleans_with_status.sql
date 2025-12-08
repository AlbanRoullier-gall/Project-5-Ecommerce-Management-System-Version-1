-- Migration: Replace is_backoffice_approved and is_backoffice_rejected with backoffice_status
-- Description: Simplifies backoffice access management by using a single status enum instead of two booleans

-- Créer le type enum pour le statut backoffice
CREATE TYPE backoffice_status AS ENUM ('pending', 'approved', 'rejected');

-- Ajouter la nouvelle colonne backoffice_status
ALTER TABLE users 
ADD COLUMN backoffice_status backoffice_status DEFAULT 'pending';

-- Migrer les données existantes
UPDATE users 
SET backoffice_status = CASE 
    WHEN is_backoffice_approved = TRUE THEN 'approved'::backoffice_status
    WHEN is_backoffice_rejected = TRUE THEN 'rejected'::backoffice_status
    ELSE 'pending'::backoffice_status
END;

-- Rendre la colonne NOT NULL après migration
ALTER TABLE users 
ALTER COLUMN backoffice_status SET NOT NULL;

-- Supprimer les anciennes colonnes
DROP INDEX IF EXISTS idx_users_backoffice_approved;
ALTER TABLE users 
DROP COLUMN IF EXISTS is_backoffice_approved,
DROP COLUMN IF EXISTS is_backoffice_rejected;

-- Créer un index sur la nouvelle colonne
CREATE INDEX idx_users_backoffice_status ON users(backoffice_status);

-- Commentaire sur la colonne
COMMENT ON COLUMN users.backoffice_status IS 'Statut d''approbation backoffice: pending, approved, ou rejected';
