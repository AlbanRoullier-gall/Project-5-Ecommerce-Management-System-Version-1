/**
 * DTOs Communs
 * Types partagés pour les réponses API
 */

/**
 * DTO pour les erreurs
 */
export interface ErrorResponseDTO {
  error: string;
  message?: string;
}

/**
 * DTO pour la santé du service
 */
export interface HealthResponseDTO {
  status: string;
  timestamp: string;
  service: string;
}

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
  createdAt: Date;
  updatedAt: Date;
}
