/**
 * DTOs pour l'authentification
 * DTOs pour les données d'authentification (JWT payload)
 */

/**
 * DTO pour les données utilisateur authentifié
 * Correspond au JWT payload mais en tant que DTO
 */
export interface AuthenticatedUserDTO {
  userId: number;
  email: string;
  role: "admin" | "customer";
  firstName: string;
  lastName: string;
}
