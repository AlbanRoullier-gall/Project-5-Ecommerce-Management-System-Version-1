-- Migration : Ajouter la Belgique comme pays par défaut
-- Description : Ajoute la Belgique à la table countries et la définit comme par défaut

-- Insérer la Belgique dans la table countries (seulement si elle n'existe pas)
INSERT INTO countries (country_name) 
SELECT 'Belgique' 
WHERE NOT EXISTS (SELECT 1 FROM countries WHERE country_name = 'Belgique');
