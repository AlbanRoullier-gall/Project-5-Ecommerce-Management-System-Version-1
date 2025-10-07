-- Migration pour ajouter le champ d'approbation backoffice
-- Date: 2024-01-15
-- Description: Ajoute le champ is_backoffice_approved à la table users

-- Ajouter la colonne is_backoffice_approved
ALTER TABLE users 
ADD COLUMN is_backoffice_approved BOOLEAN DEFAULT FALSE;

-- Mettre à jour les utilisateurs existants (ils ne sont pas approuvés par défaut)
UPDATE users 
SET is_backoffice_approved = FALSE 
WHERE is_backoffice_approved IS NULL;

-- Rendre la colonne NOT NULL après avoir mis à jour les valeurs existantes
ALTER TABLE users 
ALTER COLUMN is_backoffice_approved SET NOT NULL;

-- Ajouter un index pour optimiser les requêtes d'approbation
CREATE INDEX idx_users_backoffice_approved ON users(is_backoffice_approved);

-- Commentaire sur la colonne
COMMENT ON COLUMN users.is_backoffice_approved IS 'Indique si l''utilisateur est approuvé pour accéder au backoffice';
