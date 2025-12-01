/**
 * DTOs pour le service panier
 * Types partagés pour l'API REST
 */

import { BaseItemDTO } from "../common/BaseItemDTO";

// ===== TYPES BASÉS SUR CartItemData =====

/**
 * DTO pour ajouter un article au panier
 * Harmonisé avec ProductPublicDTO - productName est requis
 */
export interface CartItemCreateDTO {
  productId: number;
  productName: string; // Requis et non vide - snapshot au moment de l'ajout
  description?: string | null; // Description du produit (snapshot au moment de l'ajout)
  imageUrl?: string | null; // URL de la première image du produit (snapshot au moment de l'ajout)
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
 * Harmonisé avec ProductPublicDTO et OrderItemPublicDTO
 * Étend BaseItemDTO pour partager la structure commune
 */
export interface CartItemPublicDTO extends BaseItemDTO {
  id: string; // Spécifique à Cart (UUID string)
}

// ===== TYPES BASÉS SUR CartData =====

/**
 * Élément du breakdown TVA par taux
 */
export interface VatBreakdownItem {
  rate: number; // Taux de TVA (ex: 6, 12, 21)
  amount: number; // Montant de TVA pour ce taux
}

/**
 * DTO pour les données checkout temporaires
 */
export interface CartCheckoutDataDTO {
  customerData?: {
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  } | null;
  addressData?: {
    shipping?: {
      address?: string;
      postalCode?: string;
      city?: string;
      countryName?: string;
    };
    billing?: {
      address?: string;
      postalCode?: string;
      city?: string;
      countryName?: string;
    };
    useSameBillingAddress?: boolean;
  } | null;
}

/**
 * DTO pour mettre à jour les données checkout
 */
export interface CartCheckoutDataUpdateDTO {
  customerData?: {
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
  addressData?: {
    shipping?: {
      address?: string;
      postalCode?: string;
      city?: string;
      countryName?: string;
    };
    billing?: {
      address?: string;
      postalCode?: string;
      city?: string;
      countryName?: string;
    };
    useSameBillingAddress?: boolean;
  };
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
  itemCount: number; // Nombre total d'articles (somme des quantités) - calculé côté serveur
  vatBreakdown: VatBreakdownItem[]; // Répartition de la TVA par taux
  checkoutData?: CartCheckoutDataDTO | null; // Données checkout temporaires
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

// ===== TYPES SPÉCIFIQUES =====

/**
 * DTO pour les requêtes de panier avec sessionId
 */
export interface CartRequestDTO {
  sessionId: string;
}

/**
 * DTO pour vider le panier
 */
export interface CartClearDTO {
  sessionId: string;
}
