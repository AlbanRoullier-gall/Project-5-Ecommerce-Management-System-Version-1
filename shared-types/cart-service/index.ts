/**
 * DTOs pour le service panier
 * Types partagés pour l'API REST
 */

// ===== TYPES BASÉS SUR CartItemData =====

/**
 * DTO pour ajouter un article au panier
 */
export interface CartItemCreateDTO {
  productId: number;
  productName?: string; // Nom du produit (snapshot au moment de l'ajout)
  description?: string; // Description du produit (snapshot au moment de l'ajout)
  imageUrl?: string; // URL de la première image du produit (snapshot au moment de l'ajout)
  quantity: number;
  unitPriceTTC: number; // Prix unitaire TTC (remplace price)
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
 * Reflète exactement ce que le cart-service retourne
 */
export interface CartItemPublicDTO {
  id: string;
  productId: number;
  productName?: string; // Nom du produit (snapshot au moment de l'ajout)
  description?: string; // Description du produit (snapshot au moment de l'ajout)
  imageUrl?: string; // URL de la première image du produit (snapshot au moment de l'ajout)
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
