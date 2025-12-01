-- services/auth-service/src/migrations/006_set_first_super_admin.sql

-- Migration pour définir le premier super administrateur
-- Description: Met à jour l'utilisateur avec l'email alban-roullier-gall@hotmail.com comme super admin

-- Mettre à jour l'utilisateur existant pour le rendre super admin
-- IMPORTANT: Il faut aussi approuver l'utilisateur (is_backoffice_approved = TRUE)
-- car le login vérifie cette condition même pour les super admins
UPDATE users 
SET is_super_admin = TRUE,
    is_backoffice_approved = TRUE,
    is_backoffice_rejected = FALSE,
    updated_at = NOW()
WHERE email = 'alban-roullier-gall@hotmail.com';

-- Vérifier que la mise à jour a été effectuée
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    IF updated_count = 0 THEN
        RAISE NOTICE 'Aucun utilisateur trouvé avec l''email alban-roullier-gall@hotmail.com';
    ELSE
        RAISE NOTICE 'Utilisateur mis à jour avec succès. Nombre de lignes modifiées: %', updated_count;
    END IF;
END $$;

