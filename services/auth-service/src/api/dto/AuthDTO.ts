/**
 * DTOs pour l'authentification
 * DTOs pour les données d'authentification (JWT payload)
 * Admin-only system: all authenticated users are admins
 */

/**
 * DTO pour les données utilisateur authentifié
 * Correspond au JWT payload mais en tant que DTO
 */
export interface AuthenticatedUserDTO {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
}
