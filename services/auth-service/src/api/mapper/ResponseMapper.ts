/**
 * ResponseMapper
 * Mapper pour créer les réponses standardisées
 *
 * Architecture : Mapper pattern
 * - Réponses cohérentes et standardisées
 * - Séparation des formats de réponse
 */
import { UserPublicDTO } from "../dto";

export class ResponseMapper {
  /**
   * Réponse de succès générique
   */
  static success(message: string): { message: string } {
    return { message };
  }

  /**
   * Réponse d'inscription réussie
   */
  static registerSuccess(
    user: UserPublicDTO,
    token: string,
    customMessage?: string
  ) {
    return {
      message: customMessage || "Inscription réussie",
      user,
      token,
    };
  }

  /**
   * Réponse de connexion réussie
   */
  static loginSuccess(user: UserPublicDTO, token: string) {
    return {
      message: "Connexion réussie",
      user,
      token,
    };
  }

  /**
   * Réponse de déconnexion
   */
  static logoutSuccess() {
    return {
      message: "Déconnexion réussie",
    };
  }

  /**
   * Réponse de santé du service
   */
  static healthSuccess() {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "auth-service",
    };
  }

  // ===== GESTION DES ERREURS =====

  /**
   * Réponse d'erreur générique
   */
  static error(message: string, status: number = 500) {
    return {
      error: message,
      timestamp: new Date().toISOString(),
      status,
    };
  }

  /**
   * Réponse d'erreur de validation
   */
  static validationError(message: string) {
    return {
      error: "Erreur de validation",
      message,
      timestamp: new Date().toISOString(),
      status: 400,
    };
  }

  /**
   * Réponse d'erreur d'authentification
   */
  static authenticationError(message: string = "Identifiants invalides") {
    return {
      error: "Erreur d'authentification",
      message,
      timestamp: new Date().toISOString(),
      status: 401,
    };
  }

  /**
   * Réponse d'erreur de conflit (email déjà utilisé)
   */
  static conflictError(message: string) {
    return {
      error: "Conflit",
      message,
      timestamp: new Date().toISOString(),
      status: 409,
    };
  }

  /**
   * Réponse d'erreur interne du serveur
   */
  static internalServerError() {
    return {
      error: "Erreur interne du serveur",
      message: "Une erreur inattendue s'est produite",
      timestamp: new Date().toISOString(),
      status: 500,
    };
  }

  /**
   * Réponse d'erreur de santé du service
   */
  static healthError() {
    return {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      service: "auth-service",
      error: "Service indisponible",
    };
  }
}
