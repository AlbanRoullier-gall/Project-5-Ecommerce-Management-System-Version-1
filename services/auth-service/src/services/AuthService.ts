/**
 * AuthService
 * Couche de logique métier pour l'authentification
 *
 * Architecture : Service layer
 * - Orchestre les repositories
 * - Contient la logique métier
 * - Gère les tokens JWT pour l'authentification
 * - Gère les tokens de réinitialisation via base de données
 * - Travaille uniquement avec les modèles
 */
import { Pool } from "pg";
import jwt, { SignOptions } from "jsonwebtoken";
import { User, UserData } from "../models/User";
import { UserRepository } from "../repositories/UserRepository";
import { PasswordResetRepository } from "../repositories/PasswordResetRepository";
import { PasswordReset } from "../models/PasswordReset";

export class AuthService {
  private userRepository: UserRepository;
  private passwordResetRepository: PasswordResetRepository;
  private jwtSecret: string;

  constructor(pool: Pool) {
    this.userRepository = new UserRepository(pool);
    this.passwordResetRepository = new PasswordResetRepository(pool);
    this.jwtSecret = process.env["JWT_SECRET"] || "your-jwt-secret-key";
    console.log(
      "🔐 Auth Service JWT_SECRET:",
      this.jwtSecret.substring(0, 10) + "..."
    );
  }

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Récupérer un utilisateur par ID avec vérification
   */
  public async getUserById(userId: number): Promise<User> {
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
  ): Promise<{ user: User; token: string; message: string }> {
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
        is_backoffice_approved: false, // Par défaut, pas approuvé pour le backoffice
        is_backoffice_rejected: false, // Par défaut, pas refusé
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Sauvegarder en base
      const savedUser = await this.userRepository.save(user);

      // Générer le token JWT
      const token = this.generateJWT(savedUser);

      // Note: L'API Gateway se chargera d'envoyer l'email d'approbation
      // L'auth-service ne connaît pas l'email-service
      return {
        user: savedUser,
        token,
        message:
          "Votre compte a été créé avec succès. Un email de demande d'approbation a été envoyé à l'administrateur. Vous recevrez une notification une fois votre accès approuvé.",
      };
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

      // Vérifier l'approbation backoffice
      if (user.isBackofficeRejected) {
        throw new Error(
          "Votre accès au backoffice a été refusé. Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur."
        );
      }

      if (!user.isBackofficeApproved) {
        throw new Error(
          "Votre accès au backoffice n'a pas encore été approuvé. Vous recevrez un email une fois votre demande traitée."
        );
      }

      // Générer le token JWT
      const token = this.generateJWT(user);

      return { user, token };
    } catch (error) {
      console.error("Error logging in user:", error);
      throw error;
    }
  }

  // ===== RÉINITIALISATION DE MOT DE PASSE (BASE DE DONNÉES) =====

  /**
   * Générer un token de réinitialisation de mot de passe
   * Utilise la base de données pour stocker des tokens uniques et sécurisés
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

      // Supprimer les anciens tokens de réinitialisation pour cet utilisateur
      await this.passwordResetRepository.deleteByUser(user.userId);

      // Générer un token unique et sécurisé
      const resetToken = PasswordReset.generateToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Créer l'entité PasswordReset
      const passwordReset = new PasswordReset({
        reset_id: null,
        user_id: user.userId,
        reset_token: PasswordReset.hashToken(resetToken),
        expires_at: expiresAt,
        created_at: null,
      });

      // Sauvegarder en base de données
      await this.passwordResetRepository.save(passwordReset);

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
   * Valide le token via la base de données et le supprime après utilisation
   */
  async confirmResetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    try {
      // Récupérer le token de réinitialisation depuis la base de données
      const passwordReset = await this.passwordResetRepository.getByToken(
        PasswordReset.hashToken(token)
      );

      if (!passwordReset) {
        throw new Error("Token de réinitialisation invalide");
      }

      // Vérifier que le token n'est pas expiré
      if (passwordReset.isExpired()) {
        // Supprimer le token expiré
        await this.passwordResetRepository.delete(passwordReset);
        throw new Error("Token de réinitialisation expiré");
      }

      // Récupérer l'utilisateur
      const user = await this.userRepository.getById(passwordReset.userId);
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

      // Supprimer le token de réinitialisation après utilisation
      await this.passwordResetRepository.delete(passwordReset);
    } catch (error: any) {
      console.error("Error confirming reset password:", error);
      throw error;
    }
  }

  // ===== GESTION DES TOKENS JWT =====

  /**
   * Méthode privée pour générer des tokens JWT
   */
  private generateToken(payload: any, expiresIn: string = "24h"): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn } as SignOptions);
  }

  /**
   * Générer un token JWT pour l'authentification
   * Méthode privée utilisée uniquement en interne
   */
  private generateJWT(user: User, expiresIn: string = "24h"): string {
    const payload = {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return this.generateToken(payload, expiresIn);
  }

  // ===== GESTION APPROBATION BACKOFFICE =====

  /**
   * Méthode privée pour mettre à jour le statut d'approbation backoffice
   * @param {number} userId ID de l'utilisateur
   * @param {boolean} approved True pour approuver, false pour rejeter
   * @returns {Promise<User>} Utilisateur mis à jour
   */
  private async updateBackofficeAccessStatus(
    userId: number,
    approved: boolean
  ): Promise<User> {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    const updatedUser = this.userRepository.createUserWithMerge(user, {
      is_backoffice_approved: approved,
      is_backoffice_rejected: !approved,
    });

    return await this.userRepository.update(updatedUser);
  }

  /**
   * Approuver l'accès backoffice d'un utilisateur
   */
  async approveBackofficeAccess(userId: number): Promise<User> {
    try {
      return await this.updateBackofficeAccessStatus(userId, true);
    } catch (error) {
      console.error("Error approving backoffice access:", error);
      throw error;
    }
  }

  /**
   * Rejeter l'accès backoffice d'un utilisateur
   */
  async rejectBackofficeAccess(userId: number): Promise<User> {
    try {
      return await this.updateBackofficeAccessStatus(userId, false);
    } catch (error) {
      console.error("Error rejecting backoffice access:", error);
      throw error;
    }
  }

  /**
   * Générer un token d'approbation
   * Note: Utilisé par l'API Gateway pour créer des liens d'approbation/rejet
   */
  generateApprovalToken(
    userId: number,
    action: "approve" | "reject" = "approve"
  ): string {
    const payload = {
      userId,
      action,
      timestamp: Date.now(),
    };

    return this.generateToken(payload, "24h");
  }

  /**
   * Vérifier un token d'approbation
   */
  verifyApprovalToken(
    token: string
  ): { userId: number; action: string; timestamp: number } | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return {
        userId: decoded.userId,
        action: decoded.action,
        timestamp: decoded.timestamp,
      };
    } catch (error) {
      console.error("Error verifying approval token:", error);
      return null;
    }
  }
}
