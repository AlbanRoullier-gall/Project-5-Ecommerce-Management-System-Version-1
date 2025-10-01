/**
 * DTOs pour l'inscription d'utilisateur
 * Correspond à AuthService.registerUser()
 * Admin-only system: all registered users are admins
 */

/**
 * DTO pour la demande d'inscription d'utilisateur
 */
export interface UserRegistrationDTO {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
}
