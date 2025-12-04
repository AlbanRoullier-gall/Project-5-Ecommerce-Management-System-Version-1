/**
 * Utilitaires pour les formulaires
 * Centralise les transformations de données pour les formulaires
 */

import { CategoryPublicDTO } from "../dto";

/**
 * Transforme une liste de catégories en options pour un select
 */
export function categoriesToOptions(categories: CategoryPublicDTO[]) {
  return categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));
}

