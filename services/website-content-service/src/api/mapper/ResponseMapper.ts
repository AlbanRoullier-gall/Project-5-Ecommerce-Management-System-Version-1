/**
 * ResponseMapper
 * Mapper pour créer les réponses standardisées
 *
 * Architecture : Mapper pattern
 * - Réponses cohérentes et standardisées
 * - Séparation des formats de réponse
 */

export class ResponseMapper {
  /**
   * Réponse de succès générique
   */
  static success(message: string): { message: string } {
    return { message };
  }

  /**
   * Réponse de page créée
   */
  static pageCreated(page: any) {
    return {
      message: "Page créée avec succès",
      page,
    };
  }

  /**
   * Réponse de page récupérée
   */
  static pageRetrieved(page: any) {
    return {
      message: "Page récupérée avec succès",
      page,
    };
  }

  /**
   * Réponse de page mise à jour
   */
  static pageUpdated(page: any) {
    return {
      message: "Page mise à jour avec succès",
      page,
    };
  }

  /**
   * Réponse de page supprimée
   */
  static pageDeleted() {
    return {
      message: "Page supprimée avec succès",
    };
  }

  /**
   * Réponse de liste de pages
   */
  static pageListed(result: any) {
    return {
      pages: result.pages,
      pagination: result.pagination,
    };
  }

  /**
   * Réponse de slugs récupérés
   */
  static slugsRetrieved(slugs: string[]) {
    return {
      message: "Slugs récupérés avec succès",
      slugs,
    };
  }

  /**
   * Réponse de version créée
   */
  static versionCreated(version: any) {
    return {
      message: "Version créée avec succès",
      version,
    };
  }

  /**
   * Réponse de version récupérée
   */
  static versionRetrieved(version: any) {
    return {
      message: "Version récupérée avec succès",
      version,
    };
  }

  /**
   * Réponse de version mise à jour
   */
  static versionUpdated(version: any) {
    return {
      message: "Version mise à jour avec succès",
      version,
    };
  }

  /**
   * Réponse de version supprimée
   */
  static versionDeleted() {
    return {
      message: "Version supprimée avec succès",
    };
  }

  /**
   * Réponse de liste de versions
   */
  static versionListed(versions: any[]) {
    return {
      message: "Liste des versions récupérée avec succès",
      versions,
    };
  }

  /**
   * Réponse de rollback réussi
   */
  static rollbackSuccess(page: any) {
    return {
      message: "Page restaurée avec succès",
      page,
    };
  }

  /**
   * Réponse de santé du service
   */
  static healthSuccess() {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "website-content-service",
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
   * Réponse d'erreur de ressource non trouvée
   */
  static notFoundError(resource: string) {
    return {
      error: "Ressource non trouvée",
      message: `${resource} non trouvé`,
      timestamp: new Date().toISOString(),
      status: 404,
    };
  }

  /**
   * Réponse d'erreur de conflit
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
      service: "website-content-service",
      error: "Service indisponible",
    };
  }
}
