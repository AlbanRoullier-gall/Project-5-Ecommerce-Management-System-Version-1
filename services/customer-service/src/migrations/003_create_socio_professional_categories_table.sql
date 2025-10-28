-- Migration : Créer la table socio_professional_categories
-- Description : Crée la table de référence pour les catégories socio-professionnelles

CREATE TABLE IF NOT EXISTS socio_professional_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur category_name pour des recherches rapides
CREATE INDEX IF NOT EXISTS idx_socio_professional_categories_name ON socio_professional_categories(category_name);

-- Ajouter des commentaires pour la documentation
COMMENT ON TABLE socio_professional_categories IS 'Reference table for socio-professional categories';
COMMENT ON COLUMN socio_professional_categories.category_id IS 'Primary key for the category';
COMMENT ON COLUMN socio_professional_categories.category_name IS 'Name of the socio-professional category';
COMMENT ON COLUMN socio_professional_categories.created_at IS 'When the category was created';

-- Insérer les catégories socio-professionnelles par défaut
INSERT INTO socio_professional_categories (category_name) VALUES 
    ('Employee'),
    ('Manager'),
    ('Executive'),
    ('Professional'),
    ('Self-employed'),
    ('Student'),
    ('Retired'),
    ('Unemployed'),
    ('Other')
ON CONFLICT DO NOTHING;
