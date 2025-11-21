-- Migration : Supprimer la table customer_companies
-- Description : Supprime la table customer_companies et ses index associés.
--               Cette fonctionnalité n'est plus utilisée dans l'application.

-- Supprimer les index
DROP INDEX IF EXISTS idx_customer_companies_customer;
DROP INDEX IF EXISTS idx_customer_companies_name;
DROP INDEX IF EXISTS idx_customer_companies_siret;
DROP INDEX IF EXISTS idx_customer_companies_vat;

-- Supprimer la table
DROP TABLE IF EXISTS customer_companies;

