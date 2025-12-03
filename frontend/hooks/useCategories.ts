/**
 * Hook pour récupérer la liste des catégories
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { CategoryPublicDTO, CategorySearchDTO } from "../dto";
import { getCategories } from "../services/productService";
import { logger } from "../services/logger";

interface UseCategoriesResult {
  categories: CategoryPublicDTO[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Compare deux objets de filtres pour voir s'ils sont égaux
 */
function areFiltersEqual(
  a?: Partial<CategorySearchDTO>,
  b?: Partial<CategorySearchDTO>
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    a.search === b.search &&
    a.sortBy === b.sortBy &&
    a.sortOrder === b.sortOrder
  );
}

/**
 * Hook pour charger la liste des catégories avec filtres
 */
export function useCategories(
  filters?: Partial<CategorySearchDTO>
): UseCategoriesResult {
  const [categories, setCategories] = useState<CategoryPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousFiltersRef = useRef<Partial<CategorySearchDTO> | undefined>();

  useEffect(() => {
    // Ne recharger que si les filtres ont vraiment changé
    if (!areFiltersEqual(previousFiltersRef.current, filters)) {
      previousFiltersRef.current = filters;

      const loadCategories = async () => {
        try {
          const result = await getCategories(filters);
          setCategories(result);
        } catch (err) {
          logger.error("Error loading categories", err, { filters });
          // Ne pas afficher d'erreur pour les catégories, juste logger
        }
      };

      loadCategories();
    }
  }, [filters]);

  const refetch = useCallback(async () => {
    try {
      const result = await getCategories(filters);
      setCategories(result);
    } catch (err) {
      logger.error("Error loading categories", err, { filters });
    }
  }, [filters]);

  return {
    categories,
    isLoading,
    error,
    refetch,
  };
}
