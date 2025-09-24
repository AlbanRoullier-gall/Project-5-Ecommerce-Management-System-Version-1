import { useState, useEffect, useCallback } from "react";
import {
  Category,
  ApiResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PaginationParams,
} from "../shared-types";
import { productService } from "../services/productService";

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  fetchCategories: (params?: PaginationParams) => Promise<void>;
  createCategory: (
    categoryData: CreateCategoryRequest
  ) => Promise<Category | null>;
  updateCategory: (
    id: number,
    categoryData: UpdateCategoryRequest
  ) => Promise<Category | null>;
  deleteCategory: (id: number) => Promise<boolean>;
  refreshCategories: () => Promise<void>;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);

  const fetchCategories = useCallback(async (params?: PaginationParams) => {
    try {
      setLoading(true);
      setError(null);

      const response: ApiResponse<Category[]> =
        await productService.getCategories();

      if (response.data) {
        setCategories(response.data);
        // Simuler la pagination pour les catégories
        const total = response.data.length;
        const limit = params?.limit || 10;
        const page = params?.page || 1;
        setPagination({
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        });
      } else {
        setError(response.error || "Aucune catégorie trouvée");
        setPagination(null);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des catégories"
      );
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(
    async (categoryData: CreateCategoryRequest): Promise<Category | null> => {
      try {
        setLoading(true);
        setError(null);

        const response: ApiResponse<Category> =
          await productService.createCategory(categoryData);

        if (response.data) {
          await fetchCategories(); // Refresh the list
          return response.data;
        } else {
          setError("Erreur lors de la création de la catégorie");
          return null;
        }
      } catch (err) {
        console.error("Error creating category:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors de la création de la catégorie"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchCategories]
  );

  const updateCategory = useCallback(
    async (
      id: number,
      categoryData: UpdateCategoryRequest
    ): Promise<Category | null> => {
      try {
        setLoading(true);
        setError(null);

        const response: ApiResponse<Category> =
          await productService.updateCategory(id, categoryData);

        if (response.data) {
          await fetchCategories(); // Refresh the list
          return response.data;
        } else {
          setError("Erreur lors de la mise à jour de la catégorie");
          return null;
        }
      } catch (err) {
        console.error("Error updating category:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors de la mise à jour de la catégorie"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchCategories]
  );

  const deleteCategory = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await productService.deleteCategory(id);
        await fetchCategories(); // Refresh the list
        return true;
      } catch (err: any) {
        console.error("Error deleting category:", err);

        // Si c'est l'erreur personnalisée pour catégorie avec produits
        if (err.message === "CATEGORY_HAS_PRODUCTS") {
          throw new Error("CATEGORY_HAS_PRODUCTS");
        }

        // Si c'est une erreur HTTP 409 (Conflict)
        if (err.status === 409) {
          throw new Error("CATEGORY_HAS_PRODUCTS");
        }

        // Si c'est une erreur avec un message spécifique sur les produits
        if (
          err.message?.includes(
            "Cannot delete category with existing products"
          ) ||
          err.message?.includes("category with products") ||
          err.message?.includes("has products")
        ) {
          throw new Error("CATEGORY_HAS_PRODUCTS");
        }

        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors de la suppression de la catégorie"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchCategories]
  );

  const refreshCategories = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    pagination,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
  };
};
