/**
 * DTOs pour le service panier
 * Types partagés pour l'API REST
 */

// ===== TYPES BASÉS SUR CartItemData =====

/**
 * DTO pour ajouter un article au panier
 * Basé sur CartItemData avec ajout de la session
 */
export interface CartItemCreateDTO {
  productId: number;
  quantity: number;
  price: number;
  vatRate: number; // taux de TVA du produit (en %)
}

/**
 * DTO pour mettre à jour un article du panier
 * Utilise Partial pour rendre tous les champs optionnels
 */
export interface CartItemUpdateDTO {
  quantity?: number;
}

/**
 * DTO public pour un article du panier
 * Basé sur CartItemData avec calculs
 */
export interface CartItemPublicDTO {
  id: string;
  productId: number;
  quantity: number;
  price: number;
  vatRate: number;
  total: number;
  addedAt: Date;
}

// ===== TYPES BASÉS SUR CartData =====

/**
 * DTO pour créer un panier
 * Basé sur CartData avec session
 */
export interface CartCreateDTO {
  sessionId: string;
}

/**
 * DTO public pour un panier
 * Basé sur CartData avec articles
 */
export interface CartPublicDTO {
  id: string;
  sessionId: string;
  items: CartItemPublicDTO[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

// ===== TYPES SPÉCIFIQUES =====

/**
 * DTO pour les options de récupération de panier
 */
export interface CartGetOptionsDTO {
  sessionId: string;
}

/**
 * DTO pour vider le panier
 */
export interface CartClearDTO {
  sessionId: string;
}
