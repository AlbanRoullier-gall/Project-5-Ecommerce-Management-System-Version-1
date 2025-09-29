/**
 * DTOs pour la connexion d'utilisateur
 * Correspond à AuthService.loginUser()
 */

/**
 * DTO pour la demande de connexion d'utilisateur
 */
export interface UserLoginDTO {
  email: string;
  password: string;
}
