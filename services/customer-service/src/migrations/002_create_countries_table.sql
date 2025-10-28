-- Migration : Créer la table countries
-- Description : Crée la table de référence pour les pays

CREATE TABLE IF NOT EXISTS countries (
    country_id SERIAL PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur country_name pour des recherches rapides
CREATE INDEX IF NOT EXISTS idx_countries_name ON countries(country_name);

-- Ajouter des commentaires pour la documentation
COMMENT ON TABLE countries IS 'Reference table for countries';
COMMENT ON COLUMN countries.country_id IS 'Primary key for the country';
COMMENT ON COLUMN countries.country_name IS 'Name of the country';
COMMENT ON COLUMN countries.created_at IS 'When the country was created';

-- Insérer les pays par défaut
INSERT INTO countries (country_name) VALUES 
    ('France'),
    ('United States'),
    ('United Kingdom'),
    ('Germany'),
    ('Spain'),
    ('Italy'),
    ('Canada'),
    ('Australia'),
    ('Japan'),
    ('China')
ON CONFLICT DO NOTHING;
