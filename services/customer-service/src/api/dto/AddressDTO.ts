/**
 * DTOs pour la gestion des adresses
 * DTOs pour les données d'adresses des clients
 */

/**
 * DTO pour la création d'une adresse
 */
export interface AddressCreateDTO {
  addressType: "shipping" | "billing";
  address: string;
  postalCode: string;
  city: string;
  countryId: number;
  isDefault?: boolean;
}

/**
 * DTO pour la mise à jour d'une adresse
 */
export interface AddressUpdateDTO {
  addressType?: "shipping" | "billing";
  address?: string;
  postalCode?: string;
  city?: string;
  countryId?: number;
  isDefault?: boolean;
}

/**
 * DTO public pour les informations d'adresse
 * Types alignés exactement avec le modèle CustomerAddress
 */
export interface AddressPublicDTO {
  addressId: number | null;
  customerId: number | null;
  addressType: string; // Aligné avec le modèle CustomerAddress
  address: string;
  postalCode: string;
  city: string;
  countryId: number | null;
  isDefault: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}
