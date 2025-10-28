-- Migration : Créer la table civilities
-- Description : Crée la table de référence pour les civilités des clients (M., Mme, etc.)

CREATE TABLE IF NOT EXISTS civilities (
    civility_id SERIAL PRIMARY KEY,
    abbreviation VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur abbreviation pour des recherches rapides
CREATE INDEX IF NOT EXISTS idx_civilities_abbreviation ON civilities(abbreviation);

-- Ajouter des commentaires pour la documentation
COMMENT ON TABLE civilities IS 'Reference table for customer civilities (Mr, Mrs, etc.)';
COMMENT ON COLUMN civilities.civility_id IS 'Primary key for the civility';
COMMENT ON COLUMN civilities.abbreviation IS 'Abbreviation for the civility (Mr, Mrs, etc.)';
COMMENT ON COLUMN civilities.created_at IS 'When the civility was created';

-- Insérer les civilités par défaut
INSERT INTO civilities (abbreviation) VALUES 
    ('Mr'),
    ('Mrs'),
    ('Ms'),
    ('Dr'),
    ('Prof')
ON CONFLICT DO NOTHING;
