import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { ProductCreateDTO, ProductUpdateDTO, CategoryPublicDTO } from "../dto";
import { getCategories } from "../services/productService";
import { createProduct, uploadProductImages } from "../services/productService";
import { filesToUploadDTOs } from "../utils/imageUtils";
import { executeWithLoading } from "../utils";

interface UseCreateProductPageReturn {
  categories: CategoryPublicDTO[];
  categoriesLoading: boolean;
  isLoading: boolean;
  error: string | null;
  handleCreateProduct: (
    data: ProductCreateDTO | ProductUpdateDTO,
    images?: File[],
    imagesToDelete?: number[]
  ) => Promise<void>;
  handleCancel: () => void;
  setError: (error: string | null) => void;
}

export function useCreateProductPage(): UseCreateProductPageReturn {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryPublicDTO[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les catégories au montage
  useEffect(() => {
    const loadCategories = async () => {
      const result = await executeWithLoading(
        async () =>
          await getCategories({
            sortBy: "name",
            sortOrder: "asc",
          }),
        setCategoriesLoading,
        () => {}, // Pas de gestion d'erreur pour le chargement initial
        {
          defaultMessage: "Erreur lors du chargement des catégories",
        },
        (err) => console.error("Error loading categories:", err)
      );

      if (result) {
        setCategories(result.categories);
      }
    };

    loadCategories();
  }, []);

  const handleCreateProduct = useCallback(
    async (
      data: ProductCreateDTO | ProductUpdateDTO,
      images?: File[],
      imagesToDelete?: number[]
    ) => {
      await executeWithLoading(
        async () => {
          // Créer le produit d'abord (sans images)
          const createData = data as ProductCreateDTO;
          const createdProduct = await createProduct(createData);

          const productId = createdProduct.id;

          // Si des images sont fournies, les uploader (ne pas bloquer en cas d'erreur)
          if (images && images.length > 0 && productId) {
            try {
              const uploadDTOs = await filesToUploadDTOs(images, productId);
              await uploadProductImages(productId, uploadDTOs);
            } catch (err) {
              console.error("Erreur lors de l'ajout des images:", err);
              // Ne pas bloquer la création si l'upload d'images échoue
            }
          }

          // Rediriger vers la liste des produits après création
          router.push("/products");
        },
        setIsLoading,
        setError,
        {
          notFoundMessage: "Produit introuvable",
          defaultMessage: "Erreur lors de la création",
        },
        (err) => console.error("Error creating product:", err)
      );
    },
    [router]
  );

  const handleCancel = useCallback(() => {
    router.push("/products");
  }, [router]);

  return {
    categories,
    categoriesLoading,
    isLoading,
    error,
    handleCreateProduct,
    handleCancel,
    setError,
  };
}
