/**
 * DTOs pour le service panier
 * Types partagés pour l'API REST
 */

import { ProductPublicDTO } from "../product-service";

// ===== TYPES BASÉS SUR CartItemData =====

/**
 * DTO pour ajouter un article au panier
 */
export interface CartItemCreateDTO {
  productId: number;
  quantity: number;
  price: number;
  vatRate: number;
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
 */
export interface CartItemPublicDTO {
  id: string;
  productId: number;
  product?: ProductPublicDTO;
  quantity: number;
  vatRate: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  totalPriceHT: number;
  totalPriceTTC: number;
  addedAt: Date;
}

// ===== TYPES BASÉS SUR CartData =====

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
 * DTO pour vider le panier
 */
export interface CartClearDTO {
  sessionId: string;
}

/**
 * DTO pour résoudre un cartSessionId
 */
export interface CartSessionResolveDTO {
  cartSessionId?: string; // cartSessionId à vérifier
}

/**
 * DTO de réponse pour la résolution de session
 */
export interface CartSessionResolveResponseDTO {
  cartSessionId: string | null;
  resolved: boolean;
}
