-- Migration : Ne garder que la Belgique comme pays
-- Description : Supprime tous les pays sauf la Belgique de la table countries

-- Supprimer tous les pays sauf la Belgique
DELETE FROM countries 
WHERE country_name != 'Belgique';

-- S'assurer que la Belgique existe (au cas où elle n'existerait pas)
INSERT INTO countries (country_name) 
SELECT 'Belgique' 
WHERE NOT EXISTS (SELECT 1 FROM countries WHERE country_name = 'Belgique');
