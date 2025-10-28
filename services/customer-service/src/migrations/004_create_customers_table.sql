-- Migration : Créer la table customers
-- Description : Crée la table principale pour les informations des clients

CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    civility_id INTEGER NOT NULL REFERENCES civilities(civility_id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    socio_professional_category_id INTEGER NOT NULL REFERENCES socio_professional_categories(category_id),
    phone_number VARCHAR(20),
    birthday DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur email pour des recherches rapides
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Créer un index sur first_name et last_name pour la recherche
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(first_name, last_name);

-- Créer un index sur is_active pour le filtrage
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);

-- Créer un index sur created_at pour le tri
CREATE INDEX IF NOT EXISTS idx_customers_created ON customers(created_at);

-- Ajouter des commentaires pour la documentation
COMMENT ON TABLE customers IS 'Main table for customer information';
COMMENT ON COLUMN customers.customer_id IS 'Primary key for the customer';
COMMENT ON COLUMN customers.civility_id IS 'Reference to civility';
COMMENT ON COLUMN customers.first_name IS 'First name of the customer';
COMMENT ON COLUMN customers.last_name IS 'Last name of the customer';
COMMENT ON COLUMN customers.email IS 'Email address of the customer';
COMMENT ON COLUMN customers.socio_professional_category_id IS 'Reference to socio-professional category';
COMMENT ON COLUMN customers.phone_number IS 'Phone number of the customer';
COMMENT ON COLUMN customers.birthday IS 'Birthday of the customer';
COMMENT ON COLUMN customers.is_active IS 'Whether the customer account is active';
COMMENT ON COLUMN customers.created_at IS 'When the customer was created';
COMMENT ON COLUMN customers.updated_at IS 'When the customer was last updated';
