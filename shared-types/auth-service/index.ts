/**
 * DTOs pour le service d'authentification
 * Types partagés pour l'API REST
 */

// ===== TYPES BASÉS SUR UserData =====

/**
 * DTO pour l'inscription d'utilisateur
 * Utilise les noms camelCase pour l'API REST
 */
export interface UserCreateDTO {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
}

/**
 * DTO pour la connexion d'utilisateur
 * Basé sur UserData avec ajout du mot de passe
 */
export interface UserLoginDTO {
  email: string;
  password: string;
}

// ===== TYPES SPÉCIFIQUES (non basés sur UserData) =====

/**
 * DTO pour la validation de mot de passe
 */
export interface PasswordValidationDTO {
  password: string;
}

/**
 * DTO pour la demande de réinitialisation de mot de passe
 */
export interface PasswordResetRequestDTO {
  email: string;
}

/**
 * DTO pour la réinitialisation de mot de passe
 */
export interface PasswordResetDTO {
  token: string;
  newPassword: string;
}

/**
 * DTO public pour les informations utilisateur
 * (sans données sensibles comme le mot de passe)
 * Inclut tous les champs nécessaires pour le frontend
 */
export interface UserPublicDTO {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  isBackofficeApproved: boolean;
  isBackofficeRejected: boolean;
  isSuperAdmin: boolean;
  createdAt?: string; // Format ISO 8601
}
