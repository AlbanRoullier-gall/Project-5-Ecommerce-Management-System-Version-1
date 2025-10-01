/**
 * User Model
 * Represents a user in the authentication system
 */
const bcrypt = require("bcryptjs");

class User {
  constructor(data) {
    this.userId = data.user_id;
    this.email = data.email;
    this.passwordHash = data.password_hash;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.role = data.role;
    this.isActive = data.is_active;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  /**
   * Get full name
   * @returns {string} Full name
   */
  fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Activate user
   */
  activate() {
    this.isActive = true;
  }

  /**
   * Deactivate user
   */
  deactivate() {
    this.isActive = false;
  }

  /**
   * Check if user is admin
   * @returns {boolean} True if admin
   */
  isAdmin() {
    return this.role === "admin";
  }

  /**
   * Check if user is customer
   * @returns {boolean} True if customer
   */
  isCustomer() {
    return this.role === "customer";
  }

  /**
   * Validate password
   * @param {string} password Plain password
   * @returns {Promise<boolean>} True if valid
   */
  async validatePassword(password) {
    return await bcrypt.compare(password, this.passwordHash);
  }

  /**
   * Hash password
   * @param {string} password Plain password
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Validate password strength
   * @param {string} password Plain password
   * @returns {Object} Validation result
   */
  static validatePassword(password) {
    const errors = [];

    if (!password) {
      errors.push("Password is required");
    } else {
      if (password.length < 6) {
        errors.push("Password must be at least 6 characters long");
      }
      if (password.length > 128) {
        errors.push("Password must be less than 128 characters");
      }
      if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
      }
      if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
      }
      if (!/\d/.test(password)) {
        errors.push("Password must contain at least one number");
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  /**
   * Validate email format
   * @param {string} email Email address
   * @returns {boolean} True if valid
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Convert to public DTO (without sensitive data)
   * @returns {Object} Public user data
   */
  toPublicDTO() {
    return {
      userId: this.userId,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName(),
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Convert to database object
   * @returns {Object} Database object
   */
  toDatabaseObject() {
    return {
      user_id: this.userId,
      email: this.email,
      password_hash: this.passwordHash,
      first_name: this.firstName,
      last_name: this.lastName,
      role: this.role,
      is_active: this.isActive,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}

module.exports = User;
