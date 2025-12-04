/**
 * Hook pour gérer la liste des produits avec filtres intégrés
 * Combine la logique de récupération et de filtrage UI
 */

import { useState, useEffect, useCallback } from "react";
import {
  ProductPublicDTO,
  ProductSearchDTO,
  ProductFilterDTO,
} from "../../dto";
import {
  getProducts,
  deleteProduct,
  activateProduct,
  deactivateProduct,
} from "../../services/productService";
import { useCategories } from "../categories";
import { executeWithLoading } from "../../utils";

interface UseProductListFilters {
  searchTerm?: string;
  selectedCategory?: string;
  statusFilter?: string;
}

interface UseProductListReturn {
  // Products
  products: ProductPublicDTO[];
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

  const [products, setProducts] = useState<ProductPublicDTO[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

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

  const loadProducts = useCallback(async () => {
    const result = await executeWithLoading(
      async () => {
        const searchParams: Partial<ProductSearchDTO> = {
          search: debouncedFilters.searchTerm || undefined,
          categoryId: debouncedFilters.selectedCategory
            ? parseInt(debouncedFilters.selectedCategory)
            : undefined,
          isActive:
            debouncedFilters.statusFilter === "active"
              ? true
              : debouncedFilters.statusFilter === "inactive"
              ? false
              : undefined,
          sortBy: "createdAt",
          sortOrder: "desc",
        };

        const filterParams: Partial<ProductFilterDTO> = {
          categories: debouncedFilters.selectedCategory
            ? [parseInt(debouncedFilters.selectedCategory)]
            : undefined,
          isActive:
            debouncedFilters.statusFilter === "active"
              ? true
              : debouncedFilters.statusFilter === "inactive"
              ? false
              : undefined,
        };

        return await getProducts(searchParams, filterParams);
      },
      setProductsLoading,
      setProductsError,
      {
        notFoundMessage: "Produits introuvables",
        defaultMessage: "Erreur lors du chargement",
      },
      (err) => console.error("Error loading products:", err)
    );

    if (result) {
      setProducts(result.products);
    }
  }, [
    debouncedFilters.searchTerm,
    debouncedFilters.selectedCategory,
    debouncedFilters.statusFilter,
  ]);

  // Charger les produits quand les filtres débounced changent
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedFilters.searchTerm,
    debouncedFilters.selectedCategory,
    debouncedFilters.statusFilter,
  ]);

  const handleDeleteProduct = useCallback(
    async (productId: number) => {
      await executeWithLoading(
        async () => {
          await deleteProduct(productId);
          await loadProducts();
        },
        setProductsLoading,
        setProductsError,
        {
          notFoundMessage: "Produit introuvable",
          defaultMessage: "Erreur lors de la suppression",
        },
        (err) => {
          console.error("Error deleting product:", err);
          throw err;
        }
      );
    },
    [loadProducts]
  );

  const handleToggleProductStatus = useCallback(
    async (productId: number, currentStatus: boolean) => {
      await executeWithLoading(
        async () => {
          if (currentStatus) {
            await deactivateProduct(productId);
          } else {
            await activateProduct(productId);
          }
          await loadProducts();
        },
        setProductsLoading,
        setProductsError,
        {
          notFoundMessage: "Produit introuvable",
          defaultMessage: "Erreur lors du changement de statut",
        },
        (err) => {
          console.error("Error toggling product status:", err);
          throw err;
        }
      );
    },
    [loadProducts]
  );

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
    setStatusFilter("");
  }, []);

  return {
    // Products
    products,
    totalProducts: products.length,
    productsLoading,
    productsError,
    loadProducts,
    handleDeleteProduct,
    handleToggleProductStatus,
    setProductsError: setProductsError,

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
