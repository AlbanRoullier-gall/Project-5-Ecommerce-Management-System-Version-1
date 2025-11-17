/**
 * Mapper de Réponse - Version simplifiée pour Stripe
 * Mapper pour créer les réponses standardisées
 */

export class ResponseMapper {
  /**
   * Réponse de paiement créé
   */
  static paymentCreated(payment: any) {
    return {
      message: "Paiement créé avec succès",
      payment,
    };
  }

  // (Réponse de paiement confirmé supprimée)

  /**
   * Réponse de santé du service
   */
  static healthSuccess() {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "payment-service",
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
   * Réponse d'erreur de paiement
   */
  static paymentError(message: string) {
    return {
      error: "Erreur de paiement",
      message,
      timestamp: new Date().toISOString(),
      status: 402,
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
      service: "payment-service",
      error: "Service indisponible",
    };
  }

  /**
   * Réponse de session Stripe récupérée
   */
  static sessionRetrieved(session: any, paymentIntentId?: string) {
    return {
      success: true,
      session,
      paymentIntentId,
      timestamp: new Date().toISOString(),
    };
  }
}
