/**
 * Modèle PasswordReset
 * Représente une demande de réinitialisation de mot de passe dans le système d'authentification
 *
 * PRINCIPES :
 * - Contient la logique métier des réinitialisations
 * - Validation des données
 * - Méthodes de transformation
 * - Pas de logique d'accès aux données
 */
import crypto from "crypto";
// Types de base de données pour PasswordReset
export interface PasswordResetData {
  reset_id: number | null;
  user_id: number;
  reset_token: string;
  expires_at: Date;
  created_at: Date | null;
}

export class PasswordReset {
  public readonly resetId: number;
  public readonly userId: number;
  public readonly resetToken: string;
  public readonly expiresAt: Date;
  public readonly createdAt: Date;

  constructor(data: PasswordResetData) {
    this.resetId = data.reset_id!;
    this.userId = data.user_id;
    this.resetToken = data.reset_token;
    this.expiresAt = data.expires_at;
    this.createdAt = data.created_at!;
  }

  /**
   * Vérifier si le token de réinitialisation est expiré
   * @returns {boolean} True si expiré
   */
  isExpired(): boolean {
    return new Date() > new Date(this.expiresAt);
  }

  /**
   * Vérifier si le token de réinitialisation est valide (non expiré)
   * @returns {boolean} True si valide
   */
  isValid(): boolean {
    return !this.isExpired();
  }

  /**
   * Invalider le token de réinitialisation (le marquer comme expiré)
   */
  invalidate(): void {
    (this as any).expiresAt = new Date();
  }

  /**
   * Obtenir le temps restant jusqu'à l'expiration en millisecondes
   * @returns {number} Temps restant jusqu'à l'expiration
   */
  getTimeUntilExpiration(): number {
    const now = new Date();
    const expiry = new Date(this.expiresAt);
    return expiry.getTime() - now.getTime();
  }

  /**
   * Générer un token aléatoire sécurisé
   * @param {number} length Longueur du token
   * @returns {string} Token aléatoire
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  /**
   * Hasher un token de réinitialisation pour le stockage
   * @param {string} token Token en clair
   * @returns {string} Token hashé
   */
  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Vérifier un token contre son hash
   * @param {string} token Token en clair
   * @param {string} hash Hash du token
   * @returns {boolean} True si valide
   */
  static verifyToken(token: string, hash: string): boolean {
    return PasswordReset.hashToken(token) === hash;
  }

  /**
   * Convertir en objet public
   * @returns {Object} Données de réinitialisation publiques
   */
  toPublicObject() {
    return {
      resetId: this.resetId,
      userId: this.userId,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      isValid: this.isValid(),
      timeUntilExpiration: this.getTimeUntilExpiration(),
    };
  }

  /**
   * Convertir en objet de base de données
   * @returns {Object} Objet de base de données
   */
  toDatabaseObject(): PasswordResetData {
    return {
      reset_id: this.resetId,
      user_id: this.userId,
      reset_token: this.resetToken,
      expires_at: this.expiresAt,
      created_at: this.createdAt,
    };
  }
}
