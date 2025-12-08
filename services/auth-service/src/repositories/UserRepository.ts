/**
 * UserRepository
 * Couche d'accès aux données pour les utilisateurs
 *
 * Architecture : Repository pattern
 * - Travaille uniquement avec les modèles User
 * - Correspond exactement à la table users
 * - Pas de logique métier, uniquement l'accès aux données
 */
import { Pool } from "pg";
import { User, UserData } from "../models/User";

export class UserRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Récupérer un utilisateur par ID
   */
  async getById(id: number): Promise<User | null> {
    try {
      const query = `
        SELECT user_id, email, password_hash, first_name, last_name, 
               backoffice_status, is_super_admin, created_at, updated_at
        FROM users 
        WHERE user_id = $1
      `;
      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return new User(result.rows[0] as UserData);
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  }

  /**
   * Récupérer un utilisateur par email
   */
  async getByEmail(email: string): Promise<User | null> {
    try {
      const query = `
        SELECT user_id, email, password_hash, first_name, last_name, 
               backoffice_status, is_super_admin, created_at, updated_at
        FROM users 
        WHERE email = $1
      `;
      const result = await this.pool.query(query, [email.toLowerCase()]);

      if (result.rows.length === 0) {
        return null;
      }

      return new User(result.rows[0] as UserData);
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw error;
    }
  }

  /**
   * Créer un nouvel utilisateur
   */
  async save(user: User): Promise<User> {
    try {
      const query = `
        INSERT INTO users (email, password_hash, first_name, last_name, backoffice_status, is_super_admin)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING user_id, email, password_hash, first_name, last_name, 
                  backoffice_status, is_super_admin, created_at, updated_at
      `;

      const values = [
        user.email,
        user.passwordHash,
        user.firstName,
        user.lastName,
        user.backofficeStatus,
        user.isSuperAdmin,
      ];

      const result = await this.pool.query(query, values);
      return new User(result.rows[0] as UserData);
    } catch (error) {
      console.error("Error saving user:", error);
      throw error;
    }
  }

  /**
   * Mettre à jour un utilisateur
   */
  async update(user: User): Promise<User> {
    try {
      const query = `
        UPDATE users 
        SET email = $1, password_hash = $2, first_name = $3, last_name = $4, 
            backoffice_status = $5, is_super_admin = $6
        WHERE user_id = $7
        RETURNING user_id, email, password_hash, first_name, last_name, 
                  backoffice_status, is_super_admin, created_at, updated_at
      `;

      const values = [
        user.email,
        user.passwordHash,
        user.firstName,
        user.lastName,
        user.backofficeStatus,
        user.isSuperAdmin,
        user.userId,
      ];

      const result = await this.pool.query(query, values);
      return new User(result.rows[0] as UserData);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Supprimer un utilisateur
   */
  async delete(user: User): Promise<boolean> {
    try {
      const query = "DELETE FROM users WHERE user_id = $1";
      const result = await this.pool.query(query, [user.userId]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  /**
   * Créer un utilisateur avec fusion de données
   */
  createUserWithMerge(existingUser: User, updateData: Partial<UserData>): User {
    return new User({
      user_id: existingUser.userId,
      email: updateData.email ?? existingUser.email,
      password_hash: updateData.password_hash ?? existingUser.passwordHash,
      first_name: updateData.first_name ?? existingUser.firstName,
      last_name: updateData.last_name ?? existingUser.lastName,
      backoffice_status:
        updateData.backoffice_status ?? existingUser.backofficeStatus,
      is_super_admin: updateData.is_super_admin ?? existingUser.isSuperAdmin,
      created_at: existingUser.createdAt,
      updated_at: new Date(),
    });
  }

  /**
   * Vérifier si un email existe
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const query = "SELECT 1 FROM users WHERE email = $1";
      const result = await this.pool.query(query, [email.toLowerCase()]);
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking email existence:", error);
      throw error;
    }
  }

  /**
   * Récupérer tous les utilisateurs en attente d'approbation
   * Exclut les super admins de la liste
   */
  async getPendingUsers(): Promise<User[]> {
    try {
      const query = `
        SELECT user_id, email, password_hash, first_name, last_name, 
               backoffice_status, is_super_admin, created_at, updated_at
        FROM users 
        WHERE backoffice_status = 'pending'
          AND is_super_admin = FALSE
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query);
      return result.rows.map((row) => new User(row as UserData));
    } catch (error) {
      console.error("Error getting pending users:", error);
      throw error;
    }
  }

  /**
   * Récupérer tous les utilisateurs
   * Exclut les super admins de la liste pour éviter qu'ils puissent se supprimer ou se modifier
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const query = `
        SELECT user_id, email, password_hash, first_name, last_name, 
               backoffice_status, is_super_admin, created_at, updated_at
        FROM users 
        WHERE is_super_admin = FALSE
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query);
      return result.rows.map((row) => new User(row as UserData));
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  /**
   * Supprimer un utilisateur par ID
   */
  async deleteById(userId: number): Promise<boolean> {
    try {
      const query = "DELETE FROM users WHERE user_id = $1";
      const result = await this.pool.query(query, [userId]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error("Error deleting user by ID:", error);
      throw error;
    }
  }
}
