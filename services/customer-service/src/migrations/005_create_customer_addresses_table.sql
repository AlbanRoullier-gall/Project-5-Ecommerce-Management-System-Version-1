-- Migration : Créer la table customer_addresses
-- Description : Crée la table pour les adresses des clients

CREATE TABLE IF NOT EXISTS customer_addresses (
    address_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL CHECK (address_type IN ('shipping', 'billing')),
    address TEXT NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country_id INTEGER NOT NULL REFERENCES countries(country_id),
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur customer_id pour des recherches rapides
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON customer_addresses(customer_id);

-- Créer un index sur address_type pour le filtrage
CREATE INDEX IF NOT EXISTS idx_customer_addresses_type ON customer_addresses(address_type);

-- Créer un index sur is_default pour le filtrage
CREATE INDEX IF NOT EXISTS idx_customer_addresses_default ON customer_addresses(is_default);

-- Ajouter des commentaires pour la documentation
COMMENT ON TABLE customer_addresses IS 'Table for customer addresses';
COMMENT ON COLUMN customer_addresses.address_id IS 'Primary key for the address';
COMMENT ON COLUMN customer_addresses.customer_id IS 'Reference to the customer';
COMMENT ON COLUMN customer_addresses.address_type IS 'Type of address (shipping or billing)';
COMMENT ON COLUMN customer_addresses.address IS 'Street address';
COMMENT ON COLUMN customer_addresses.postal_code IS 'Postal code';
COMMENT ON COLUMN customer_addresses.city IS 'City';
COMMENT ON COLUMN customer_addresses.country_id IS 'Reference to country';
COMMENT ON COLUMN customer_addresses.is_default IS 'Whether this is the default address of this type';
COMMENT ON COLUMN customer_addresses.created_at IS 'When the address was created';
COMMENT ON COLUMN customer_addresses.updated_at IS 'When the address was last updated';
