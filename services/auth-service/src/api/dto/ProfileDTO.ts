/**
 * DTOs pour la gestion du profil utilisateur
 * Correspond à AuthService.getUserById() et updateUser()
 */

/**
 * DTO pour la mise à jour du profil utilisateur
 */
export interface UserUpdateDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
}
