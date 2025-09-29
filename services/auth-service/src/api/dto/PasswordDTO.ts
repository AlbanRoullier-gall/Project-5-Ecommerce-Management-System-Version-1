/**
 * DTOs pour la gestion des mots de passe
 * Correspond à AuthService.changePassword()
 */

/**
 * DTO pour le changement de mot de passe
 */
export interface PasswordChangeDTO {
  currentPassword: string;
  newPassword: string;
}
