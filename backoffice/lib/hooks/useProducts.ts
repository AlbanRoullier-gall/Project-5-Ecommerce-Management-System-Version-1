import { useState, useEffect, useCallback } from "react";
import {
  Product,
  Category,
  PaginationParams,
  ApiResponse,
} from "../shared-types";
import { productService } from "../services/productService";

interface UseProductsReturn {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  fetchProducts: (params?: PaginationParams) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createProduct: (productData: any) => Promise<Product | null>;
  updateProduct: (id: number, productData: any) => Promise<Product | null>;
  deleteProduct: (id: number) => Promise<boolean>;
  activateProduct: (id: number) => Promise<boolean>;
  deactivateProduct: (id: number) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);

  const fetchProducts = useCallback(async (params?: PaginationParams) => {
    try {
      setLoading(true);
      setError(null);

      const response: ApiResponse<Product[]> = await productService.getProducts(
        params
      );

      if (response.data) {
        setProducts(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else if (response.error) {
        setError(response.error);
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

      const response: ApiResponse<Category[]> =
        await productService.getCategories();

      if (response.data) {
        setCategories(response.data);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des catégories"
      );
    }
  }, []);

  const createProduct = useCallback(
    async (productData: any): Promise<Product | null> => {
      try {
        setError(null);

        const response: ApiResponse<Product> =
          await productService.createProduct(productData);

        if (response.data) {
          await fetchProducts(); // Refresh the list
          return response.data;
        } else if (response.error) {
          setError(response.error);
        }
        return null;
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
    async (id: number, productData: any): Promise<Product | null> => {
      try {
        setError(null);

        const response: ApiResponse<Product> =
          await productService.updateProduct(id, productData);

        if (response.data) {
          await fetchProducts(); // Refresh the list
          return response.data;
        } else if (response.error) {
          setError(response.error);
        }
        return null;
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

        const response: ApiResponse<void> = await productService.deleteProduct(
          id
        );

        if (!response.error) {
          await fetchProducts(); // Refresh the list
          return true;
        } else {
          setError(response.error);
          return false;
        }
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

        const response: ApiResponse<Product> =
          await productService.activateProduct(id);

        if (response.data) {
          await fetchProducts(); // Refresh the list
          return true;
        } else if (response.error) {
          setError(response.error);
        }
        return false;
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

        const response: ApiResponse<Product> =
          await productService.deactivateProduct(id);

        if (response.data) {
          await fetchProducts(); // Refresh the list
          return true;
        } else if (response.error) {
          setError(response.error);
        }
        return false;
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
