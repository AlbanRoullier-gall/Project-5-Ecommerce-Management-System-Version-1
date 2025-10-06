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
  UserUpdateDTO,
  PasswordChangeDTO,
} from "../dto";
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
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
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

      const userProfile = await this.authService.getUserProfile(Number(userId));

      // Convertir en DTO de réponse
      const userPublicDTO = UserMapper.userToPublicDTO(userProfile);
      const response = ResponseMapper.profileUpdateSuccess(userPublicDTO);

      res.json(response);
    } catch (error: any) {
      console.error("Get profile error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Mettre à jour le profil de l'utilisateur connecté
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userUpdateDTO: UserUpdateDTO = req.body;

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

      // Convertir DTO en données de mise à jour
      const updateData = UserMapper.userUpdateDTOToUserData(userUpdateDTO);

      // Mettre à jour l'utilisateur
      const updatedUser = await this.authService.updateUser(
        Number(userId),
        updateData
      );

      // Convertir en DTO de réponse
      const userPublicDTO = UserMapper.userToPublicDTO(updatedUser);
      const response = ResponseMapper.profileUpdateSuccess(userPublicDTO);

      res.json(response);
    } catch (error: any) {
      console.error("Update profile error:", error);
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
}
