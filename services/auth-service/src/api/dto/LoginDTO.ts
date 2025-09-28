/**
 * DTOs pour la connexion d'utilisateur
 * Correspond à AuthService.loginUser()
 */
import { UserPublicDTO } from "./CommonDTO";

/**
 * DTO pour la demande de connexion d'utilisateur
 */
export interface UserLoginDTO {
  email: string;
  password: string;
}

/**
 * DTO pour la réponse de connexion d'utilisateur
 */
export interface UserLoginResponseDTO {
  message: string;
  user: UserPublicDTO;
  token: string;
}
