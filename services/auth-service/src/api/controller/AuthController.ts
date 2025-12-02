/**
 * AuthController
 * Contrôleur pour l'authentification
 *
 * Architecture : Controller pattern
 * - Gère les requêtes HTTP
 * - Orchestre les services
 * - Convertit les DTOs
 */
import { Request, Response } from "express";
import { AuthService } from "../../services/AuthService";
import {
  UserCreateDTO,
  UserLoginDTO,
  PasswordValidationDTO,
  PasswordResetRequestDTO,
  PasswordResetDTO,
} from "../dto";
import { UserMapper, ResponseMapper } from "../mapper";
import { User } from "../../models/User";

export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userRegistrationDTO: UserCreateDTO = req.body;

      // Convertir DTO en données utilisateur
      const userData = UserMapper.userCreateDTOToUserData(userRegistrationDTO);

      // Inscrire l'utilisateur
      const { user, token } = await this.authService.registerUser(
        userData,
        userRegistrationDTO.password,
        userRegistrationDTO.confirmPassword
      );

      // Convertir en DTO de réponse
      const userPublicDTO = UserMapper.userToPublicDTO(user);
      const response = ResponseMapper.registerSuccess(userPublicDTO, token);

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.message.includes("existe déjà")) {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      if (error.message.includes("invalide")) {
        res.status(400).json(ResponseMapper.validationError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const userLoginDTO: UserLoginDTO = req.body;

      // Connecter l'utilisateur
      const { user, token } = await this.authService.loginUser(
        userLoginDTO.email,
        userLoginDTO.password
      );

      // Convertir en DTO de réponse
      const userPublicDTO = UserMapper.userToPublicDTO(user);
      const response = ResponseMapper.loginSuccess(userPublicDTO, token);

      res.json(response);
    } catch (error: any) {
      console.error("Login error:", error);
      if (
        error.message.includes("invalides") ||
        error.message.includes("désactivé")
      ) {
        res.status(401).json(ResponseMapper.authenticationError(error.message));
        return;
      }
      if (
        error.message.includes("approuvé") ||
        error.message.includes("refusé")
      ) {
        res.status(403).json(ResponseMapper.authenticationError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Validation d'un mot de passe
   * Utilise PasswordValidationDTO et la validation du modèle User
   */
  async validatePassword(req: Request, res: Response): Promise<void> {
    try {
      const passwordValidationDTO: PasswordValidationDTO = req.body;

      // Utiliser la validation du modèle User (8 caractères, majuscule, minuscule, chiffre, caractère spécial)
      const validationResult = User.validatePassword(
        passwordValidationDTO.password
      );

      const response = {
        success: true,
        valid: validationResult.isValid,
        isValid: validationResult.isValid,
        errors: validationResult.errors,
        message: validationResult.isValid
          ? "Mot de passe valide"
          : validationResult.errors.join("; "),
      };

      res.json(response);
    } catch (error: any) {
      console.error("Password validation error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Demande de réinitialisation de mot de passe
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const passwordResetRequestDTO: PasswordResetRequestDTO = req.body;

      // Générer un token de réinitialisation
      const resetToken = await this.authService.generateResetToken(
        passwordResetRequestDTO.email
      );

      // Retourner le token et les informations utilisateur
      const response = {
        success: true,
        token: resetToken.token,
        userName: resetToken.userName,
        message: "Token de réinitialisation généré avec succès",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error: any) {
      console.error("Reset password error:", error);
      if (error.message.includes("non trouvé")) {
        res
          .status(404)
          .json(ResponseMapper.error("Utilisateur non trouvé", 404));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Confirmation de réinitialisation de mot de passe
   */
  async confirmResetPassword(req: Request, res: Response): Promise<void> {
    try {
      const passwordResetDTO: PasswordResetDTO = req.body;

      // Confirmer la réinitialisation
      await this.authService.confirmResetPassword(
        passwordResetDTO.token,
        passwordResetDTO.newPassword
      );

      // Réponse de succès
      const response = {
        success: true,
        message: "Mot de passe réinitialisé avec succès",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error: any) {
      console.error("Confirm reset password error:", error);
      if (
        error.message.includes("invalide") ||
        error.message.includes("expiré")
      ) {
        res.status(400).json(ResponseMapper.validationError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Déconnexion de l'utilisateur
   */
  async logout(_req: Request, res: Response): Promise<void> {
    try {
      // Dans une architecture JWT stateless, la déconnexion se fait côté client
      // en supprimant le token. Ici on retourne juste un message de succès.
      const response = ResponseMapper.logoutSuccess();

      res.json(response);
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }


  // ===== GESTION DES UTILISATEURS (SUPER ADMIN) =====

  /**
   * Récupérer tous les utilisateurs en attente d'approbation
   */
  async getPendingUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.authService.getPendingUsers();
      const usersDTO = users.map((user) => UserMapper.userToPublicDTO(user));

      res.json({
        success: true,
        data: {
          users: usersDTO,
          count: usersDTO.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Get pending users error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Récupérer tous les utilisateurs
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.authService.getAllUsers();
      const usersDTO = users.map((user) => UserMapper.userToPublicDTO(user));

      res.json({
        success: true,
        data: {
          users: usersDTO,
          count: usersDTO.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Get all users error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Récupérer un utilisateur par ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params["id"];
      if (!idParam) {
        res
          .status(400)
          .json(ResponseMapper.validationError("ID utilisateur manquant"));
        return;
      }
      const userId = parseInt(idParam);
      if (isNaN(userId)) {
        res
          .status(400)
          .json(ResponseMapper.validationError("ID utilisateur invalide"));
        return;
      }

      const user = await this.authService.getUserById(userId);
      if (!user) {
        res
          .status(404)
          .json(ResponseMapper.error("Utilisateur non trouvé", 404));
        return;
      }

      const userDTO = UserMapper.userToPublicDTO(user);
      res.json({
        success: true,
        data: { user: userDTO },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Get user by ID error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Approuver un utilisateur
   */
  async approveUser(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params["id"];
      if (!idParam) {
        res
          .status(400)
          .json(ResponseMapper.validationError("ID utilisateur manquant"));
        return;
      }
      const userId = parseInt(idParam);
      if (isNaN(userId)) {
        res
          .status(400)
          .json(ResponseMapper.validationError("ID utilisateur invalide"));
        return;
      }

      const user = await this.authService.approveBackofficeAccess(userId);
      const userDTO = UserMapper.userToPublicDTO(user);

      res.json({
        success: true,
        message: "Utilisateur approuvé avec succès",
        data: { user: userDTO },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Approve user error:", error);
      if (error.message.includes("non trouvé")) {
        res.status(404).json(ResponseMapper.error(error.message, 404));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Rejeter un utilisateur
   */
  async rejectUser(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params["id"];
      if (!idParam) {
        res
          .status(400)
          .json(ResponseMapper.validationError("ID utilisateur manquant"));
        return;
      }
      const userId = parseInt(idParam);
      if (isNaN(userId)) {
        res
          .status(400)
          .json(ResponseMapper.validationError("ID utilisateur invalide"));
        return;
      }

      const user = await this.authService.rejectBackofficeAccess(userId);
      const userDTO = UserMapper.userToPublicDTO(user);

      res.json({
        success: true,
        message: "Utilisateur rejeté avec succès",
        data: { user: userDTO },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Reject user error:", error);
      if (error.message.includes("non trouvé")) {
        res.status(404).json(ResponseMapper.error(error.message, 404));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params["id"];
      if (!idParam) {
        res
          .status(400)
          .json(ResponseMapper.validationError("ID utilisateur manquant"));
        return;
      }
      const userId = parseInt(idParam);
      if (isNaN(userId)) {
        res
          .status(400)
          .json(ResponseMapper.validationError("ID utilisateur invalide"));
        return;
      }

      const deleted = await this.authService.deleteUser(userId);
      if (!deleted) {
        res
          .status(404)
          .json(ResponseMapper.error("Utilisateur non trouvé", 404));
        return;
      }

      res.json({
        success: true,
        message: "Utilisateur supprimé avec succès",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Delete user error:", error);
      if (error.message.includes("non trouvé")) {
        res.status(404).json(ResponseMapper.error(error.message, 404));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
