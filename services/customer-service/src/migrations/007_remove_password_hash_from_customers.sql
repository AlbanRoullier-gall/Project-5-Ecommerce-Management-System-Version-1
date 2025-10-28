-- Migration : Supprimer password_hash de la table customers
-- Description : Supprime la colonne password_hash car le service client ne gère pas l'authentification

-- Supprimer la colonne password_hash de la table customers
ALTER TABLE customers DROP COLUMN IF EXISTS password_hash;

-- Mettre à jour le commentaire pour refléter le changement
COMMENT ON TABLE customers IS 'Main table for customer information (no authentication)';
