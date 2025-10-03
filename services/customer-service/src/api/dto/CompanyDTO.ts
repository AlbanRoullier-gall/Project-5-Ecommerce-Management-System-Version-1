/**
 * DTOs pour la gestion des entreprises
 * DTOs pour les données d'entreprises des clients
 */

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
  siretNumber: string; // Aligné avec le modèle CustomerCompany (non nullable)
  vatNumber: string; // Aligné avec le modèle CustomerCompany (non nullable)
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
