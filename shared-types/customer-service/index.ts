/**
 * DTOs pour le service client
 * Types partagés pour l'API REST
 */

// ===== TYPES BASÉS SUR CustomerData =====

/**
 * DTO pour la création d'un client
 * Basé sur CustomerData avec ajout de la validation
 */
export interface CustomerCreateDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

/**
 * DTO pour la mise à jour d'un client
 * Utilise Partial pour rendre tous les champs optionnels
 */
export interface CustomerUpdateDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

/**
 * DTO public pour un client
 * Basé sur CustomerData avec calculs
 */
export interface CustomerPublicDTO {
  customerId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
}

// ===== TYPES POUR LES ADRESSES =====

/**
 * DTO pour la création d'une adresse (livraison uniquement)
 */
export interface AddressCreateDTO {
  addressType: "shipping" | "billing";
  address: string;
  postalCode: string;
  city: string;
  countryName?: string; // Optionnel car toujours "Belgique" par défaut
  isDefault?: boolean;
}

/**
 * DTO pour la mise à jour d'une adresse (livraison uniquement)
 */
export interface AddressUpdateDTO {
  addressType?: "shipping" | "billing";
  address?: string;
  postalCode?: string;
  city?: string;
  countryName?: string; // Optionnel car toujours "Belgique"
  isDefault?: boolean;
}

/**
 * DTO public pour les informations d'adresse (livraison uniquement)
 * Types alignés exactement avec le modèle CustomerAddress
 */
export interface AddressPublicDTO {
  addressId: number;
  customerId: number;
  addressType: "shipping" | "billing";
  address: string;
  postalCode: string;
  city: string;
  countryName: string;
  isDefault: boolean;
}

// ===== TYPES SPÉCIFIQUES =====

/**
 * DTO pour les options de recherche de clients
 */
export interface CustomerListRequestDTO {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * DTO pour résoudre ou créer un client
 */
export interface CustomerResolveOrCreateDTO {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

/**
 * DTO pour créer plusieurs adresses en une fois (shipping + billing)
 */
export interface AddressesCreateDTO {
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
}
