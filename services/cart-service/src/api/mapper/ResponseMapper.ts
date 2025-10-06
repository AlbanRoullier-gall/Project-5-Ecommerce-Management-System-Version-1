/**
 * ResponseMapper - Version simplifiée pour Cart
 * Mapper pour créer les réponses standardisées
 */

import { CartMapper } from "./CartMapper";
import { Cart } from "../../models/Cart";

export class ResponseMapper {
  /**
   * Réponse de panier créé
   */
  static cartCreated(cart: Cart) {
    return {
      message: "Panier créé avec succès",
      cart: CartMapper.cartToPublicDTO(cart),
      timestamp: new Date().toISOString(),
      status: 201,
    };
  }

  /**
   * Réponse de panier récupéré
   */
  static cartRetrieved(cart: Cart) {
    return {
      message: "Panier récupéré avec succès",
      cart: CartMapper.cartToPublicDTO(cart),
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse d'article ajouté
   */
  static itemAdded(cart: Cart) {
    return {
      message: "Article ajouté au panier avec succès",
      cart: CartMapper.cartToPublicDTO(cart),
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse d'article mis à jour
   */
  static itemUpdated(cart: Cart) {
    return {
      message: "Article mis à jour avec succès",
      cart: CartMapper.cartToPublicDTO(cart),
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse d'article supprimé
   */
  static itemRemoved(cart: Cart) {
    return {
      message: "Article supprimé du panier avec succès",
      cart: CartMapper.cartToPublicDTO(cart),
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse de panier vidé
   */
  static cartCleared(cart: Cart) {
    return {
      message: "Panier vidé avec succès",
      cart: CartMapper.cartToPublicDTO(cart),
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse de paniers fusionnés
   */
  static cartsMerged(cart: any) {
    return {
      message: "Paniers fusionnés avec succès",
      cart,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse de panier validé
   */
  static cartValidated(result: any) {
    return {
      message: result.isValid ? "Panier valide" : "Panier invalide",
      validation: result,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse de statistiques
   */
  static cartStats(stats: any) {
    return {
      message: "Statistiques récupérées avec succès",
      stats,
      timestamp: new Date().toISOString(),
      status: 200,
    };
  }

  /**
   * Réponse de santé du service
   */
  static healthSuccess() {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "cart-service",
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
      service: "cart-service",
      error: "Service indisponible",
    };
  }
}
