/**
 * UserSession Model
 * Represents a user session in the authentication system
 */
import { UserSessionData, UserSessionPublicDTO } from "../types";

export class UserSession {
  public readonly sessionId: number;
  public readonly userId: number;
  public readonly tokenHash: string;
  public readonly expiresAt: Date;
  public readonly createdAt: Date;

  constructor(data: UserSessionData) {
    this.sessionId = data.session_id!;
    this.userId = data.user_id;
    this.tokenHash = data.token_hash;
    this.expiresAt = data.expires_at;
    this.createdAt = data.created_at!;
  }

  /**
   * Check if session is expired
   * @returns {boolean} True if expired
   */
  isExpired(): boolean {
    return new Date() > new Date(this.expiresAt);
  }

  /**
   * Extend session duration
   * @param {number} duration Duration in milliseconds
   */
  extend(duration: number): void {
    const currentExpiry = new Date(this.expiresAt);
    (this as any).expiresAt = new Date(currentExpiry.getTime() + duration);
  }

  /**
   * Invalidate session (set to expired)
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
   * Check if session is valid (not expired)
   * @returns {boolean} True if valid
   */
  isValid(): boolean {
    return !this.isExpired();
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public session data
   */
  toPublicDTO(): UserSessionPublicDTO {
    return {
      sessionId: this.sessionId,
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
  toDatabaseObject(): UserSessionData {
    return {
      session_id: this.sessionId,
      user_id: this.userId,
      token_hash: this.tokenHash,
      expires_at: this.expiresAt,
      created_at: this.createdAt,
    };
  }
}
