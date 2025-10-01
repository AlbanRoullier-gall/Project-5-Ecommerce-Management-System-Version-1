/**
 * UserRepository
 * Data access layer for User entities
 */
const User = require("../models/User");

class UserRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Get user by ID
   * @param {number} id User ID
   * @returns {Promise<User|null>} User or null
   */
  async getById(id) {
    try {
      const query = `
        SELECT user_id, email, password_hash, first_name, last_name, role, 
               is_active, created_at, updated_at
        FROM users 
        WHERE user_id = $1
      `;
      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return new User(result.rows[0]);
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  }

  /**
   * Get user by email
   * @param {string} email User email
   * @returns {Promise<User|null>} User or null
   */
  async getByEmail(email) {
    try {
      const query = `
        SELECT user_id, email, password_hash, first_name, last_name, role, 
               is_active, created_at, updated_at
        FROM users 
        WHERE email = $1
      `;
      const result = await this.pool.query(query, [email.toLowerCase()]);

      if (result.rows.length === 0) {
        return null;
      }

      return new User(result.rows[0]);
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw error;
    }
  }

  /**
   * List all active users
   * @returns {Promise<User[]>} List of users
   */
  async listAllActive() {
    try {
      const query = `
        SELECT user_id, email, password_hash, first_name, last_name, role, 
               is_active, created_at, updated_at
        FROM users 
        WHERE is_active = true
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query);

      return result.rows.map((row) => new User(row));
    } catch (error) {
      console.error("Error listing active users:", error);
      throw error;
    }
  }

  /**
   * List users by role
   * @param {string} role User role
   * @returns {Promise<User[]>} List of users
   */
  async listByRole(role) {
    try {
      const query = `
        SELECT user_id, email, password_hash, first_name, last_name, role, 
               is_active, created_at, updated_at
        FROM users 
        WHERE role = $1 AND is_active = true
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query, [role]);

      return result.rows.map((row) => new User(row));
    } catch (error) {
      console.error("Error listing users by role:", error);
      throw error;
    }
  }

  /**
   * Save new user
   * @param {User} user User to save
   * @returns {Promise<User>} Saved user
   */
  async save(user) {
    try {
      const query = `
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING user_id, email, password_hash, first_name, last_name, role, 
                  is_active, created_at, updated_at
      `;
      const values = [
        user.email.toLowerCase(),
        user.passwordHash,
        user.firstName,
        user.lastName,
        user.role,
        user.isActive,
      ];

      const result = await this.pool.query(query, values);
      return new User(result.rows[0]);
    } catch (error) {
      console.error("Error saving user:", error);
      throw error;
    }
  }

  /**
   * Update user
   * @param {User} user User to update
   * @returns {Promise<User>} Updated user
   */
  async update(user) {
    try {
      const query = `
        UPDATE users 
        SET email = $1, password_hash = $2, first_name = $3, last_name = $4, 
            role = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $7
        RETURNING user_id, email, password_hash, first_name, last_name, role, 
                  is_active, created_at, updated_at
      `;
      const values = [
        user.email.toLowerCase(),
        user.passwordHash,
        user.firstName,
        user.lastName,
        user.role,
        user.isActive,
        user.userId,
      ];

      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error("User not found");
      }

      return new User(result.rows[0]);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {User} user User to delete
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(user) {
    try {
      const query = "DELETE FROM users WHERE user_id = $1";
      const result = await this.pool.query(query, [user.userId]);

      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  /**
   * Check if email exists
   * @param {string} email Email to check
   * @returns {Promise<boolean>} True if exists
   */
  async existsByEmail(email) {
    try {
      const query = "SELECT 1 FROM users WHERE email = $1 LIMIT 1";
      const result = await this.pool.query(query, [email.toLowerCase()]);

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking email existence:", error);
      throw error;
    }
  }

  /**
   * Update user password
   * @param {number} userId User ID
   * @param {string} passwordHash New password hash
   * @returns {Promise<boolean>} True if updated
   */
  async updatePassword(userId, passwordHash) {
    try {
      const query = `
        UPDATE users 
        SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
      `;
      const result = await this.pool.query(query, [passwordHash, userId]);

      return result.rowCount > 0;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  }

  /**
   * Activate user
   * @param {number} userId User ID
   * @returns {Promise<boolean>} True if activated
   */
  async activate(userId) {
    try {
      const query = `
        UPDATE users 
        SET is_active = true, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `;
      const result = await this.pool.query(query, [userId]);

      return result.rowCount > 0;
    } catch (error) {
      console.error("Error activating user:", error);
      throw error;
    }
  }

  /**
   * Deactivate user
   * @param {number} userId User ID
   * @returns {Promise<boolean>} True if deactivated
   */
  async deactivate(userId) {
    try {
      const query = `
        UPDATE users 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `;
      const result = await this.pool.query(query, [userId]);

      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deactivating user:", error);
      throw error;
    }
  }
}

module.exports = UserRepository;
