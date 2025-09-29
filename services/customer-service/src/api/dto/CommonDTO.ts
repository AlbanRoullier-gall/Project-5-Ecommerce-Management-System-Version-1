/**
 * DTOs Communs
 * Types partagés pour les réponses API
 */

/**
 * DTO pour les informations de civilité
 */
export interface CivilityDTO {
  civilityId: number;
  label: string;
}

/**
 * DTO pour les informations de pays
 */
export interface CountryDTO {
  countryId: number;
  name: string;
  code: string;
}

/**
 * DTO pour les informations de catégorie socio-professionnelle
 */
export interface SocioProfessionalCategoryDTO {
  categoryId: number;
  label: string;
}
