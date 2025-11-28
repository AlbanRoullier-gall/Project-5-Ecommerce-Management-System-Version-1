/**
 * Types de base communs pour les items (Cart, Order, etc.)
 * Permet de partager la structure commune entre différents types d'items
 */

/**
 * DTO de base pour un item de produit
 * Contient tous les champs communs entre CartItem et OrderItem
 * Après harmonisation complète des DTOs
 */
export interface BaseItemDTO {
  productId: number;
  productName: string; // Requis et non vide
  description?: string | null; // Description du produit (snapshot)
  imageUrl?: string | null; // URL de la première image (snapshot)
  quantity: number;
  vatRate: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  totalPriceHT: number;
  totalPriceTTC: number;
  createdAt: Date;
}
