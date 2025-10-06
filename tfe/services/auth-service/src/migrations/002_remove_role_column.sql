-- Migration 002: Remove role column - Admin only system
-- Description: Simplifies authentication to admin-only users

-- Drop the index on role column
DROP INDEX IF EXISTS idx_users_role;

-- Drop the role column
ALTER TABLE users DROP COLUMN IF EXISTS role;

-- Add comment to document the change
COMMENT ON TABLE users IS 'User table - Admin only system (role column removed)';

