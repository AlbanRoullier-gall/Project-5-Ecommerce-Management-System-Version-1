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
  static registerSuccess(user: UserPublicDTO, token: string) {
    return {
      message: "Inscription réussie",
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
   * Réponse de profil mis à jour
   */
  static profileUpdateSuccess(user: UserPublicDTO) {
    return {
      message: "Profil mis à jour avec succès",
      user,
    };
  }

  /**
   * Réponse de changement de mot de passe
   */
  static passwordChangeSuccess() {
    return {
      message: "Mot de passe modifié avec succès",
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
}
