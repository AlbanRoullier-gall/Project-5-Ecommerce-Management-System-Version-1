/**
 * DTOs pour la gestion des clients
 * DTOs pour les données de gestion des clients
 */

/**
 * DTO pour la création d'un client
 * Correspond à CustomerService.createCustomer()
 */
export interface CustomerCreateDTO {
  civilityId: number;
  firstName: string;
  lastName: string;
  email: string;
  socioProfessionalCategoryId: number;
  phoneNumber?: string;
  birthday?: string; // ISO date string
}

/**
 * DTO pour la mise à jour d'un client
 * Correspond à CustomerService.updateCustomer()
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
 * DTO public pour les informations client
 * (sans données sensibles)
 * Types alignés exactement avec le modèle Customer
 */
export interface CustomerPublicDTO {
  customerId: number | null;
  civilityId: number | null;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  socioProfessionalCategoryId: number | null;
  phoneNumber: string | null;
  birthday: Date | null; // Aligné avec le modèle Customer
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/**
 * DTO pour la liste des clients avec pagination
 */
export interface CustomerListDTO {
  page?: number;
  limit?: number;
  search?: string;
  activeOnly?: boolean;
}
