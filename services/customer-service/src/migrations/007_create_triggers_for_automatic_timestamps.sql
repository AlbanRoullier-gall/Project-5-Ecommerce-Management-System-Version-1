-- Migration 007 : Créer des triggers pour la gestion automatique des timestamps
-- Schéma de base de données du service client - Triggers

-- Créer la fonction trigger pour la gestion automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger pour la table customers
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Créer le trigger pour la table customer_addresses
CREATE TRIGGER update_customer_addresses_updated_at 
    BEFORE UPDATE ON customer_addresses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Ajouter des commentaires pour la documentation
COMMENT ON FUNCTION update_updated_at_column() IS 'Function to automatically update updated_at timestamp';
COMMENT ON TRIGGER update_customers_updated_at ON customers IS 'Automatically updates updated_at when customer is modified';
COMMENT ON TRIGGER update_customer_addresses_updated_at ON customer_addresses IS 'Automatically updates updated_at when address is modified';
