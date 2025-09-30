/**
 * DTOs Communs
 * Types partagés pour les réponses API
 */

/**
 * DTO public pour les informations utilisateur
 * (sans données sensibles comme le mot de passe)
 */
export interface UserPublicDTO {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: "admin" | "customer";
  isActive: boolean;
}
