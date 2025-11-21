-- Migration : Supprimer les tables civilities et socio_professional_categories
-- Description : Supprime les tables civilities et socio_professional_categories 
--               et leurs index associés. Ces fonctionnalités ne sont plus utilisées.

-- Supprimer les index de civilities
DROP INDEX IF EXISTS idx_civilities_abbreviation;

-- Supprimer les index de socio_professional_categories
DROP INDEX IF EXISTS idx_socio_professional_categories_name;

-- Supprimer la table civilities
DROP TABLE IF EXISTS civilities;

-- Supprimer la table socio_professional_categories
DROP TABLE IF EXISTS socio_professional_categories;

