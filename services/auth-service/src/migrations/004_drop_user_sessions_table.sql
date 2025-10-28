-- Migration 004: Drop user_sessions table
-- Suppression de la table user_sessions car nous utilisons JWT stateless

-- Supprimer les index d'abord
DROP INDEX IF EXISTS idx_user_sessions_user_id;
DROP INDEX IF EXISTS idx_user_sessions_token_hash;
DROP INDEX IF EXISTS idx_user_sessions_expires_at;
DROP INDEX IF EXISTS idx_user_sessions_created_at;
DROP INDEX IF EXISTS idx_user_sessions_expired;

-- Supprimer la table user_sessions
DROP TABLE IF EXISTS user_sessions;
