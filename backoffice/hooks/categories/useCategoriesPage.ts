import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { CategoryPublicDTO, CategoryCreateDTO, CategoryUpdateDTO } from "dto";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/productService";
import { executeWithLoading, pushWithBasePath } from "../../utils";

interface UseCategoriesPageReturn {
  categories: CategoryPublicDTO[];
  isLoading: boolean;
  error: string | null;
  handleCreateCategory: (data: CategoryCreateDTO) => Promise<void>;
  handleUpdateCategory: (
    categoryId: number,
    data: CategoryUpdateDTO
  ) => Promise<void>;
  handleDeleteCategory: (categoryId: number) => Promise<void>;
  handleClose: () => void;
  reloadCategories: () => Promise<void>;
  setError: (error: string | null) => void;
}

export function useCategoriesPage(): UseCategoriesPageReturn {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    const result = await executeWithLoading(
      async () => await getCategories({ sortBy: "name", sortOrder: "asc" }),
      setIsLoading,
      setError,
      {
        notFoundMessage: "Catégories introuvables",
        defaultMessage: "Erreur lors du chargement",
      },
      (err) => console.error("Error loading categories:", err)
    );

    if (result) {
      setCategories(result.categories);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreateCategory = useCallback(
    async (data: CategoryCreateDTO) => {
      await executeWithLoading(
        async () => {
          await createCategory(data);
          await loadCategories();
        },
        setIsLoading,
        setError,
        {
          notFoundMessage: "Catégorie introuvable",
          defaultMessage: "Erreur lors de la création",
        },
        (err) => console.error("Error creating category:", err)
      );
    },
    [loadCategories]
  );

  const handleUpdateCategory = useCallback(
    async (categoryId: number, data: CategoryUpdateDTO) => {
      await executeWithLoading(
        async () => {
          await updateCategory(categoryId, data);
          await loadCategories();
        },
        setIsLoading,
        setError,
        {
          notFoundMessage: "Catégorie introuvable",
          defaultMessage: "Erreur lors de la mise à jour",
        },
        (err) => console.error("Error updating category:", err)
      );
    },
    [loadCategories]
  );

  const handleDeleteCategory = useCallback(
    async (categoryId: number) => {
      await executeWithLoading(
        async () => {
          await deleteCategory(categoryId);
          await loadCategories();
        },
        setIsLoading,
        setError,
        {
          notFoundMessage: "Catégorie introuvable",
          defaultMessage: "Erreur lors de la suppression",
          conflictMessage:
            "Cette catégorie contient des produits. Veuillez d'abord les supprimer ou les déplacer vers une autre catégorie.",
        },
        (err) => console.error("Error deleting category:", err)
      );
    },
    [loadCategories]
  );

  const handleClose = useCallback(() => {
    pushWithBasePath(router, "/products");
  }, [router]);

  return {
    categories,
    isLoading,
    error,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleClose,
    reloadCategories: loadCategories,
    setError,
  };
}
