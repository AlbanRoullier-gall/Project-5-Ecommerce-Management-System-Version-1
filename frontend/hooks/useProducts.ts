/**
 * Hook pour récupérer la liste des produits
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { ProductPublicDTO, ProductSearchDTO } from "../dto";
import { getProducts } from "../services/productService";
import { logger } from "../services/logger";

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

  useEffect(() => {
    // Ne recharger que si les filtres ont vraiment changé
    if (!areFiltersEqual(previousFiltersRef.current, filters)) {
      previousFiltersRef.current = filters;

      const loadProducts = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const result = await getProducts({
            ...filters,
            isActive: filters?.isActive ?? true, // Par défaut, seulement les produits actifs
          });
          setProducts(result.products);
          setTotal(result.total);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Erreur lors du chargement des produits"
          );
          logger.error("Error loading products", err, { filters });
        } finally {
          setIsLoading(false);
        }
      };

      loadProducts();
    }
  }, [filters]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getProducts({
        ...filters,
        isActive: filters?.isActive ?? true,
      });
      setProducts(result.products);
      setTotal(result.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des produits"
      );
      logger.error("Error loading products", err, { filters });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  return {
    products,
    total,
    isLoading,
    error,
    refetch,
  };
}
