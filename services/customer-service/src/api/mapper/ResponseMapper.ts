/**
 * ResponseMapper
 * Mapper pour créer les réponses standardisées
 *
 * Architecture : Mapper pattern (simplified like auth-service)
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
   * Réponse de succès avec données (format standardisé)
   */
  static successWithData<T>(
    data: T,
    message: string = "Success"
  ): {
    message: string;
    data: T;
    timestamp: string;
    status: number;
  } {
    return {
      message,
      data,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse de création avec données (format standardisé)
   */
  static createdWithData<T>(
    data: T,
    message: string = "Created successfully"
  ): {
    message: string;
    data: T;
    timestamp: string;
    status: number;
  } {
    return {
      message,
      data,
      timestamp: new Date().toISOString(),
      status: 201,
    };
  }

  /**
   * Réponse de client créé
   */
  static customerCreated(customer: any) {
    return {
      message: "Client créé avec succès",
      customer,
      timestamp: new Date().toISOString(),
      status: 201,
    };
  }

  /**
   * Réponse de client récupéré
   */
  static customerRetrieved(customer: any) {
    return {
      message: "Client récupéré avec succès",
      customer,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse de client mis à jour
   */
  static customerUpdated(customer: any) {
    return {
      message: "Client mis à jour avec succès",
      customer,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse de client supprimé
   */
  static customerDeleted() {
    return {
      message: "Client supprimé avec succès",
    };
  }

  /**
   * Réponse de liste de clients
   * Format standardisé avec data et pagination
   */
  static customersListed(result: any) {
    return {
      message: "Liste des clients récupérée avec succès",
      data: {
        customers: result.customers || [],
      },
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse d'adresse créée
   */
  static addressCreated(address: any) {
    return {
      message: "Adresse créée avec succès",
      address,
    };
  }

  /**
   * Réponse d'adresse mise à jour
   */
  static addressUpdated(address: any) {
    return {
      message: "Adresse mise à jour avec succès",
      address,
    };
  }

  /**
   * Réponse d'adresse supprimée
   */
  static addressDeleted() {
    return {
      message: "Adresse supprimée avec succès",
    };
  }

  /**
   * Réponse d'adresse récupérée
   */
  static addressRetrieved(address: any) {
    return {
      message: "Adresse récupérée avec succès",
      address,
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
  static notFoundError(resource: string = "Ressource") {
    return {
      error: `${resource} non trouvé`,
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
   * Réponse d'erreur non autorisé
   */
  static unauthorizedError(message: string = "Non autorisé") {
    return {
      error: "Non autorisé",
      message,
    };
  }

  /**
   * Réponse d'erreur interdit
   */
  static forbiddenError(message: string = "Interdit") {
    return {
      error: "Interdit",
      message,
    };
  }

  /**
   * Réponse d'erreur serveur interne
   */
  static internalServerError() {
    return {
      error: "Erreur interne du serveur",
      message: "Une erreur inattendue s'est produite",
      timestamp: new Date().toISOString(),
      status: 500,
    };
  }
}
