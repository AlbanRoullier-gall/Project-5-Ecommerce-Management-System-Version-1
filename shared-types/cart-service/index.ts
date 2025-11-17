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
  productName?: string; // Nom du produit (optionnel pour rétrocompatibilité)
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
 * Basé sur CartItemData avec calculs HT/TTC complets
 */
export interface CartItemPublicDTO {
  id: string;
  productId: number;
  productName?: string; // Nom du produit (snapshot au moment de l'ajout)
  quantity: number;
  price: number; // Prix unitaire TTC (conservé pour rétrocompatibilité)
  vatRate: number;
  total: number; // Total TTC (conservé pour rétrocompatibilité)
  // Nouveaux champs avec calculs HT/TTC complets
  unitPriceHT: number; // Prix unitaire HT
  unitPriceTTC: number; // Prix unitaire TTC (identique à price)
  totalPriceHT: number; // Total HT
  totalPriceTTC: number; // Total TTC (identique à total)
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
 * DTO pour résoudre un cartSessionId depuis différentes sources
 */
export interface CartSessionResolveDTO {
  cartSessionId?: string; // Source principale : cartSessionId fourni directement
  stripeSessionMetadata?: {
    // Source de secours : métadonnées Stripe contenant cartSessionId
    cartSessionId?: string;
    [key: string]: any;
  };
}

/**
 * DTO de réponse pour la résolution de session
 */
export interface CartSessionResolveResponseDTO {
  cartSessionId: string | null;
  resolved: boolean;
  source?: "provided" | "stripe_metadata";
}
