/**
 * Hook personnalisé pour gérer les catégories
 * Centralise la logique de récupération des catégories
 */

import { useState, useEffect, useCallback } from "react";
import { CategoryPublicDTO, CategorySearchDTO } from "../../dto";
import { getCategories } from "../../services/productService";
import { executeWithLoading } from "../../utils";

interface UseCategoriesFilters {
  search?: string;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
}

interface UseCategoriesReturn {
  categories: CategoryPublicDTO[];
  isLoading: boolean;
  error: string | null;
  loadCategories: () => Promise<void>;
}

export function useCategories(
  filters?: UseCategoriesFilters
): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    const result = await executeWithLoading(
      async () => {
        const searchParams: Partial<CategorySearchDTO> = {
          search: filters?.search,
          sortBy: filters?.sortBy || "name",
          sortOrder: filters?.sortOrder || "asc",
        };
        return await getCategories(searchParams);
      },
      setIsLoading,
      setError,
      {
        notFoundMessage: "Catégories introuvables",
        defaultMessage: "Erreur lors du chargement",
      },
      (err) => console.error("Error loading categories:", err)
    );

    if (result) {
      setCategories(result.categories);
    }
  }, [filters?.search, filters?.sortBy, filters?.sortOrder]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    isLoading,
    error,
    loadCategories,
  };
}
