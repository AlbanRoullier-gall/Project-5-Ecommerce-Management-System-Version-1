/**
 * UserSession Model
 * Represents a user session in the authentication system
 */
class UserSession {
  constructor(data) {
    this.sessionId = data.session_id;
    this.userId = data.user_id;
    this.tokenHash = data.token_hash;
    this.expiresAt = data.expires_at;
    this.createdAt = data.created_at;
  }

  /**
   * Check if session is expired
   * @returns {boolean} True if expired
   */
  isExpired() {
    return new Date() > new Date(this.expiresAt);
  }

  /**
   * Extend session duration
   * @param {number} duration Duration in milliseconds
   */
  extend(duration) {
    const currentExpiry = new Date(this.expiresAt);
    this.expiresAt = new Date(currentExpiry.getTime() + duration);
  }

  /**
   * Invalidate session (set to expired)
   */
  invalidate() {
    this.expiresAt = new Date();
  }

  /**
   * Get time until expiration in milliseconds
   * @returns {number} Time until expiration
   */
  getTimeUntilExpiration() {
    const now = new Date();
    const expiry = new Date(this.expiresAt);
    return expiry.getTime() - now.getTime();
  }

  /**
   * Check if session is valid (not expired)
   * @returns {boolean} True if valid
   */
  isValid() {
    return !this.isExpired();
  }

  /**
   * Convert to public DTO
   * @returns {Object} Public session data
   */
  toPublicDTO() {
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
  toDatabaseObject() {
    return {
      session_id: this.sessionId,
      user_id: this.userId,
      token_hash: this.tokenHash,
      expires_at: this.expiresAt,
      created_at: this.createdAt,
    };
  }
}

module.exports = UserSession;
