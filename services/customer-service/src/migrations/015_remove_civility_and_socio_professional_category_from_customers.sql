-- Migration : Supprimer civility_id et socio_professional_category_id de la table customers
-- Description : Supprime les colonnes civility_id et socio_professional_category_id 
--               de la table customers et leurs contraintes de clé étrangère.

-- Étape 1: Supprimer la contrainte de clé étrangère pour civility_id
ALTER TABLE customers
DROP CONSTRAINT IF EXISTS customers_civility_id_fkey;

-- Étape 2: Supprimer la contrainte de clé étrangère pour socio_professional_category_id
ALTER TABLE customers
DROP CONSTRAINT IF EXISTS customers_socio_professional_category_id_fkey;

-- Étape 3: Supprimer la colonne civility_id
ALTER TABLE customers
DROP COLUMN IF EXISTS civility_id;

-- Étape 4: Supprimer la colonne socio_professional_category_id
ALTER TABLE customers
DROP COLUMN IF EXISTS socio_professional_category_id;

-- Mettre à jour les commentaires
COMMENT ON TABLE customers IS 'Main table for customer information';

