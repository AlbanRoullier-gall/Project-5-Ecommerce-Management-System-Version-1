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
   * Réponse d'entreprise créée
   */
  static companyCreated(company: any) {
    return {
      message: "Entreprise créée avec succès",
      company,
    };
  }

  /**
   * Réponse d'entreprise mise à jour
   */
  static companyUpdated(company: any) {
    return {
      message: "Entreprise mise à jour avec succès",
      company,
    };
  }

  /**
   * Réponse d'entreprise supprimée
   */
  static companyDeleted() {
    return {
      message: "Entreprise supprimée avec succès",
    };
  }

  /**
   * Réponse d'entreprise récupérée
   */
  static companyRetrieved(company: any) {
    return {
      message: "Entreprise récupérée avec succès",
      company,
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
