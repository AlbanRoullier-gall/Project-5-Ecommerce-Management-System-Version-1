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
  addressId: number;
  customerId: number;
  addressType: string;
  address: string;
  postalCode: string;
  city: string;
  countryId: number;
  isDefault: boolean;
}

/**
 * DTO de réponse pour la liste des adresses
 */
export interface AddressListResponse {
  message: string;
  addresses: AddressPublicDTO[];
}
