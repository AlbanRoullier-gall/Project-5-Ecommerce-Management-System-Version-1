/**
 * Utilitaires pour les formulaires
 * Centralise les transformations de données pour les formulaires
 */

import { CategoryPublicDTO } from "dto";

/**
 * Transforme une liste de catégories en options pour un select
 */
export function categoriesToOptions(categories: CategoryPublicDTO[]) {
  return categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));
}

/**
 * Calcule les données de mise à jour en comparant les valeurs du formulaire avec l'entité originale
 * Ne retourne que les champs qui ont changé
 */
export function computeUpdateData<T extends Record<string, any>>(
  formData: Partial<T>,
  original: T | null,
  options?: {
    /** Champs à ignorer lors de la comparaison */
    ignoreFields?: (keyof T)[];
    /** Fonction personnalisée pour comparer deux valeurs */
    compareFn?: (field: keyof T, formValue: any, originalValue: any) => boolean;
  }
): Partial<T> {
  if (!original) {
    return formData;
  }

  const updateData: Partial<T> = {};
  const ignoreFields = new Set(options?.ignoreFields || []);

  for (const key in formData) {
    if (ignoreFields.has(key)) continue;

    const formValue = formData[key];
    const originalValue = original[key];

    // Utiliser la fonction de comparaison personnalisée si fournie
    if (options?.compareFn) {
      if (!options.compareFn(key, formValue, originalValue)) {
        updateData[key] = formValue;
      }
    } else {
      // Comparaison par défaut
      if (formValue !== originalValue) {
        updateData[key] = formValue;
      }
    }
  }

  return updateData;
}
