-- Migration: Remove is_active column from users table
-- Description: The is_active column is redundant with backoffice_status.
--              If backoffice_status = 'approved', the user can login.
--              If backoffice_status = 'pending' or 'rejected', the user cannot login.

-- Supprimer l'index sur is_active
DROP INDEX IF EXISTS idx_users_is_active;

-- Supprimer la colonne is_active
ALTER TABLE users 
DROP COLUMN IF EXISTS is_active;

-- Commentaire sur la table
COMMENT ON TABLE users IS 'User table - Active status is determined by backoffice_status';
