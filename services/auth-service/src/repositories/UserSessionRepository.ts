/**
 * UserSessionRepository
 * Data access layer for UserSession entities
 */
import { Pool } from "pg";
import { UserSession } from "../models/UserSession";
import { UserSessionData } from "../types";

export class UserSessionRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Get session by ID
   * @param {number} id Session ID
   * @returns {Promise<UserSession|null>} Session or null
   */
  async getById(id: number): Promise<UserSession | null> {
    try {
      const query = `
        SELECT session_id, user_id, token_hash, expires_at, created_at
        FROM user_sessions 
        WHERE session_id = $1
      `;
      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return new UserSession(result.rows[0] as UserSessionData);
    } catch (error) {
      console.error("Error getting session by ID:", error);
      throw error;
    }
  }

  /**
   * Get session by token hash
   * @param {string} tokenHash Token hash
   * @returns {Promise<UserSession|null>} Session or null
   */
  async getByTokenHash(tokenHash: string): Promise<UserSession | null> {
    try {
      const query = `
        SELECT session_id, user_id, token_hash, expires_at, created_at
        FROM user_sessions 
        WHERE token_hash = $1
      `;
      const result = await this.pool.query(query, [tokenHash]);

      if (result.rows.length === 0) {
        return null;
      }

      return new UserSession(result.rows[0] as UserSessionData);
    } catch (error) {
      console.error("Error getting session by token hash:", error);
      throw error;
    }
  }

  /**
   * List sessions by user
   * @param {number} userId User ID
   * @returns {Promise<UserSession[]>} List of sessions
   */
  async listByUser(userId: number): Promise<UserSession[]> {
    try {
      const query = `
        SELECT session_id, user_id, token_hash, expires_at, created_at
        FROM user_sessions 
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query, [userId]);

      return result.rows.map((row) => new UserSession(row as UserSessionData));
    } catch (error) {
      console.error("Error listing sessions by user:", error);
      throw error;
    }
  }

  /**
   * List active sessions by user
   * @param {number} userId User ID
   * @returns {Promise<UserSession[]>} List of active sessions
   */
  async listActiveByUser(userId: number): Promise<UserSession[]> {
    try {
      const query = `
        SELECT session_id, user_id, token_hash, expires_at, created_at
        FROM user_sessions 
        WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query, [userId]);

      return result.rows.map((row) => new UserSession(row as UserSessionData));
    } catch (error) {
      console.error("Error listing active sessions by user:", error);
      throw error;
    }
  }

  /**
   * Save new session
   * @param {UserSession} session Session to save
   * @returns {Promise<UserSession>} Saved session
   */
  async save(session: UserSession): Promise<UserSession> {
    try {
      const query = `
        INSERT INTO user_sessions (user_id, token_hash, expires_at)
        VALUES ($1, $2, $3)
        RETURNING session_id, user_id, token_hash, expires_at, created_at
      `;
      const values = [session.userId, session.tokenHash, session.expiresAt];

      const result = await this.pool.query(query, values);
      return new UserSession(result.rows[0] as UserSessionData);
    } catch (error) {
      console.error("Error saving session:", error);
      throw error;
    }
  }

  /**
   * Update session
   * @param {UserSession} session Session to update
   * @returns {Promise<UserSession>} Updated session
   */
  async update(session: UserSession): Promise<UserSession> {
    try {
      const query = `
        UPDATE user_sessions 
        SET user_id = $1, token_hash = $2, expires_at = $3
        WHERE session_id = $4
        RETURNING session_id, user_id, token_hash, expires_at, created_at
      `;
      const values = [
        session.userId,
        session.tokenHash,
        session.expiresAt,
        session.sessionId,
      ];

      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error("Session not found");
      }

      return new UserSession(result.rows[0] as UserSessionData);
    } catch (error) {
      console.error("Error updating session:", error);
      throw error;
    }
  }

  /**
   * Delete session
   * @param {UserSession} session Session to delete
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(session: UserSession): Promise<boolean> {
    try {
      const query = "DELETE FROM user_sessions WHERE session_id = $1";
      const result = await this.pool.query(query, [session.sessionId]);

      return result.rowCount! > 0;
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  }

  /**
   * Delete session by ID
   * @param {number} sessionId Session ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteById(sessionId: number): Promise<boolean> {
    try {
      const query = "DELETE FROM user_sessions WHERE session_id = $1";
      const result = await this.pool.query(query, [sessionId]);

      return result.rowCount! > 0;
    } catch (error) {
      console.error("Error deleting session by ID:", error);
      throw error;
    }
  }

  /**
   * Delete all sessions for a user
   * @param {number} userId User ID
   * @returns {Promise<number>} Number of deleted sessions
   */
  async deleteByUser(userId: number): Promise<number> {
    try {
      const query = "DELETE FROM user_sessions WHERE user_id = $1";
      const result = await this.pool.query(query, [userId]);

      return result.rowCount!;
    } catch (error) {
      console.error("Error deleting sessions by user:", error);
      throw error;
    }
  }

  /**
   * Delete expired sessions
   * @returns {Promise<number>} Number of deleted sessions
   */
  async deleteExpired(): Promise<number> {
    try {
      const query =
        "DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP";
      const result = await this.pool.query(query);

      return result.rowCount!;
    } catch (error) {
      console.error("Error deleting expired sessions:", error);
      throw error;
    }
  }

  /**
   * Count active sessions for a user
   * @param {number} userId User ID
   * @returns {Promise<number>} Number of active sessions
   */
  async countActiveByUser(userId: number): Promise<number> {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM user_sessions 
        WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
      `;
      const result = await this.pool.query(query, [userId]);

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Error counting active sessions:", error);
      throw error;
    }
  }
}
