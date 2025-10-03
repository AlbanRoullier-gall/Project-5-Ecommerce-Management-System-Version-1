/**
 * Cart DTOs
 * Data transfer objects pour la gestion des paniers
 */

/**
 * Article à ajouter au panier
 */
export interface CartItemCreateDTO {
  productId: number;
  quantity: number;
  price: number;
}

/**
 * Mise à jour d'un article du panier
 */
export interface CartItemUpdateDTO {
  quantity: number;
}

/**
 * Article du panier (réponse publique)
 */
export interface CartItemPublicDTO {
  id: string;
  productId: number;
  quantity: number;
  price: number;
  total: number;
  addedAt: Date;
}

/**
 * Création d'un panier
 */
export interface CartCreateDTO {
  sessionId: string;
}

/**
 * Panier public (réponse API)
 */
export interface CartPublicDTO {
  id: string;
  sessionId: string;
  items: CartItemPublicDTO[];
  subtotal: number;
  tax: number;
  total: number;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

/**
 * Statistiques du panier
 */
export interface CartStatsDTO {
  totalCarts: number;
  activeCarts: number;
  averageCartValue: number;
  totalItems: number;
  period: string;
}

// ===== DTOs DE RÉPONSE API =====

/**
 * Réponse de création de panier
 */
export interface CartCreateResponse {
  message: string;
  cart: CartPublicDTO;
  timestamp: string;
  status: number;
}

/**
 * Réponse de récupération de panier
 */
export interface CartRetrieveResponse {
  message: string;
  cart: CartPublicDTO;
  timestamp: string;
  status: number;
}

/**
 * Réponse d'ajout d'article
 */
export interface CartItemAddResponse {
  message: string;
  cart: CartPublicDTO;
  timestamp: string;
  status: number;
}

/**
 * Réponse de mise à jour d'article
 */
export interface CartItemUpdateResponse {
  message: string;
  cart: CartPublicDTO;
  timestamp: string;
  status: number;
}

/**
 * Réponse de suppression d'article
 */
export interface CartItemRemoveResponse {
  message: string;
  cart: CartPublicDTO;
  timestamp: string;
  status: number;
}

/**
 * Réponse de vidage de panier
 */
export interface CartClearResponse {
  message: string;
  cart: CartPublicDTO;
  timestamp: string;
  status: number;
}

/**
 * Réponse de validation de panier
 */
export interface CartValidationResponse {
  message: string;
  validation: {
    isValid: boolean;
    errors: string[];
    cart: CartPublicDTO;
  };
  timestamp: string;
  status: number;
}

/**
 * Réponse de statistiques
 */
export interface CartStatsResponse {
  message: string;
  stats: CartStatsDTO;
  timestamp: string;
  status: number;
}
