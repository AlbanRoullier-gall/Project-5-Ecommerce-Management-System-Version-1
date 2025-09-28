/**
 * DTOs pour la gestion du profil utilisateur
 * Correspond à AuthService.getUserById() et updateUser()
 */
import { UserPublicDTO } from "./CommonDTO";

/**
 * DTO pour la mise à jour du profil utilisateur
 */
export interface UserUpdateDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
}

/**
 * DTO pour la réponse de mise à jour du profil utilisateur
 */
export interface UserUpdateResponseDTO {
  message: string;
  user: UserPublicDTO;
}
