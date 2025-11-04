/**
 * ResponseMapper
 * Mapper pour créer les réponses standardisées de l'API Gateway
 *
 * Architecture : Mapper pattern
 * - Réponses cohérentes et standardisées
 * - Format uniforme pour toutes les réponses
 */

export class ResponseMapper {
  /**
   * Réponse de succès générique
   */
  static success(message: string, data?: any) {
    return {
      message,
      ...(data && { data }),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Réponse de santé du service
   */
  static healthSuccess(service: string = "API Gateway") {
    return {
      status: "OK",
      service,
      timestamp: new Date().toISOString(),
      version: "3.0.0",
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
  static authenticationError(message: string = "Token d'accès requis") {
    return {
      error: "Erreur d'authentification",
      message,
      timestamp: new Date().toISOString(),
      status: 401,
    };
  }

  /**
   * Réponse d'erreur interne du serveur
   */
  static internalServerError(message: string = "Erreur interne du serveur") {
    return {
      error: "Internal Server Error",
      message,
      timestamp: new Date().toISOString(),
      status: 500,
    };
  }

  /**
   * Réponse d'erreur de service indisponible
   */
  static serviceUnavailable(service: string) {
    return {
      error: "Service indisponible",
      message: `Le service ${service} n'est pas disponible`,
      timestamp: new Date().toISOString(),
      status: 503,
    };
  }
}
