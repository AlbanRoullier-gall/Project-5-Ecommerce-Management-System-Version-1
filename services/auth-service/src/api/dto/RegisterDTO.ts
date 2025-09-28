/**
 * DTOs pour l'inscription d'utilisateur
 * Correspond à AuthService.registerUser()
 */
import { UserPublicDTO } from "./CommonDTO";

/**
 * DTO pour la demande d'inscription d'utilisateur
 */
export interface UserRegistrationDTO {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  role?: "admin" | "customer";
}

/**
 * DTO pour la réponse d'inscription d'utilisateur
 */
export interface UserRegistrationResponseDTO {
  message: string;
  user: UserPublicDTO;
  token: string;
}
