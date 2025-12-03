/**
 * Hook pour récupérer un produit unique
 */

import { useState, useEffect } from "react";
import { ProductPublicDTO } from "../dto";
import { getProduct } from "../services/productService";
import { logger } from "../services/logger";

interface UseProductResult {
  product: ProductPublicDTO | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour charger un produit par son ID
 */
export function useProduct(
  productId: string | number | undefined
): UseProductResult {
  const [product, setProduct] = useState<ProductPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = async () => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const productData = await getProduct(productId);
      if (!productData.isActive) {
        throw new Error("Ce produit n'est plus disponible");
      }
      setProduct(productData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement du produit"
      );
      logger.error("Error loading product", err, { productId });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  return {
    product,
    isLoading,
    error,
    refetch: loadProduct,
  };
}
