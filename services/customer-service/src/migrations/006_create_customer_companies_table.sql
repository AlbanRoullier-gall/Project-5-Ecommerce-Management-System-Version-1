-- Migration : Créer la table customer_companies
-- Description : Crée la table pour les informations d'entreprise des clients

CREATE TABLE IF NOT EXISTS customer_companies (
    company_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    siret_number VARCHAR(20),
    vat_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur customer_id pour des recherches rapides
CREATE INDEX IF NOT EXISTS idx_customer_companies_customer ON customer_companies(customer_id);

-- Créer un index sur company_name pour la recherche
CREATE INDEX IF NOT EXISTS idx_customer_companies_name ON customer_companies(company_name);

-- Créer un index sur siret_number pour les vérifications d'unicité
CREATE INDEX IF NOT EXISTS idx_customer_companies_siret ON customer_companies(siret_number);

-- Créer un index sur vat_number pour les vérifications d'unicité
CREATE INDEX IF NOT EXISTS idx_customer_companies_vat ON customer_companies(vat_number);

-- Ajouter des commentaires pour la documentation
COMMENT ON TABLE customer_companies IS 'Table for customer company information';
COMMENT ON COLUMN customer_companies.company_id IS 'Primary key for the company';
COMMENT ON COLUMN customer_companies.customer_id IS 'Reference to the customer';
COMMENT ON COLUMN customer_companies.company_name IS 'Name of the company';
COMMENT ON COLUMN customer_companies.siret_number IS 'SIRET number of the company';
COMMENT ON COLUMN customer_companies.vat_number IS 'VAT number of the company';
COMMENT ON COLUMN customer_companies.created_at IS 'When the company was created';
COMMENT ON COLUMN customer_companies.updated_at IS 'When the company was last updated';
