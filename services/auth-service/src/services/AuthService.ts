/**
 * AuthService
 * Business logic layer for authentication management
 */
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User";
import { UserSession } from "../models/UserSession";
import { PasswordReset } from "../models/PasswordReset";
import { UserRepository } from "../repositories/UserRepository";
import { UserSessionRepository } from "../repositories/UserSessionRepository";
import { PasswordResetRepository } from "../repositories/PasswordResetRepository";
import { RegisterData, UpdateUserData, JWTPayload } from "../types";

export class AuthService {
  private userRepository: UserRepository;
  private sessionRepository: UserSessionRepository;
  private passwordResetRepository: PasswordResetRepository;
  private jwtSecret: string;

  constructor(pool: Pool) {
    this.userRepository = new UserRepository(pool);
    this.sessionRepository = new UserSessionRepository(pool);
    this.passwordResetRepository = new PasswordResetRepository(pool);
    this.jwtSecret = process.env["JWT_SECRET"] || "your-jwt-secret-key";
  }

  /**
   * Register a new user
   * @param {RegisterData} data User data
   * @returns {Promise<User>} Created user
   */
  async registerUser(data: RegisterData): Promise<User> {
    try {
      const {
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
        role = "customer",
      } = data;

      // Validate input
      if (!User.validateEmail(email)) {
        throw new Error("Invalid email format");
      }

      // Validate password confirmation
      if (confirmPassword && password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const passwordValidation = User.validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(
          `Password validation failed: ${passwordValidation.errors.join(", ")}`
        );
      }

      // Check if email already exists
      const existingUser = await this.userRepository.getByEmail(email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash password
      const passwordHash = await User.hashPassword(password);

      // Create user
      const user = new User({
        user_id: null,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        role: role,
        is_active: true,
        created_at: null,
        updated_at: null,
      });

      // Save user
      const savedUser = await this.userRepository.save(user);
      return savedUser;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  /**
   * Authenticate user
   * @param {string} email User email
   * @param {string} password User password
   * @returns {Promise<User>} Authenticated user
   */
  async authenticateUser(email: string, password: string): Promise<User> {
    try {
      // Get user by email
      const user = await this.userRepository.getByEmail(email);
      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error("Account is deactivated");
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      return user;
    } catch (error) {
      console.error("Error authenticating user:", error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {number} id User ID
   * @returns {Promise<User>} User
   */
  async getUserById(id: number): Promise<User> {
    try {
      const user = await this.userRepository.getById(id);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  }

  /**
   * Get user by email
   * @param {string} email User email
   * @returns {Promise<User>} User
   */
  async getUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.getByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw error;
    }
  }

  /**
   * Update user
   * @param {number} id User ID
   * @param {UpdateUserData} data User data
   * @returns {Promise<User>} Updated user
   */
  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    try {
      const user = await this.userRepository.getById(id);
      if (!user) {
        throw new Error("User not found");
      }

      // Update fields
      if (data.firstName !== undefined)
        (user as any).firstName = data.firstName;
      if (data.lastName !== undefined) (user as any).lastName = data.lastName;
      if (data.email !== undefined) {
        if (!User.validateEmail(data.email)) {
          throw new Error("Invalid email format");
        }
        (user as any).email = data.email.toLowerCase();
      }
      if (data.role !== undefined) (user as any).role = data.role;
      if (data.isActive !== undefined) (user as any).isActive = data.isActive;

      // Save changes
      return await this.userRepository.update(user);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {number} id User ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteUser(id: number): Promise<boolean> {
    try {
      const user = await this.userRepository.getById(id);
      if (!user) {
        throw new Error("User not found");
      }

      // Delete all user sessions and password resets first
      await this.sessionRepository.deleteByUser(id);
      await this.passwordResetRepository.deleteByUser(id);

      // Delete user
      return await this.userRepository.delete(user);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  /**
   * List users by role
   * @param {string} role User role
   * @returns {Promise<User[]>} List of users
   */
  async listUsers(role?: string): Promise<User[]> {
    try {
      if (role) {
        return await this.userRepository.listByRole(role);
      } else {
        return await this.userRepository.listAllActive();
      }
    } catch (error) {
      console.error("Error listing users:", error);
      throw error;
    }
  }

  /**
   * Activate user
   * @param {number} id User ID
   * @returns {Promise<boolean>} True if activated
   */
  async activateUser(id: number): Promise<boolean> {
    try {
      return await this.userRepository.activate(id);
    } catch (error) {
      console.error("Error activating user:", error);
      throw error;
    }
  }

  /**
   * Deactivate user
   * @param {number} id User ID
   * @returns {Promise<boolean>} True if deactivated
   */
  async deactivateUser(id: number): Promise<boolean> {
    try {
      return await this.userRepository.deactivate(id);
    } catch (error) {
      console.error("Error deactivating user:", error);
      throw error;
    }
  }

  /**
   * Generate JWT token
   * @param {User} user User object
   * @param {string} expiresIn Token expiration
   * @returns {string} JWT token
   */
  generateJWT(user: User, expiresIn: string = "24h"): string {
    const payload: JWTPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn } as any);
  }

  /**
   * Verify JWT token
   * @param {string} token JWT token
   * @returns {JWTPayload} Decoded token payload
   */
  verifyJWT(token: string): JWTPayload {
    return jwt.verify(token, this.jwtSecret) as JWTPayload;
  }

  /**
   * Generate refresh token
   * @returns {string} Refresh token
   */
  generateRefreshToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Create user session
   * @param {number} userId User ID
   * @param {string} tokenHash Token hash
   * @param {Date} expiresAt Expiration date
   * @returns {Promise<UserSession>} Created session
   */
  async createSession(
    userId: number,
    tokenHash: string,
    expiresAt: Date
  ): Promise<UserSession> {
    try {
      const session = new UserSession({
        session_id: null,
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_at: null,
      });

      return await this.sessionRepository.save(session);
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  /**
   * Get session by token hash
   * @param {string} tokenHash Token hash
   * @returns {Promise<UserSession>} Session
   */
  async getSessionByToken(tokenHash: string): Promise<UserSession> {
    try {
      const session = await this.sessionRepository.getByTokenHash(tokenHash);
      if (!session) {
        throw new Error("Session not found");
      }
      return session;
    } catch (error) {
      console.error("Error getting session by token:", error);
      throw error;
    }
  }

  /**
   * Get user sessions
   * @param {number} userId User ID
   * @returns {Promise<UserSession[]>} List of sessions
   */
  async getUserSessions(userId: number): Promise<UserSession[]> {
    try {
      return await this.sessionRepository.listByUser(userId);
    } catch (error) {
      console.error("Error getting user sessions:", error);
      throw error;
    }
  }

  /**
   * Update session
   * @param {number} sessionId Session ID
   * @param {Object} data Session data
   * @returns {Promise<UserSession>} Updated session
   */
  async updateSession(
    sessionId: number,
    data: { expiresAt?: Date; tokenHash?: string }
  ): Promise<UserSession> {
    try {
      const session = await this.sessionRepository.getById(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      if (data.expiresAt !== undefined)
        (session as any).expiresAt = data.expiresAt;
      if (data.tokenHash !== undefined)
        (session as any).tokenHash = data.tokenHash;

      return await this.sessionRepository.update(session);
    } catch (error) {
      console.error("Error updating session:", error);
      throw error;
    }
  }

  /**
   * Delete session
   * @param {number} sessionId Session ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteSession(sessionId: number): Promise<boolean> {
    try {
      return await this.sessionRepository.deleteById(sessionId);
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  }

  /**
   * Delete all user sessions
   * @param {number} userId User ID
   * @returns {Promise<number>} Number of deleted sessions
   */
  async deleteAllUserSessions(userId: number): Promise<number> {
    try {
      return await this.sessionRepository.deleteByUser(userId);
    } catch (error) {
      console.error("Error deleting all user sessions:", error);
      throw error;
    }
  }

  /**
   * Cleanup expired sessions
   * @returns {Promise<number>} Number of deleted sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      return await this.sessionRepository.deleteExpired();
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
      throw error;
    }
  }

  /**
   * Create password reset
   * @param {number} userId User ID
   * @param {string} token Reset token
   * @param {Date} expiresAt Expiration date
   * @returns {Promise<PasswordReset>} Created reset
   */
  async createPasswordReset(
    userId: number,
    token: string,
    expiresAt: Date
  ): Promise<PasswordReset> {
    try {
      const reset = new PasswordReset({
        reset_id: null,
        user_id: userId,
        reset_token: token,
        expires_at: expiresAt,
        created_at: null,
      });

      return await this.passwordResetRepository.save(reset);
    } catch (error) {
      console.error("Error creating password reset:", error);
      throw error;
    }
  }

  /**
   * Get password reset by token
   * @param {string} token Reset token
   * @returns {Promise<PasswordReset>} Reset
   */
  async getPasswordResetByToken(token: string): Promise<PasswordReset> {
    try {
      const reset = await this.passwordResetRepository.getByToken(token);
      if (!reset) {
        throw new Error("Password reset not found");
      }
      return reset;
    } catch (error) {
      console.error("Error getting password reset by token:", error);
      throw error;
    }
  }

  /**
   * Get user password resets
   * @param {number} userId User ID
   * @returns {Promise<PasswordReset[]>} List of resets
   */
  async getUserPasswordResets(userId: number): Promise<PasswordReset[]> {
    try {
      return await this.passwordResetRepository.listByUser(userId);
    } catch (error) {
      console.error("Error getting user password resets:", error);
      throw error;
    }
  }

  /**
   * Update password reset
   * @param {number} resetId Reset ID
   * @param {Object} data Reset data
   * @returns {Promise<PasswordReset>} Updated reset
   */
  async updatePasswordReset(
    resetId: number,
    data: { expiresAt?: Date; resetToken?: string }
  ): Promise<PasswordReset> {
    try {
      const reset = await this.passwordResetRepository.getById(resetId);
      if (!reset) {
        throw new Error("Password reset not found");
      }

      if (data.expiresAt !== undefined)
        (reset as any).expiresAt = data.expiresAt;
      if (data.resetToken !== undefined)
        (reset as any).resetToken = data.resetToken;

      return await this.passwordResetRepository.update(reset);
    } catch (error) {
      console.error("Error updating password reset:", error);
      throw error;
    }
  }

  /**
   * Delete password reset
   * @param {number} resetId Reset ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deletePasswordReset(resetId: number): Promise<boolean> {
    try {
      return await this.passwordResetRepository.deleteById(resetId);
    } catch (error) {
      console.error("Error deleting password reset:", error);
      throw error;
    }
  }

  /**
   * Delete all user password resets
   * @param {number} userId User ID
   * @returns {Promise<number>} Number of deleted resets
   */
  async deleteAllUserPasswordResets(userId: number): Promise<number> {
    try {
      return await this.passwordResetRepository.deleteByUser(userId);
    } catch (error) {
      console.error("Error deleting all user password resets:", error);
      throw error;
    }
  }

  /**
   * Cleanup expired password resets
   * @returns {Promise<number>} Number of deleted resets
   */
  async cleanupExpiredPasswordResets(): Promise<number> {
    try {
      return await this.passwordResetRepository.deleteExpired();
    } catch (error) {
      console.error("Error cleaning up expired password resets:", error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {number} userId User ID
   * @param {string} currentPassword Current password
   * @param {string} newPassword New password
   * @returns {Promise<boolean>} True if changed
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      // Get user
      const user = await this.userRepository.getById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password
      const isValidPassword = await user.validatePassword(currentPassword);
      if (!isValidPassword) {
        throw new Error("Current password is incorrect");
      }

      // Validate new password
      const passwordValidation = User.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(
          `Password validation failed: ${passwordValidation.errors.join(", ")}`
        );
      }

      // Hash new password
      const newPasswordHash = await User.hashPassword(newPassword);

      // Update password
      const success = await this.userRepository.updatePassword(
        userId,
        newPasswordHash
      );

      if (success) {
        // Invalidate all user sessions
        await this.deleteAllUserSessions(userId);
      }

      return success;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }

  /**
   * Reset password with token
   * @param {string} token Reset token
   * @param {string} newPassword New password
   * @returns {Promise<boolean>} True if reset
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Get password reset
      const reset = await this.getPasswordResetByToken(token);

      // Check if reset is valid
      if (!reset.isValid()) {
        throw new Error("Password reset token has expired");
      }

      // Validate new password
      const passwordValidation = User.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(
          `Password validation failed: ${passwordValidation.errors.join(", ")}`
        );
      }

      // Hash new password
      const newPasswordHash = await User.hashPassword(newPassword);

      // Update user password
      const success = await this.userRepository.updatePassword(
        reset.userId,
        newPasswordHash
      );

      if (success) {
        // Delete all password resets for this user
        await this.deleteAllUserPasswordResets(reset.userId);

        // Invalidate all user sessions
        await this.deleteAllUserSessions(reset.userId);
      }

      return success;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }
}
