-- Migration : Supprimer birthday de la table customers
-- Description : Supprime la colonne birthday de la table customers.
--               Cette fonctionnalité n'est plus utilisée.

-- Supprimer la colonne birthday
ALTER TABLE customers
DROP COLUMN IF EXISTS birthday;

-- Mettre à jour les commentaires
COMMENT ON TABLE customers IS 'Main table for customer information';

