/**
 * Hook unifié pour gérer la création et l'édition de produits
 * Remplace useCreateProductPage et useEditProductPage
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  ProductPublicDTO,
  ProductCreateDTO,
  ProductUpdateDTO,
  CategoryPublicDTO,
} from "../../dto";
import {
  getProduct,
  getCategories,
  createProduct,
  updateProduct,
  uploadProductImages,
  deleteProductImage,
} from "../../services/productService";
import { filesToUploadDTOs } from "../../utils/imageUtils";
import { normalizeRouterId, executeWithLoading } from "../../utils";

type ProductFormMode = "create" | "edit";

interface UseProductFormPageReturn {
  mode: ProductFormMode;
  product: ProductPublicDTO | null;
  categories: CategoryPublicDTO[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  handleSaveProduct: (
    data: ProductCreateDTO | ProductUpdateDTO,
    images?: File[],
    imagesToDelete?: number[]
  ) => Promise<void>;
  handleCancel: () => void;
  reloadProduct: () => Promise<void>;
  setError: (error: string | null) => void;
}

export function useProductFormPage(
  productId?: number | string | string[] | undefined
): UseProductFormPageReturn {
  const router = useRouter();
  const mode: ProductFormMode = productId ? "edit" : "create";

  const [product, setProduct] = useState<ProductPublicDTO | null>(null);
  const [categories, setCategories] = useState<CategoryPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (mode !== "edit" || !productId) return;

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
  }, [productId, mode]);

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
    if (mode === "edit" && productId) {
      loadProduct();
    }
    loadCategories();
  }, [mode, productId, loadProduct, loadCategories]);

  const handleSaveProduct = useCallback(
    async (
      data: ProductCreateDTO | ProductUpdateDTO,
      images?: File[],
      imagesToDelete?: number[]
    ) => {
      if (mode === "create") {
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
          setIsSaving,
          setError,
          {
            notFoundMessage: "Produit introuvable",
            defaultMessage: "Erreur lors de la création",
          },
          (err) => console.error("Error creating product:", err)
        );
      } else {
        // Mode edit
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
      }
    },
    [mode, product, router, loadProduct]
  );

  const handleCancel = useCallback(() => {
    router.push("/products");
  }, [router]);

  return {
    mode,
    product,
    categories,
    isLoading,
    isSaving,
    error,
    handleSaveProduct,
    handleCancel,
    reloadProduct: loadProduct,
    setError,
  };
}
