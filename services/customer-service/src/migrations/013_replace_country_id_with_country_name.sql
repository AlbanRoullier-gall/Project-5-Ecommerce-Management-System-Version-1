-- Migration : Remplacer country_id par country_name dans customer_addresses
-- Description : Remplace la colonne country_id par country_name pour simplifier
-- L'application ne gère que la Belgique, donc on stocke directement "Belgique"

-- Ajouter la nouvelle colonne country_name
ALTER TABLE customer_addresses 
ADD COLUMN IF NOT EXISTS country_name VARCHAR(100);

-- Mettre à jour toutes les adresses existantes avec "Belgique"
-- (Dans une vraie migration, on devrait convertir les IDs mais ici on sait que c'est toujours la Belgique)
UPDATE customer_addresses 
SET country_name = 'Belgique'
WHERE country_name IS NULL;

-- Définir country_name comme NOT NULL avec valeur par défaut
ALTER TABLE customer_addresses 
ALTER COLUMN country_name SET DEFAULT 'Belgique',
ALTER COLUMN country_name SET NOT NULL;

-- Supprimer l'ancienne colonne country_id
ALTER TABLE customer_addresses 
DROP COLUMN IF EXISTS country_id;

-- Ajouter un commentaire
COMMENT ON COLUMN customer_addresses.country_name IS 'Country name (always "Belgique")';

