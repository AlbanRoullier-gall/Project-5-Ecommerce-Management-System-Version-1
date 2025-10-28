-- Migration : Supprimer les adresses de facturation
-- Description : Supprime toutes les adresses de facturation

-- Supprimer toutes les adresses de facturation
DELETE FROM customer_addresses WHERE address_type = 'billing';
