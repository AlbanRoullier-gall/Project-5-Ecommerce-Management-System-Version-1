/**
 * PasswordResetRepository
 * Couche d'accès aux données pour les entités PasswordReset
 *
 * PRINCIPES :
 * - Accès aux données uniquement
 * - Travaille avec les Models/Entities
 * - Pas de logique métier
 * - Interface claire avec la base de données
 */
import { Pool } from "pg";
import { PasswordReset } from "../models/PasswordReset";
import { PasswordResetData } from "../models/PasswordReset";

export class PasswordResetRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Obtenir une réinitialisation de mot de passe par ID
   * @param {number} id ID de réinitialisation
   * @returns {Promise<PasswordReset|null>} Réinitialisation ou null
   */
  async getById(id: number): Promise<PasswordReset | null> {
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

      return new PasswordReset(result.rows[0] as PasswordResetData);
    } catch (error) {
      console.error("Error getting password reset by ID:", error);
      throw error;
    }
  }

  /**
   * Obtenir une réinitialisation de mot de passe par token
   * @param {string} token Token de réinitialisation
   * @returns {Promise<PasswordReset|null>} Réinitialisation ou null
   */
  async getByToken(token: string): Promise<PasswordReset | null> {
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

      return new PasswordReset(result.rows[0] as PasswordResetData);
    } catch (error) {
      console.error("Error getting password reset by token:", error);
      throw error;
    }
  }

  /**
   * Lister les réinitialisations de mot de passe par utilisateur
   * @param {number} userId ID utilisateur
   * @returns {Promise<PasswordReset[]>} Liste des réinitialisations
   */
  async listByUser(userId: number): Promise<PasswordReset[]> {
    try {
      const query = `
        SELECT reset_id, user_id, reset_token, expires_at, created_at
        FROM password_resets 
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query, [userId]);

      return result.rows.map(
        (row: any) => new PasswordReset(row as PasswordResetData)
      );
    } catch (error) {
      console.error("Error listing password resets by user:", error);
      throw error;
    }
  }

  /**
   * Lister les réinitialisations de mot de passe actives par utilisateur
   * @param {number} userId ID utilisateur
   * @returns {Promise<PasswordReset[]>} Liste des réinitialisations actives
   */
  async listActiveByUser(userId: number): Promise<PasswordReset[]> {
    try {
      const query = `
        SELECT reset_id, user_id, reset_token, expires_at, created_at
        FROM password_resets 
        WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query, [userId]);

      return result.rows.map(
        (row: any) => new PasswordReset(row as PasswordResetData)
      );
    } catch (error) {
      console.error("Error listing active password resets by user:", error);
      throw error;
    }
  }

  /**
   * Sauvegarder une nouvelle réinitialisation de mot de passe
   * @param {PasswordReset} reset Réinitialisation à sauvegarder
   * @returns {Promise<PasswordReset>} Réinitialisation sauvegardée
   */
  async save(reset: PasswordReset): Promise<PasswordReset> {
    try {
      const query = `
        INSERT INTO password_resets (user_id, reset_token, expires_at)
        VALUES ($1, $2, $3)
        RETURNING reset_id, user_id, reset_token, expires_at, created_at
      `;
      const values = [reset.userId, reset.resetToken, reset.expiresAt];

      const result = await this.pool.query(query, values);
      return new PasswordReset(result.rows[0] as PasswordResetData);
    } catch (error) {
      console.error("Error saving password reset:", error);
      throw error;
    }
  }

  /**
   * Mettre à jour une réinitialisation de mot de passe
   * @param {PasswordReset} reset Réinitialisation à mettre à jour
   * @returns {Promise<PasswordReset>} Réinitialisation mise à jour
   */
  async update(reset: PasswordReset): Promise<PasswordReset> {
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

      return new PasswordReset(result.rows[0] as PasswordResetData);
    } catch (error) {
      console.error("Error updating password reset:", error);
      throw error;
    }
  }

  /**
   * Supprimer une réinitialisation de mot de passe
   * @param {PasswordReset} reset Réinitialisation à supprimer
   * @returns {Promise<boolean>} True si supprimée
   */
  async delete(reset: PasswordReset): Promise<boolean> {
    try {
      const query = "DELETE FROM password_resets WHERE reset_id = $1";
      const result = await this.pool.query(query, [reset.resetId]);

      return result.rowCount! > 0;
    } catch (error) {
      console.error("Error deleting password reset:", error);
      throw error;
    }
  }

  /**
   * Supprimer une réinitialisation de mot de passe par ID
   * @param {number} resetId ID de réinitialisation
   * @returns {Promise<boolean>} True si supprimée
   */
  async deleteById(resetId: number): Promise<boolean> {
    try {
      const query = "DELETE FROM password_resets WHERE reset_id = $1";
      const result = await this.pool.query(query, [resetId]);

      return result.rowCount! > 0;
    } catch (error) {
      console.error("Error deleting password reset by ID:", error);
      throw error;
    }
  }

  /**
   * Supprimer toutes les réinitialisations de mot de passe pour un utilisateur
   * @param {number} userId ID utilisateur
   * @returns {Promise<number>} Nombre de réinitialisations supprimées
   */
  async deleteByUser(userId: number): Promise<number> {
    try {
      const query = "DELETE FROM password_resets WHERE user_id = $1";
      const result = await this.pool.query(query, [userId]);

      return result.rowCount!;
    } catch (error) {
      console.error("Error deleting password resets by user:", error);
      throw error;
    }
  }

  /**
   * Supprimer les réinitialisations de mot de passe expirées
   * @returns {Promise<number>} Nombre de réinitialisations supprimées
   */
  async deleteExpired(): Promise<number> {
    try {
      const query =
        "DELETE FROM password_resets WHERE expires_at < CURRENT_TIMESTAMP";
      const result = await this.pool.query(query);

      return result.rowCount!;
    } catch (error) {
      console.error("Error deleting expired password resets:", error);
      throw error;
    }
  }

  /**
   * Compter les réinitialisations de mot de passe actives pour un utilisateur
   * @param {number} userId ID utilisateur
   * @returns {Promise<number>} Nombre de réinitialisations actives
   */
  async countActiveByUser(userId: number): Promise<number> {
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
