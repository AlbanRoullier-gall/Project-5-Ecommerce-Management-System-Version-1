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
  UserRegistrationDTO,
  UserRegistrationResponseDTO,
  UserLoginDTO,
  UserLoginResponseDTO,
  UserUpdateDTO,
  UserUpdateResponseDTO,
  PasswordChangeDTO,
  PasswordChangeResponseDTO,
  AuthenticatedUserDTO,
} from "../dto";
import { UserMapper, ResponseMapper } from "../mapper";

export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userRegistrationDTO: UserRegistrationDTO = req.body;

      // Convertir DTO en données utilisateur
      const userData =
        UserMapper.userRegistrationDTOToUserData(userRegistrationDTO);

      // Inscrire l'utilisateur
      const { user, token } = await this.authService.registerUser(
        userData,
        userRegistrationDTO.password,
        userRegistrationDTO.confirmPassword
      );

      // Convertir en DTO de réponse
      const userPublicDTO = UserMapper.userToPublicDTO(user);
      const response: UserRegistrationResponseDTO =
        ResponseMapper.registerSuccess(userPublicDTO, token);

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.message.includes("existe déjà")) {
        res.status(409).json({ error: error.message });
        return;
      }
      if (error.message.includes("invalide")) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Erreur interne du serveur" });
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
      const response: UserLoginResponseDTO = ResponseMapper.loginSuccess(
        userPublicDTO,
        token
      );

      res.json(response);
    } catch (error: any) {
      console.error("Login error:", error);
      if (
        error.message.includes("invalides") ||
        error.message.includes("désactivé")
      ) {
        res.status(401).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  }

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const jwtPayload = (req as any).user;
      const user: AuthenticatedUserDTO =
        UserMapper.jwtPayloadToAuthenticatedUserDTO(jwtPayload);
      const userProfile = await this.authService.getUserById(user.userId);

      // Convertir en DTO de réponse
      const userPublicDTO = UserMapper.userToPublicDTO(userProfile);
      const response = ResponseMapper.profileUpdateSuccess(userPublicDTO);

      res.json(response);
    } catch (error: any) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  }

  /**
   * Mettre à jour le profil de l'utilisateur connecté
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userUpdateDTO: UserUpdateDTO = req.body;
      const jwtPayload = (req as any).user;
      const user: AuthenticatedUserDTO =
        UserMapper.jwtPayloadToAuthenticatedUserDTO(jwtPayload);

      // Convertir DTO en données de mise à jour
      const updateData = UserMapper.userUpdateDTOToUserData(userUpdateDTO);

      // Mettre à jour l'utilisateur
      const updatedUser = await this.authService.updateUser(
        user.userId,
        updateData
      );

      // Convertir en DTO de réponse
      const userPublicDTO = UserMapper.userToPublicDTO(updatedUser);
      const response: UserUpdateResponseDTO =
        ResponseMapper.profileUpdateSuccess(userPublicDTO);

      res.json(response);
    } catch (error: any) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  }

  /**
   * Changer le mot de passe de l'utilisateur connecté
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const passwordChangeDTO: PasswordChangeDTO = req.body;
      const jwtPayload = (req as any).user;
      const user: AuthenticatedUserDTO =
        UserMapper.jwtPayloadToAuthenticatedUserDTO(jwtPayload);

      // Changer le mot de passe
      await this.authService.changePassword(
        user.userId,
        passwordChangeDTO.currentPassword,
        passwordChangeDTO.newPassword
      );

      // Réponse de succès
      const response: PasswordChangeResponseDTO =
        ResponseMapper.passwordChangeSuccess();

      res.json(response);
    } catch (error: any) {
      console.error("Change password error:", error);
      if (
        error.message.includes("incorrect") ||
        error.message.includes("invalide")
      ) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Erreur interne du serveur" });
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
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  }
}
