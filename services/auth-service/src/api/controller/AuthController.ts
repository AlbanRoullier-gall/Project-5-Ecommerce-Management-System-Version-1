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
import { UserCreateDTO, UserLoginDTO, PasswordChangeDTO } from "../dto";
import { UserMapper, ResponseMapper } from "../mapper";

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

      // Générer les tokens d'approbation/rejet pour l'API Gateway
      const approvalToken = this.authService.generateApprovalToken(
        user.userId,
        "approve"
      );
      const rejectionToken = this.authService.generateApprovalToken(
        user.userId,
        "reject"
      );

      // Convertir en DTO de réponse
      const userPublicDTO = UserMapper.userToPublicDTO(user);
      const response = {
        ...ResponseMapper.registerSuccess(userPublicDTO, token),
        // Ajouter les tokens pour l'API Gateway
        approvalToken,
        rejectionToken,
      };

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
   * Changer le mot de passe de l'utilisateur connecté
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const passwordChangeDTO: PasswordChangeDTO = req.body;

      // Récupérer l'ID utilisateur depuis les headers envoyés par l'API Gateway
      const userId = req.headers["x-user-id"];
      if (!userId) {
        res.status(401).json({
          error: "Erreur d'authentification",
          message: "Informations utilisateur manquantes",
          timestamp: new Date().toISOString(),
          status: 401,
        });
        return;
      }

      // Changer le mot de passe
      await this.authService.changePassword(
        Number(userId),
        passwordChangeDTO.currentPassword,
        passwordChangeDTO.newPassword
      );

      // Réponse de succès
      const response = ResponseMapper.passwordChangeSuccess();

      res.json(response);
    } catch (error: any) {
      console.error("Change password error:", error);
      if (
        error.message.includes("incorrect") ||
        error.message.includes("invalide")
      ) {
        res.status(400).json(ResponseMapper.validationError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Validation d'un mot de passe
   */
  async validatePassword(req: Request, res: Response): Promise<void> {
    try {
      const { password } = req.body;

      // Validation simple du mot de passe
      const isValid = password && password.length >= 6;
      const response = {
        success: true,
        valid: isValid,
        message: isValid
          ? "Mot de passe valide"
          : "Mot de passe invalide (minimum 6 caractères)",
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
      const { email } = req.body;

      // Générer un token de réinitialisation
      const resetToken = await this.authService.generateResetToken(email);

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
      const { token, password } = req.body;

      // Confirmer la réinitialisation
      await this.authService.confirmResetPassword(token, password);

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

  /**
   * Approbation d'accès au backoffice via email
   */
  async approveBackofficeAccess(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        res.status(400).json(ResponseMapper.validationError("Token manquant"));
        return;
      }

      // Vérifier le token d'approbation
      const decoded = this.authService.verifyApprovalToken(token);

      if (!decoded || decoded.action !== "approve") {
        res.status(400).json(ResponseMapper.validationError("Token invalide"));
        return;
      }

      // Approuver l'accès
      await this.authService.approveBackofficeAccess(decoded.userId);

      // Récupérer les informations utilisateur
      const user = await this.authService.getUserById(decoded.userId);

      // Convertir en DTO public
      const userPublicDTO = UserMapper.userToPublicDTO(user);

      // Retourner les informations - L'API Gateway se chargera d'envoyer l'email
      res.json({
        success: true,
        message: "Accès au backoffice approuvé avec succès",
        user: userPublicDTO,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Approve backoffice access error:", error);
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
   * Rejet d'accès au backoffice via email
   */
  async rejectBackofficeAccess(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        res.status(400).json(ResponseMapper.validationError("Token manquant"));
        return;
      }

      // Vérifier le token d'approbation
      const decoded = this.authService.verifyApprovalToken(token);

      if (!decoded || decoded.action !== "reject") {
        res.status(400).json(ResponseMapper.validationError("Token invalide"));
        return;
      }

      // Rejeter l'accès
      await this.authService.rejectBackofficeAccess(decoded.userId);

      // Récupérer les informations utilisateur
      const user = await this.authService.getUserById(decoded.userId);

      // Convertir en DTO public
      const userPublicDTO = UserMapper.userToPublicDTO(user);

      // Retourner les informations - L'API Gateway se chargera d'envoyer l'email
      res.json({
        success: true,
        message: "Accès au backoffice rejeté",
        user: userPublicDTO,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Reject backoffice access error:", error);
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
}
