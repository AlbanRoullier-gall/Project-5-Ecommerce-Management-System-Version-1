/**
 * User Model
 * Représente un utilisateur dans le système d'authentification
 *
 * Architecture : Modèle centré sur la base de données
 * - Correspond exactement à la table `users`
 * - Contient la logique métier de l'utilisateur
 * - Validation et transformation des données
 */
import bcrypt from "bcryptjs";

/**
 * Interface correspondant exactement à la table users
 */
export interface UserData {
  user_id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_backoffice_approved: boolean;
  is_backoffice_rejected: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Résultat de validation du mot de passe
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Classe User - Modèle principal
 * Correspond exactement à la structure de la base de données
 */
export class User {
  public readonly userId: number;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly isActive: boolean;
  public readonly isBackofficeApproved: boolean;
  public readonly isBackofficeRejected: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: UserData) {
    this.userId = data.user_id;
    this.email = data.email;
    this.passwordHash = data.password_hash;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.isActive = data.is_active;
    this.isBackofficeApproved = data.is_backoffice_approved;
    this.isBackofficeRejected = data.is_backoffice_rejected;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  /**
   * Vérifier un mot de passe
   */
  async verifyPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.passwordHash);
  }

  /**
   * Hasher un mot de passe
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Valider la force d'un mot de passe
   */
  static validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Le mot de passe doit contenir au moins 8 caractères");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une majuscule");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une minuscule");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un chiffre");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push(
        "Le mot de passe doit contenir au moins un caractère spécial"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valider un email
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
