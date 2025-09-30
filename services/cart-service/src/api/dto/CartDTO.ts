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
