import { useState, useEffect, useCallback } from "react";
import {
  ProductData,
  CategoryData,
  ProductListOptions,
  ProductListResult,
} from "../../../shared-types";
import { productService } from "../services/productService";

interface UseProductsReturn {
  products: ProductData[];
  categories: CategoryData[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  fetchProducts: (params?: ProductListOptions) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createProduct: (productData: ProductData) => Promise<ProductData | null>;
  updateProduct: (
    id: number,
    productData: ProductData
  ) => Promise<ProductData | null>;
  deleteProduct: (id: number) => Promise<boolean>;
  activateProduct: (id: number) => Promise<boolean>;
  deactivateProduct: (id: number) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);

  const fetchProducts = useCallback(async (params?: ProductListOptions) => {
    try {
      setLoading(true);
      setError(null);

      const response: ProductListResult = await productService.getProducts(
        params
      );

      setProducts(response.products);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des produits"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setError(null);

      const categories: CategoryData[] = await productService.getCategories();
      setCategories(categories);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des catégories"
      );
    }
  }, []);

  const createProduct = useCallback(
    async (productData: ProductData): Promise<ProductData | null> => {
      try {
        setError(null);

        const product: ProductData = await productService.createProduct(
          productData
        );
        await fetchProducts(); // Refresh the list
        return product;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors de la création du produit"
        );
        return null;
      }
    },
    [fetchProducts]
  );

  const updateProduct = useCallback(
    async (
      id: number,
      productData: ProductData
    ): Promise<ProductData | null> => {
      try {
        setError(null);

        const product: ProductData = await productService.updateProduct(
          id,
          productData
        );
        await fetchProducts(); // Refresh the list
        return product;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors de la mise à jour du produit"
        );
        return null;
      }
    },
    [fetchProducts]
  );

  const deleteProduct = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setError(null);

        await productService.deleteProduct(id);
        await fetchProducts(); // Refresh the list
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors de la suppression du produit"
        );
        return false;
      }
    },
    [fetchProducts]
  );

  const activateProduct = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setError(null);

        await productService.activateProduct(id);
        await fetchProducts(); // Refresh the list
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors de l'activation du produit"
        );
        return false;
      }
    },
    [fetchProducts]
  );

  const deactivateProduct = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setError(null);

        await productService.deactivateProduct(id);
        await fetchProducts(); // Refresh the list
        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors de la désactivation du produit"
        );
        return false;
      }
    },
    [fetchProducts]
  );

  const refreshProducts = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  // Load initial data
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  return {
    products,
    categories,
    loading,
    error,
    pagination,
    fetchProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    activateProduct,
    deactivateProduct,
    refreshProducts,
  };
};
