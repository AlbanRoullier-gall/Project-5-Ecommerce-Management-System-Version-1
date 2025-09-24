-- Migration 003: Create password_resets table

CREATE TABLE IF NOT EXISTS password_resets (
    reset_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    reset_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_password_resets_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_reset_token ON password_resets(reset_token);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_resets_created_at ON password_resets(created_at);

-- Index for cleanup queries (removed problematic WHERE clause)
CREATE INDEX IF NOT EXISTS idx_password_resets_expired ON password_resets(expires_at);
