/**
 * AuthService
 * Couche de logique métier pour l'authentification
 *
 * Architecture : Service layer
 * - Orchestre les repositories
 * - Contient la logique métier
 * - Gère les tokens JWT
 * - Travaille uniquement avec les modèles
 */
import { Pool } from "pg";
import jwt, { SignOptions } from "jsonwebtoken";
import { User, UserData } from "../models/User";
import { UserRepository } from "../repositories/UserRepository";

export class AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;

  constructor(pool: Pool) {
    this.userRepository = new UserRepository(pool);
    this.jwtSecret = process.env["JWT_SECRET"] || "your-jwt-secret-key";
  }

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Récupérer un utilisateur par ID avec vérification
   */
  private async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    return user;
  }

  /**
   * Valider un mot de passe avec message d'erreur formaté
   */
  private validatePasswordWithError(
    password: string,
    context: string = "Mot de passe"
  ): void {
    const validation = User.validatePassword(password);
    if (!validation.isValid) {
      throw new Error(`${context} invalide: ${validation.errors.join(", ")}`);
    }
  }

  // ===== INSCRIPTION =====

  /**
   * Inscrire un nouvel utilisateur
   */
  async registerUser(
    userData: Partial<UserData>,
    password: string,
    confirmPassword?: string
  ): Promise<{ user: User; token: string }> {
    try {
      // Validation des données
      const { email, first_name, last_name } = userData;

      if (!email || !User.validateEmail(email)) {
        throw new Error("Format d'email invalide");
      }

      if (!first_name || !last_name) {
        throw new Error("Le prénom et le nom sont obligatoires");
      }

      if (confirmPassword && password !== confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas");
      }

      // Validation du mot de passe
      this.validatePasswordWithError(password);

      // Vérifier si l'email existe déjà
      const existingUser = await this.userRepository.getByEmail(email);
      if (existingUser) {
        throw new Error("Un utilisateur avec cet email existe déjà");
      }

      // Créer l'utilisateur
      const passwordHash = await User.hashPassword(password);
      const user = new User({
        user_id: 0, // Sera remplacé par la DB
        email: email.toLowerCase(),
        password_hash: passwordHash,
        first_name: first_name,
        last_name: last_name,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Sauvegarder en base
      const savedUser = await this.userRepository.save(user);

      // Générer le token JWT
      const token = this.generateJWT(savedUser);

      return { user: savedUser, token };
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  // ===== CONNEXION =====

  /**
   * Connecter un utilisateur
   */
  async loginUser(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    try {
      // Récupérer l'utilisateur
      const user = await this.userRepository.getByEmail(email);
      if (!user) {
        throw new Error("Identifiants invalides");
      }

      // Vérifier si le compte est actif
      if (!user.isActive) {
        throw new Error("Le compte est désactivé");
      }

      // Vérifier le mot de passe
      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        throw new Error("Identifiants invalides");
      }

      // Générer le token JWT
      const token = this.generateJWT(user);

      return { user, token };
    } catch (error) {
      console.error("Error logging in user:", error);
      throw error;
    }
  }

  // ===== GESTION DU PROFIL =====

  /**
   * Récupérer le profil utilisateur
   */
  async getUserProfile(userId: number): Promise<User> {
    try {
      return await this.getUserById(userId);
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateUser(
    userId: number,
    updateData: Partial<UserData>
  ): Promise<User> {
    try {
      const user = await this.getUserById(userId);
      const updatedUser = this.userRepository.createUserWithMerge(
        user,
        updateData
      );
      return await this.userRepository.update(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const user = await this.userRepository.getById(userId);
      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      // Vérifier le mot de passe actuel
      const isCurrentPasswordValid = await user.verifyPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error("Le mot de passe actuel est incorrect");
      }

      // Valider le nouveau mot de passe
      this.validatePasswordWithError(newPassword, "Nouveau mot de passe");

      // Hasher le nouveau mot de passe
      const newPasswordHash = await User.hashPassword(newPassword);

      // Créer l'utilisateur mis à jour avec le nouveau mot de passe
      const updatedUser = this.userRepository.createUserWithMerge(user, {
        password_hash: newPasswordHash,
      });

      await this.userRepository.update(updatedUser);
      return true;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }

  // ===== RÉINITIALISATION DE MOT DE PASSE =====

  /**
   * Générer un token de réinitialisation de mot de passe
   */
  async generateResetToken(
    email: string
  ): Promise<{ token: string; userName: string }> {
    try {
      // Vérifier que l'utilisateur existe
      const user = await this.userRepository.getByEmail(email);
      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      // Générer un token unique
      const resetToken = jwt.sign(
        {
          userId: user.userId,
          email: user.email,
          type: "password_reset",
        },
        this.jwtSecret,
        { expiresIn: "15m" } // Token valide 15 minutes
      );

      return {
        token: resetToken,
        userName: `${user.firstName} ${user.lastName}`,
      };
    } catch (error) {
      console.error("Error generating reset token:", error);
      throw error;
    }
  }

  /**
   * Confirmer la réinitialisation de mot de passe
   */
  async confirmResetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    try {
      // Vérifier le token
      const decoded = jwt.verify(token, this.jwtSecret) as any;

      if (decoded.type !== "password_reset") {
        throw new Error("Token de réinitialisation invalide");
      }

      // Récupérer l'utilisateur
      const user = await this.userRepository.getById(decoded.userId);
      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      // Valider le nouveau mot de passe
      this.validatePasswordWithError(newPassword, "Nouveau mot de passe");

      // Hasher le nouveau mot de passe
      const newPasswordHash = await User.hashPassword(newPassword);

      // Mettre à jour le mot de passe
      const updatedUser = this.userRepository.createUserWithMerge(user, {
        password_hash: newPasswordHash,
      });

      await this.userRepository.update(updatedUser);
    } catch (error) {
      console.error("Error confirming reset password:", error);
      if (error.name === "TokenExpiredError") {
        throw new Error("Token de réinitialisation expiré");
      }
      if (error.name === "JsonWebTokenError") {
        throw new Error("Token de réinitialisation invalide");
      }
      throw error;
    }
  }

  // ===== GESTION DES TOKENS JWT =====

  /**
   * Générer un token JWT
   */
  generateJWT(user: User, expiresIn: string = "24h"): string {
    const payload = {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn } as SignOptions);
  }
}
