/**
 * PasswordReset Model
 * Represents a password reset request in the authentication system
 */
import crypto from "crypto";
import { PasswordResetData, PasswordResetPublicDTO } from "../types";

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
   * Check if reset token is expired
   * @returns {boolean} True if expired
   */
  isExpired(): boolean {
    return new Date() > new Date(this.expiresAt);
  }

  /**
   * Check if reset token is valid (not expired)
   * @returns {boolean} True if valid
   */
  isValid(): boolean {
    return !this.isExpired();
  }

  /**
   * Invalidate reset token (set to expired)
   */
  invalidate(): void {
    (this as any).expiresAt = new Date();
  }

  /**
   * Get time until expiration in milliseconds
   * @returns {number} Time until expiration
   */
  getTimeUntilExpiration(): number {
    const now = new Date();
    const expiry = new Date(this.expiresAt);
    return expiry.getTime() - now.getTime();
  }

  /**
   * Generate a secure random token
   * @param {number} length Token length
   * @returns {string} Random token
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  /**
   * Hash a reset token for storage
   * @param {string} token Plain token
   * @returns {string} Hashed token
   */
  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Verify a token against its hash
   * @param {string} token Plain token
   * @param {string} hash Token hash
   * @returns {boolean} True if valid
   */
  static verifyToken(token: string, hash: string): boolean {
    return PasswordReset.hashToken(token) === hash;
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public reset data
   */
  toPublicDTO(): PasswordResetPublicDTO {
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
   * Convert to database object
   * @returns {Object} Database object
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
