/**
 * Hook pour récupérer un produit unique
 */

import { useState, useEffect } from "react";
import { ProductPublicDTO } from "../../dto";
import { getProduct } from "../../services/productService";
import { logger } from "../../services/logger";
import { executeWithLoading } from "../../utils";

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

    const result = await executeWithLoading(
      async () => {
        const productData = await getProduct(productId);
        if (!productData.isActive) {
          throw new Error("Ce produit n'est plus disponible");
        }
        return productData;
      },
      setIsLoading,
      setError,
      {
        notFoundMessage: "Produit introuvable",
        defaultMessage: "Erreur lors du chargement du produit",
      },
      (err) => {
        logger.error("Error loading product", err, { productId });
      }
    );

    if (result) {
      setProduct(result);
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
