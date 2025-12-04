/**
 * Hook pour récupérer la liste des produits
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { ProductPublicDTO, ProductSearchDTO } from "../../dto";
import { getProducts } from "../../services/productService";
import { logger } from "../../services/logger";
import { executeWithLoading } from "../../utils";

interface UseProductsResult {
  products: ProductPublicDTO[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Compare deux objets de filtres pour voir s'ils sont égaux
 */
function areFiltersEqual(
  a?: Partial<ProductSearchDTO>,
  b?: Partial<ProductSearchDTO>
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    a.search === b.search &&
    a.categoryId === b.categoryId &&
    a.isActive === b.isActive &&
    a.sortBy === b.sortBy &&
    a.sortOrder === b.sortOrder
  );
}

/**
 * Hook pour charger la liste des produits avec filtres
 */
export function useProducts(
  filters?: Partial<ProductSearchDTO>
): UseProductsResult {
  const [products, setProducts] = useState<ProductPublicDTO[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousFiltersRef = useRef<Partial<ProductSearchDTO> | undefined>();

  const loadProducts = useCallback(async () => {
    const result = await executeWithLoading(
      async () => {
        return await getProducts({
          ...filters,
          isActive: filters?.isActive ?? true, // Par défaut, seulement les produits actifs
        });
      },
      setIsLoading,
      setError,
      {
        defaultMessage: "Erreur lors du chargement des produits",
      },
      (err) => {
        logger.error("Error loading products", err, { filters });
      }
    );

    if (result) {
      setProducts(result.products);
      setTotal(result.total);
    }
  }, [filters]);

  useEffect(() => {
    // Ne recharger que si les filtres ont vraiment changé
    if (!areFiltersEqual(previousFiltersRef.current, filters)) {
      previousFiltersRef.current = filters;
      loadProducts();
    }
  }, [filters, loadProducts]);

  const refetch = useCallback(async () => {
    await loadProducts();
  }, [loadProducts]);

  return {
    products,
    total,
    isLoading,
    error,
    refetch,
  };
}
