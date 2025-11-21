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

// ===== TYPES SPÉCIFIQUES =====

/**
 * DTO pour la réponse de liste de clients
 */
export interface CustomerListDTO {
  customers: CustomerPublicDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

/**
 * DTO de réponse pour la liste des adresses
 */
export interface AddressListResponse {
  message: string;
  addresses: AddressPublicDTO[];
}

// ===== TYPES COMMUNS =====

/**
 * DTO pour les informations de pays (uniquement la Belgique)
 */
export interface CountryDTO {
  countryName: string;
}
