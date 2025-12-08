-- Migration: Drop product_image_variants table
-- Description: Supprime la table product_image_variants qui n'est jamais utilisée

-- Supprimer les index d'abord
DROP INDEX IF EXISTS idx_product_image_variants_image;
DROP INDEX IF EXISTS idx_product_image_variants_type;

-- Supprimer la table
DROP TABLE IF EXISTS product_image_variants;
