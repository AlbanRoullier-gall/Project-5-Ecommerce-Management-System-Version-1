/**
 * DTOs pour l'inscription d'utilisateur
 * Correspond à AuthService.registerUser()
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
  role?: "admin" | "customer";
}
