/**
 * PasswordResetRepository
 * Data access layer for PasswordReset entities
 */
const PasswordReset = require("../models/PasswordReset");

class PasswordResetRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Get password reset by ID
   * @param {number} id Reset ID
   * @returns {Promise<PasswordReset|null>} Reset or null
   */
  async getById(id) {
    try {
      const query = `
        SELECT reset_id, user_id, reset_token, expires_at, created_at
        FROM password_resets 
        WHERE reset_id = $1
      `;
      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return new PasswordReset(result.rows[0]);
    } catch (error) {
      console.error("Error getting password reset by ID:", error);
      throw error;
    }
  }

  /**
   * Get password reset by token
   * @param {string} token Reset token
   * @returns {Promise<PasswordReset|null>} Reset or null
   */
  async getByToken(token) {
    try {
      const query = `
        SELECT reset_id, user_id, reset_token, expires_at, created_at
        FROM password_resets 
        WHERE reset_token = $1
      `;
      const result = await this.pool.query(query, [token]);

      if (result.rows.length === 0) {
        return null;
      }

      return new PasswordReset(result.rows[0]);
    } catch (error) {
      console.error("Error getting password reset by token:", error);
      throw error;
    }
  }

  /**
   * List password resets by user
   * @param {number} userId User ID
   * @returns {Promise<PasswordReset[]>} List of resets
   */
  async listByUser(userId) {
    try {
      const query = `
        SELECT reset_id, user_id, reset_token, expires_at, created_at
        FROM password_resets 
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query, [userId]);

      return result.rows.map((row) => new PasswordReset(row));
    } catch (error) {
      console.error("Error listing password resets by user:", error);
      throw error;
    }
  }

  /**
   * List active password resets by user
   * @param {number} userId User ID
   * @returns {Promise<PasswordReset[]>} List of active resets
   */
  async listActiveByUser(userId) {
    try {
      const query = `
        SELECT reset_id, user_id, reset_token, expires_at, created_at
        FROM password_resets 
        WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query, [userId]);

      return result.rows.map((row) => new PasswordReset(row));
    } catch (error) {
      console.error("Error listing active password resets by user:", error);
      throw error;
    }
  }

  /**
   * Save new password reset
   * @param {PasswordReset} reset Reset to save
   * @returns {Promise<PasswordReset>} Saved reset
   */
  async save(reset) {
    try {
      const query = `
        INSERT INTO password_resets (user_id, reset_token, expires_at)
        VALUES ($1, $2, $3)
        RETURNING reset_id, user_id, reset_token, expires_at, created_at
      `;
      const values = [reset.userId, reset.resetToken, reset.expiresAt];

      const result = await this.pool.query(query, values);
      return new PasswordReset(result.rows[0]);
    } catch (error) {
      console.error("Error saving password reset:", error);
      throw error;
    }
  }

  /**
   * Update password reset
   * @param {PasswordReset} reset Reset to update
   * @returns {Promise<PasswordReset>} Updated reset
   */
  async update(reset) {
    try {
      const query = `
        UPDATE password_resets 
        SET user_id = $1, reset_token = $2, expires_at = $3
        WHERE reset_id = $4
        RETURNING reset_id, user_id, reset_token, expires_at, created_at
      `;
      const values = [
        reset.userId,
        reset.resetToken,
        reset.expiresAt,
        reset.resetId,
      ];

      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error("Password reset not found");
      }

      return new PasswordReset(result.rows[0]);
    } catch (error) {
      console.error("Error updating password reset:", error);
      throw error;
    }
  }

  /**
   * Delete password reset
   * @param {PasswordReset} reset Reset to delete
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(reset) {
    try {
      const query = "DELETE FROM password_resets WHERE reset_id = $1";
      const result = await this.pool.query(query, [reset.resetId]);

      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting password reset:", error);
      throw error;
    }
  }

  /**
   * Delete password reset by ID
   * @param {number} resetId Reset ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteById(resetId) {
    try {
      const query = "DELETE FROM password_resets WHERE reset_id = $1";
      const result = await this.pool.query(query, [resetId]);

      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting password reset by ID:", error);
      throw error;
    }
  }

  /**
   * Delete all password resets for a user
   * @param {number} userId User ID
   * @returns {Promise<number>} Number of deleted resets
   */
  async deleteByUser(userId) {
    try {
      const query = "DELETE FROM password_resets WHERE user_id = $1";
      const result = await this.pool.query(query, [userId]);

      return result.rowCount;
    } catch (error) {
      console.error("Error deleting password resets by user:", error);
      throw error;
    }
  }

  /**
   * Delete expired password resets
   * @returns {Promise<number>} Number of deleted resets
   */
  async deleteExpired() {
    try {
      const query =
        "DELETE FROM password_resets WHERE expires_at < CURRENT_TIMESTAMP";
      const result = await this.pool.query(query);

      return result.rowCount;
    } catch (error) {
      console.error("Error deleting expired password resets:", error);
      throw error;
    }
  }

  /**
   * Count active password resets for a user
   * @param {number} userId User ID
   * @returns {Promise<number>} Number of active resets
   */
  async countActiveByUser(userId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM password_resets 
        WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
      `;
      const result = await this.pool.query(query, [userId]);

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Error counting active password resets:", error);
      throw error;
    }
  }
}

module.exports = PasswordResetRepository;
