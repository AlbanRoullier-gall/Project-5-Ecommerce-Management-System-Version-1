import { useState, useMemo } from "react";
import { useProducts } from "./useProducts";
import { useCategories } from "./useCategories";

interface UseCatalogResult {
  selectedCategoryId: number;
  setSelectedCategoryId: (id: number) => void;
  products: ReturnType<typeof useProducts>["products"];
  isLoading: boolean;
  error: string | null;
  categories: ReturnType<typeof useCategories>["categories"];
}

/**
 * Hook pour gérer la logique du catalogue de produits
 * Encapsule la sélection de catégorie et les filtres
 */
export function useCatalog(): UseCatalogResult {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);

  // Mémoriser les filtres pour éviter les re-renders infinis
  const productFilters = useMemo(
    () => ({
      categoryId: selectedCategoryId === 0 ? undefined : selectedCategoryId,
      isActive: true,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
    }),
    [selectedCategoryId]
  );

  // Mémoriser les filtres de catégories aussi
  const categoryFilters = useMemo(
    () => ({
      sortBy: "name" as const,
      sortOrder: "asc" as const,
    }),
    []
  );

  const { products, isLoading, error } = useProducts(productFilters);
  const { categories } = useCategories(categoryFilters);

  return {
    selectedCategoryId,
    setSelectedCategoryId,
    products,
    isLoading,
    error,
    categories,
  };
}

