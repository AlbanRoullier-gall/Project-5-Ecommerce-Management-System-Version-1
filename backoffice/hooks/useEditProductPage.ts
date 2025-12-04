import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { ProductPublicDTO, ProductUpdateDTO, CategoryPublicDTO } from "../dto";
import {
  getProduct,
  getCategories,
  updateProduct,
  uploadProductImages,
  deleteProductImage,
} from "../services/productService";
import { filesToUploadDTOs } from "../utils/imageUtils";
import { normalizeRouterId, executeWithLoading } from "../utils";

interface UseEditProductPageReturn {
  product: ProductPublicDTO | null;
  categories: CategoryPublicDTO[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  handleUpdateProduct: (
    data: ProductUpdateDTO,
    images?: File[],
    imagesToDelete?: number[]
  ) => Promise<void>;
  handleCancel: () => void;
  reloadProduct: () => Promise<void>;
  setError: (error: string | null) => void;
}

export function useEditProductPage(
  productId: number | string | string[] | undefined
): UseEditProductPageReturn {
  const router = useRouter();
  const [product, setProduct] = useState<ProductPublicDTO | null>(null);
  const [categories, setCategories] = useState<CategoryPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    const id = normalizeRouterId(productId);
    if (!id) return;

    const result = await executeWithLoading(
      async () => await getProduct(id),
      setIsLoading,
      setError,
      {
        notFoundMessage: "Produit introuvable",
        defaultMessage: "Erreur lors du chargement",
      },
      (err) => console.error("Error loading product:", err)
    );

    if (result) {
      setProduct(result);
    }
  }, [productId]);

  const loadCategories = useCallback(async () => {
    const result = await executeWithLoading(
      async () => await getCategories({ sortBy: "name", sortOrder: "asc" }),
      () => {}, // Pas de loading pour les catégories (non-bloquant)
      () => {}, // Pas d'affichage d'erreur (log uniquement)
      {
        defaultMessage: "Erreur lors du chargement des catégories",
      },
      (err) => console.error("Error loading categories:", err)
    );

    if (result) {
      setCategories(result.categories);
    }
  }, []);

  useEffect(() => {
    if (productId) {
      loadProduct();
      loadCategories();
    }
  }, [productId, loadProduct, loadCategories]);

  const handleUpdateProduct = useCallback(
    async (
      data: ProductUpdateDTO,
      images?: File[],
      imagesToDelete?: number[]
    ) => {
      if (!product) return;

      await executeWithLoading(
        async () => {
          // Supprimer les images si nécessaire
          if (imagesToDelete && imagesToDelete.length > 0) {
            await Promise.all(
              imagesToDelete.map((imageId) =>
                deleteProductImage(product.id, imageId).catch((err) => {
                  console.error(`Erreur suppression image ${imageId}:`, err);
                })
              )
            );
          }

          // Mettre à jour le produit
          await updateProduct(product.id, data);

          // Ajouter les nouvelles images si nécessaire (ne pas bloquer en cas d'erreur)
          if (images && images.length > 0) {
            try {
              const uploadDTOs = await filesToUploadDTOs(images, product.id);
              await uploadProductImages(product.id, uploadDTOs);
            } catch (err) {
              console.error("Erreur lors de l'ajout des images:", err);
            }
          }

          // Recharger les données du produit
          await loadProduct();
        },
        setIsSaving,
        setError,
        {
          notFoundMessage: "Produit introuvable",
          defaultMessage: "Erreur lors de la mise à jour",
        },
        (err) => console.error("Error updating product:", err)
      );
    },
    [product, loadProduct]
  );

  const handleCancel = useCallback(() => {
    router.push("/products");
  }, [router]);

  return {
    product,
    categories,
    isLoading,
    isSaving,
    error,
    handleUpdateProduct,
    handleCancel,
    reloadProduct: loadProduct,
    setError,
  };
}
