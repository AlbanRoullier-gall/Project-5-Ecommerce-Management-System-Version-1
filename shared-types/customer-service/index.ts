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
  civilityId?: number;
  firstName: string;
  lastName: string;
  email: string;
  socioProfessionalCategoryId?: number;
  phoneNumber?: string;
  birthday?: string; // ISO date string
}

/**
 * DTO pour la mise à jour d'un client
 * Utilise Partial pour rendre tous les champs optionnels
 */
export interface CustomerUpdateDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  socioProfessionalCategoryId?: number;
  phoneNumber?: string;
  birthday?: string; // ISO date string
}

/**
 * DTO public pour un client
 * Basé sur CustomerData avec calculs
 */
export interface CustomerPublicDTO {
  customerId: number;
  civilityId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  socioProfessionalCategoryId: number;
  phoneNumber: string | null;
  birthday: Date | null;
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

// ===== TYPES POUR LES ENTREPRISES =====

/**
 * DTO pour la création d'une entreprise
 */
export interface CompanyCreateDTO {
  companyName: string;
  siretNumber?: string;
  vatNumber?: string;
}

/**
 * DTO pour la mise à jour d'une entreprise
 */
export interface CompanyUpdateDTO {
  companyName?: string;
  siretNumber?: string;
  vatNumber?: string;
}

/**
 * DTO public pour les informations d'entreprise
 * Types alignés exactement avec le modèle CustomerCompany
 */
export interface CompanyPublicDTO {
  companyId: number | null;
  customerId: number | null;
  companyName: string;
  siretNumber: string | null; // Aligné avec la DB (nullable)
  vatNumber: string | null; // Aligné avec la DB (nullable)
  createdAt: Date | null;
  updatedAt: Date | null;
}

/**
 * DTO de réponse pour la liste des entreprises
 */
export interface CompanyListResponse {
  message: string;
  companies: CompanyPublicDTO[];
}

// ===== TYPES COMMUNS =====

/**
 * DTO pour les informations de civilité
 */
export interface CivilityDTO {
  civilityId: number;
  abbreviation: string;
}

/**
 * DTO pour les informations de pays (uniquement la Belgique)
 */
export interface CountryDTO {
  countryName: string;
}

/**
 * DTO pour les informations de catégorie socio-professionnelle
 */
export interface SocioProfessionalCategoryDTO {
  categoryId: number;
  categoryName: string;
}
