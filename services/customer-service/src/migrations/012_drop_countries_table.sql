-- Migration : Supprimer la table countries
-- Description : Supprime la table countries car l'application ne gère que la Belgique
-- Le champ country_id reste dans customer_addresses comme simple entier (sans FK)

-- Supprimer la table countries
DROP TABLE IF EXISTS countries CASCADE;

-- Note: CASCADE supprimera aussi les index et contraintes associés s'ils existent encore

