/**
 * Mapper de Réponse
 * Formatage standardisé des réponses API
 *
 * Architecture : Pattern Mapper
 * - Structure de réponse cohérente
 * - Gestion des erreurs
 * - Inclusion du timestamp et du statut
 */

/**
 * Mapper de Réponse pour les réponses API standardisées
 */
export class ResponseMapper {
  /**
   * Réponse de succès
   */
  static success<T>(data: T, message: string = "Success") {
    return {
      message,
      data,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse de création
   */
  static created<T>(data: T, message: string = "Created successfully") {
    return {
      message,
      data,
      timestamp: new Date().toISOString(),
      status: 201,
    };
  }

  /**
   * Réponse de commande créée
   */
  static orderCreated(order: any) {
    return {
      message: "Order created successfully",
      order,
      timestamp: new Date().toISOString(),
      status: 201,
    };
  }

  /**
   * Réponse de commande récupérée
   */
  static orderRetrieved(order: any) {
    return {
      message: "Order retrieved successfully",
      order,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse de commande mise à jour
   */
  static orderUpdated(order: any) {
    return {
      message: "Order updated successfully",
      order,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse de commande supprimée
   */
  static orderDeleted() {
    return {
      message: "Order deleted successfully",
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse d'article de commande créé
   */
  static orderItemCreated(orderItem: any) {
    return {
      message: "Order item created successfully",
      orderItem,
      timestamp: new Date().toISOString(),
      status: 201,
    };
  }

  /**
   * Réponse d'article de commande récupéré
   */
  static orderItemRetrieved(orderItem: any) {
    return {
      message: "Order item retrieved successfully",
      orderItem,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse d'article de commande mis à jour
   */
  static orderItemUpdated(orderItem: any) {
    return {
      message: "Order item updated successfully",
      orderItem,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse d'article de commande supprimé
   */
  static orderItemDeleted() {
    return {
      message: "Order item deleted successfully",
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse d'avoir créé
   */
  static creditNoteCreated(creditNote: any) {
    return {
      message: "Credit note created successfully",
      creditNote,
      timestamp: new Date().toISOString(),
      status: 201,
    };
  }

  /**
   * Réponse d'avoir récupéré
   */
  static creditNoteRetrieved(creditNote: any) {
    return {
      message: "Credit note retrieved successfully",
      creditNote,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse d'avoir mis à jour
   */
  static creditNoteUpdated(creditNote: any) {
    return {
      message: "Credit note updated successfully",
      creditNote,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse d'avoir supprimé
   */
  static creditNoteDeleted() {
    return {
      message: "Credit note deleted successfully",
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse d'article d'avoir créé
   */
  static creditNoteItemCreated(creditNoteItem: any) {
    return {
      message: "Credit note item created successfully",
      creditNoteItem,
      timestamp: new Date().toISOString(),
      status: 201,
    };
  }

  /**
   * Réponse d'article d'avoir récupéré
   */
  static creditNoteItemRetrieved(creditNoteItem: any) {
    return {
      message: "Credit note item retrieved successfully",
      creditNoteItem,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse d'article d'avoir mis à jour
   */
  static creditNoteItemUpdated(creditNoteItem: any) {
    return {
      message: "Credit note item updated successfully",
      creditNoteItem,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse d'article d'avoir supprimé
   */
  static creditNoteItemDeleted() {
    return {
      message: "Credit note item deleted successfully",
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse d'adresse de commande créée
   */
  static orderAddressCreated(address: any) {
    return {
      message: "Order address created successfully",
      address,
      timestamp: new Date().toISOString(),
      status: 201,
    };
  }

  /**
   * Réponse d'adresse de commande récupérée
   */
  static orderAddressRetrieved(address: any) {
    return {
      message: "Order address retrieved successfully",
      address,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse d'adresse de commande mise à jour
   */
  static orderAddressUpdated(address: any) {
    return {
      message: "Order address updated successfully",
      address,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse d'adresse de commande supprimée
   */
  static orderAddressDeleted() {
    return {
      message: "Order address deleted successfully",
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse de statistiques de commandes récupérées
   */
  static orderStatisticsRetrieved(statistics: any) {
    return {
      message: "Order statistics retrieved successfully",
      statistics,
      timestamp: new Date().toISOString(),
      status: 200,
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
   * Réponse d'erreur non trouvé
   */
  static notFoundError(resource: string) {
    return {
      error: "Ressource non trouvée",
      message: `${resource} not found`,
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
   * Réponse d'erreur serveur interne
   */
  static internalServerError() {
    return {
      error: "Erreur interne du serveur",
      message: "Internal server error",
      timestamp: new Date().toISOString(),
      status: 500,
    };
  }

  /**
   * Réponse d'erreur non autorisé
   */
  static unauthorizedError(message: string = "Unauthorized") {
    return {
      error: "Non autorisé",
      message,
      timestamp: new Date().toISOString(),
      status: 401,
    };
  }

  /**
   * Réponse d'erreur interdit
   */
  static forbiddenError(message: string = "Forbidden") {
    return {
      error: "Interdit",
      message,
      timestamp: new Date().toISOString(),
      status: 403,
    };
  }

  /**
   * Réponse d'erreur de mauvaise requête
   */
  static badRequestError(message: string = "Bad request") {
    return {
      error: "Requête invalide",
      message,
      timestamp: new Date().toISOString(),
      status: 400,
    };
  }

  /**
   * Réponse d'erreur méthode non autorisée
   */
  static methodNotAllowedError(message: string = "Method not allowed") {
    return {
      error: "Méthode non autorisée",
      message,
      timestamp: new Date().toISOString(),
      status: 405,
    };
  }

  /**
   * Réponse d'erreur de timeout de requête
   */
  static timeoutError(message: string = "Request timeout") {
    return {
      error: "Timeout de requête",
      message,
      timestamp: new Date().toISOString(),
      status: 408,
    };
  }

  /**
   * Réponse d'erreur service indisponible
   */
  static serviceUnavailableError(message: string = "Service unavailable") {
    return {
      error: "Service indisponible",
      message,
      timestamp: new Date().toISOString(),
      status: 503,
    };
  }

  /**
   * Réponse d'erreur de timeout de passerelle
   */
  static gatewayTimeoutError(message: string = "Gateway timeout") {
    return {
      error: "Timeout de passerelle",
      message,
      timestamp: new Date().toISOString(),
      status: 504,
    };
  }

  /**
   * Réponse de succès de contrôle de santé
   */
  static healthSuccess() {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "order-service",
    };
  }

  /**
   * Réponse d'erreur de contrôle de santé
   */
  static healthError() {
    return {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      service: "order-service",
      error: "Service indisponible",
      message: "Service indisponible",
    };
  }

  /**
   * Réponse d'erreur générique
   */
  static error(message: string, status: number = 500) {
    return {
      error: message || "Une erreur est survenue",
      message: message || "Une erreur est survenue",
      timestamp: new Date().toISOString(),
      status,
    };
  }
}
