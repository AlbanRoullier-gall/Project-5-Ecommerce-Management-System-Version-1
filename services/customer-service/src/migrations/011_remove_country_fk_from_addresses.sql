-- Migration : Supprimer la contrainte de clé étrangère country_id dans customer_addresses
-- Description : Supprime la référence vers la table countries pour simplifier l'architecture
-- L'application ne gère que la Belgique, donc on n'a plus besoin de cette contrainte

-- Supprimer la contrainte de clé étrangère country_id
ALTER TABLE customer_addresses 
DROP CONSTRAINT IF EXISTS customer_addresses_country_id_fkey;

-- Le champ country_id reste dans la table mais sans contrainte de clé étrangère
-- Il sera toujours utilisé pour stocker l'ID de la Belgique (valeur constante)

