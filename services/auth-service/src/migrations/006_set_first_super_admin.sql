-- services/auth-service/src/migrations/006_set_first_super_admin.sql

-- Migration pour définir le premier super administrateur
-- Description: Crée ou met à jour l'utilisateur avec l'email alban-roullier-gall@hotmail.com comme super admin
-- Mot de passe: xX4501004& (hashé avec bcryptjs, rounds=12)
-- 
-- NOTE: Cette migration s'exécute AVANT la migration 007 qui remplace is_backoffice_approved 
-- par backoffice_status. Donc on utilise is_backoffice_approved ici.
-- Si les colonnes n'existent plus (migration déjà exécutée), cette migration est ignorée.

-- Vérifier si les colonnes is_backoffice_approved existent encore
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_backoffice_approved'
    ) THEN
        -- Créer l'utilisateur s'il n'existe pas, sinon le mettre à jour
        -- Hash du mot de passe "xX4501004&" généré avec bcryptjs (12 rounds, comme dans User.hashPassword)
        INSERT INTO users (
            email, 
            password_hash, 
            first_name, 
            last_name, 
            is_backoffice_approved, 
            is_backoffice_rejected,
            is_super_admin,
            created_at,
            updated_at
        )
        VALUES (
            'alban-roullier-gall@hotmail.com',
            '$2a$12$Ou.tpdFFyC/efrgMu4Bgwe.al7YXjzI.1ziiXklTD1ov6ccIpf2ky', -- Hash du mot de passe "xX4501004&"
            'Alban',
            'Roullier-Gall',
            TRUE,
            FALSE,
            TRUE,
            NOW(),
            NOW()
        )
        ON CONFLICT (email) 
        DO UPDATE SET
            password_hash = EXCLUDED.password_hash,
            is_super_admin = TRUE,
            is_backoffice_approved = TRUE,
            is_backoffice_rejected = FALSE,
            updated_at = NOW();
    ELSE
        -- Les colonnes n'existent plus, la migration 007 a déjà été exécutée
        -- L'utilisateur sera créé par la migration 009
        RAISE NOTICE 'Migration 007 déjà exécutée, cette migration est ignorée';
    END IF;
END $$;
