/**
 * User Model
 * Represents a user in the authentication system
 */
import bcrypt from "bcryptjs";
import { UserData, UserPublicDTO, PasswordValidationResult } from "../types";

export class User {
  public readonly userId: number;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly role: "admin" | "customer";
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: UserData) {
    this.userId = data.user_id!;
    this.email = data.email;
    this.passwordHash = data.password_hash;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.role = data.role;
    this.isActive = data.is_active;
    this.createdAt = data.created_at!;
    this.updatedAt = data.updated_at!;
  }

  /**
   * Get full name
   * @returns {string} Full name
   */
  fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Activate user
   */
  activate(): void {
    (this as any).isActive = true;
  }

  /**
   * Deactivate user
   */
  deactivate(): void {
    (this as any).isActive = false;
  }

  /**
   * Check if user is admin
   * @returns {boolean} True if admin
   */
  isAdmin(): boolean {
    return this.role === "admin";
  }

  /**
   * Check if user is customer
   * @returns {boolean} True if customer
   */
  isCustomer(): boolean {
    return this.role === "customer";
  }

  /**
   * Validate password
   * @param {string} password Plain password
   * @returns {Promise<boolean>} True if valid
   */
  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.passwordHash);
  }

  /**
   * Hash password
   * @param {string} password Plain password
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Validate password strength
   * @param {string} password Plain password
   * @returns {Object} Validation result
   */
  static validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];

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
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Convert to public DTO (without sensitive data)
   * @returns {Object} Public user data
   */
  toPublicDTO(): UserPublicDTO {
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
  toDatabaseObject(): UserData {
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
