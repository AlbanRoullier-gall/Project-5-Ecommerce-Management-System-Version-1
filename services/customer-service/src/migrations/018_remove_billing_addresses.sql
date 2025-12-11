-- Migration: Remove billing addresses
-- Description: Removes all billing addresses

-- Delete all billing addresses
DELETE FROM customer_addresses WHERE address_type = 'billing';
