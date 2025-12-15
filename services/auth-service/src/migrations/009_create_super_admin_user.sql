-- services/auth-service/src/migrations/009_create_super_admin_user.sql

-- Migration pour créer le super administrateur
-- Description: Crée ou met à jour l'utilisateur avec l'email alban-roullier-gall@hotmail.com comme super admin
-- Mot de passe: xX4501004& (hashé avec bcryptjs, rounds=12)
-- 
-- Cette migration s'exécute APRÈS la migration 007 qui remplace is_backoffice_approved 
-- par backoffice_status. Donc on utilise backoffice_status ici.

-- Créer l'utilisateur s'il n'existe pas, sinon le mettre à jour
-- Hash du mot de passe "xX4501004&" généré avec bcryptjs (12 rounds, comme dans User.hashPassword)
INSERT INTO users (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    backoffice_status,
    is_super_admin,
    created_at,
    updated_at
)
VALUES (
    'alban-roullier-gall@hotmail.com',
    '$2a$12$Ou.tpdFFyC/efrgMu4Bgwe.al7YXjzI.1ziiXklTD1ov6ccIpf2ky', -- Hash du mot de passe "xX4501004&"
    'Alban',
    'Roullier-Gall',
    'approved'::backoffice_status,
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    is_super_admin = TRUE,
    backoffice_status = 'approved'::backoffice_status,
    updated_at = NOW();


