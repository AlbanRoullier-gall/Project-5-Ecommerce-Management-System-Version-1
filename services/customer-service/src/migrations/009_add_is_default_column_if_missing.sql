-- Migration corrective : Ajouter la colonne is_default si elle n'existe pas
-- Description : Cette migration ajoute la colonne is_default à la table customer_addresses
--                si elle n'existe pas déjà (pour corriger les bases de données existantes)

-- Vérifier si la colonne existe et l'ajouter si nécessaire
DO $$
BEGIN
  -- Vérifier si la colonne is_default n'existe pas
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'customer_addresses'
      AND column_name = 'is_default'
  ) THEN
    -- Ajouter la colonne is_default
    ALTER TABLE customer_addresses
    ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT false;
    
    -- Créer un index sur is_default pour le filtrage
    CREATE INDEX IF NOT EXISTS idx_customer_addresses_default ON customer_addresses(is_default);
    
    -- Ajouter un commentaire pour la documentation
    COMMENT ON COLUMN customer_addresses.is_default IS 'Whether this is the default address of this type';
    
    RAISE NOTICE 'Colonne is_default ajoutée à la table customer_addresses';
  ELSE
    RAISE NOTICE 'Colonne is_default existe déjà dans la table customer_addresses';
  END IF;
END $$;

