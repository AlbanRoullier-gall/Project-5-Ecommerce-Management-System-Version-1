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
   * Réponse de produit créé
   */
  static productCreated(product: any) {
    return {
      message: "Produit créé avec succès",
      product,
    };
  }

  /**
   * Réponse de produit récupéré
   */
  static productRetrieved(product: any) {
    return {
      message: "Produit récupéré avec succès",
      product,
    };
  }

  /**
   * Réponse de produit mis à jour
   */
  static productUpdated(product: any) {
    return {
      message: "Produit mis à jour avec succès",
      product,
    };
  }

  /**
   * Réponse de produit supprimé
   */
  static productDeleted() {
    return {
      message: "Produit supprimé avec succès",
    };
  }

  /**
   * Réponse de liste de produits
   * Format standardisé avec data et pagination
   */
  static productListed(result: any) {
    return {
      message: "Liste des produits récupérée avec succès",
      data: {
        products: result.products || [],
        pagination: result.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      },
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse de catégorie créée
   */
  static categoryCreated(category: any) {
    return {
      message: "Catégorie créée avec succès",
      category,
    };
  }

  /**
   * Réponse de catégorie récupérée
   */
  static categoryRetrieved(category: any) {
    return {
      message: "Catégorie récupérée avec succès",
      category,
    };
  }

  /**
   * Réponse de catégorie mise à jour
   */
  static categoryUpdated(category: any) {
    return {
      message: "Catégorie mise à jour avec succès",
      category,
    };
  }

  /**
   * Réponse de catégorie supprimée
   */
  static categoryDeleted() {
    return {
      message: "Catégorie supprimée avec succès",
    };
  }

  /**
   * Réponse de liste de catégories
   */
  static categoryListed(categories: any[]) {
    return {
      message: "Liste des catégories récupérée avec succès",
      categories,
    };
  }

  /**
   * Réponse de liste de catégories avec pagination (CategorySearchDTO)
   */
  static categoryListedWithPagination(categories: any[], pagination: any) {
    return {
      categories,
      pagination,
    };
  }

  /**
   * Réponse d'image créée
   */
  static imageCreated(image: any) {
    return {
      message: "Image créée avec succès",
      image,
    };
  }

  /**
   * Réponse d'image récupérée
   */
  static imageRetrieved(image: any) {
    return {
      message: "Image récupérée avec succès",
      image,
    };
  }

  /**
   * Réponse d'image mise à jour
   */
  static imageUpdated(image: any) {
    return {
      message: "Image mise à jour avec succès",
      image,
    };
  }

  /**
   * Réponse d'image supprimée
   */
  static imageDeleted() {
    return {
      message: "Image supprimée avec succès",
    };
  }

  /**
   * Réponse de liste d'images
   */
  static imageListed(images: any[]) {
    return {
      message: "Liste des images récupérée avec succès",
      images,
    };
  }

  /**
   * Réponse de santé du service
   */
  static healthSuccess() {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "product-service",
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
      service: "product-service",
      error: "Service indisponible",
    };
  }
}
