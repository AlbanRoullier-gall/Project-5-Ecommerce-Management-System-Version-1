/**
 * Hook composite pour gérer la liste des produits
 * Combine useProducts et useCategories avec la logique de filtrage
 */

import { useState, useEffect, useCallback } from "react";
import { useProducts } from "./useProducts";
import { useCategories } from "./useCategories";

interface UseProductListFilters {
  searchTerm?: string;
  selectedCategory?: string;
  statusFilter?: string;
}

interface UseProductListReturn {
  // Products
  products: ReturnType<typeof useProducts>["products"];
  totalProducts: number;
  productsLoading: boolean;
  productsError: string | null;
  loadProducts: () => Promise<void>;
  handleDeleteProduct: (productId: number) => Promise<void>;
  handleToggleProductStatus: (
    productId: number,
    currentStatus: boolean
  ) => Promise<void>;
  setProductsError: (error: string | null) => void;

  // Categories
  categories: ReturnType<typeof useCategories>["categories"];
  categoriesLoading: boolean;

  // Filters (UI state)
  searchTerm: string;
  selectedCategory: string;
  statusFilter: string;
  setSearchTerm: (value: string) => void;
  setSelectedCategory: (value: string) => void;
  setStatusFilter: (value: string) => void;
  resetFilters: () => void;
}

export function useProductList(
  initialFilters: UseProductListFilters = {}
): UseProductListReturn {
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || "");
  const [selectedCategory, setSelectedCategory] = useState(
    initialFilters.selectedCategory || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    initialFilters.statusFilter || ""
  );

  // Filtres débounced pour les appels API
  const [debouncedFilters, setDebouncedFilters] =
    useState<UseProductListFilters>(initialFilters);

  const {
    products,
    totalProducts,
    isLoading: productsLoading,
    error: productsError,
    loadProducts,
    handleDeleteProduct,
    handleToggleProductStatus,
    setError: setProductsError,
  } = useProducts(debouncedFilters);

  const { categories, isLoading: categoriesLoading } = useCategories({
    sortBy: "name",
    sortOrder: "asc",
  });

  // Debounce des filtres (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        searchTerm: searchTerm || undefined,
        selectedCategory: selectedCategory || undefined,
        statusFilter: statusFilter || undefined,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, statusFilter]);

  // Charger les produits quand les filtres débounced changent
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedFilters.searchTerm,
    debouncedFilters.selectedCategory,
    debouncedFilters.statusFilter,
  ]);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
    setStatusFilter("");
  }, []);

  return {
    // Products
    products,
    totalProducts,
    productsLoading,
    productsError,
    loadProducts,
    handleDeleteProduct,
    handleToggleProductStatus,
    setProductsError,

    // Categories
    categories,
    categoriesLoading,

    // Filters
    searchTerm,
    selectedCategory,
    statusFilter,
    setSearchTerm,
    setSelectedCategory,
    setStatusFilter,
    resetFilters,
  };
}
