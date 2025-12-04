/**
 * Hook personnalisé pour gérer les produits
 * Centralise la logique de récupération et de gestion des produits
 */

import { useState, useCallback } from "react";
import { ProductPublicDTO, ProductSearchDTO, ProductFilterDTO } from "../dto";
import {
  getProducts,
  deleteProduct,
  activateProduct,
  deactivateProduct,
} from "../services/productService";
import { executeWithLoading } from "../utils";

interface UseProductsFilters {
  searchTerm?: string;
  selectedCategory?: string;
  statusFilter?: string;
}

interface UseProductsReturn {
  products: ProductPublicDTO[];
  totalProducts: number;
  isLoading: boolean;
  error: string | null;
  loadProducts: () => Promise<void>;
  handleDeleteProduct: (productId: number) => Promise<void>;
  handleToggleProductStatus: (
    productId: number,
    currentStatus: boolean
  ) => Promise<void>;
  setError: (error: string | null) => void;
}

export function useProducts(filters: UseProductsFilters): UseProductsReturn {
  const [products, setProducts] = useState<ProductPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    const result = await executeWithLoading(
      async () => {
        const searchParams: Partial<ProductSearchDTO> = {
          search: filters.searchTerm || undefined,
          categoryId: filters.selectedCategory
            ? parseInt(filters.selectedCategory)
            : undefined,
          isActive:
            filters.statusFilter === "active"
              ? true
              : filters.statusFilter === "inactive"
              ? false
              : undefined,
          sortBy: "createdAt",
          sortOrder: "desc",
        };

        const filterParams: Partial<ProductFilterDTO> = {
          categories: filters.selectedCategory
            ? [parseInt(filters.selectedCategory)]
            : undefined,
          isActive:
            filters.statusFilter === "active"
              ? true
              : filters.statusFilter === "inactive"
              ? false
              : undefined,
        };

        return await getProducts(searchParams, filterParams);
      },
      setIsLoading,
      setError,
      {
        notFoundMessage: "Produits introuvables",
        defaultMessage: "Erreur lors du chargement",
      },
      (err) => console.error("Error loading products:", err)
    );

    if (result) {
      setProducts(result.products);
    }
  }, [filters.searchTerm, filters.selectedCategory, filters.statusFilter]);

  const handleDeleteProduct = useCallback(
    async (productId: number) => {
      await executeWithLoading(
        async () => {
          await deleteProduct(productId);
          await loadProducts();
        },
        setIsLoading,
        setError,
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
        setIsLoading,
        setError,
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

  return {
    products,
    totalProducts: products.length,
    isLoading,
    error,
    loadProducts,
    handleDeleteProduct,
    handleToggleProductStatus,
    setError,
  };
}
