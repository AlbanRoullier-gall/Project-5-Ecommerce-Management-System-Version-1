"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthGuard from "../../components/auth/AuthGuard";
import { ProductForm } from "../../components/product/product-form-view";
import ErrorAlert from "../../components/shared/ErrorAlert";
import PageHeader from "../../components/shared/PageHeader";
import { LoadingSpinner } from "../../components/shared";
import {
  ProductPublicDTO,
  ProductUpdateDTO,
  CategoryPublicDTO,
  CategoryListDTO,
  ProductImageUploadResponseDTO,
  ProductImageUploadDTO,
} from "../../dto";

/** URL de l'API depuis les variables d'environnement */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Page d'édition d'un produit
 *
 * Protégée par AuthGuard (accessible uniquement si authentifié et approuvé)
 */
const EditProductPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<ProductPublicDTO | null>(null);
  const [categories, setCategories] = useState<CategoryPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère le token d'authentification du localStorage
   */
  const getAuthToken = () => {
    return localStorage.getItem("auth_token");
  };

  /**
   * Charge les données du produit et des catégories
   */
  useEffect(() => {
    if (id) {
      loadProduct();
      loadCategories();
    }
  }, [id]);

  const loadProduct = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Token d'authentification manquant. Veuillez vous reconnecter."
        );
      }

      const response = await fetch(`${API_URL}/api/admin/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Produit introuvable");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors du chargement du produit"
        );
      }

      const data = await response.json();
      setProduct(data.product || data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement"
      );
      console.error("Error loading product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/api/admin/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = (await response.json()) as
          | CategoryListDTO
          | { categories: CategoryPublicDTO[] }
          | CategoryPublicDTO[];
        // Gérer différents formats de réponse
        if (Array.isArray(data)) {
          setCategories(data);
        } else if ("categories" in data) {
          setCategories(data.categories);
        } else {
          setCategories([]);
        }
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  /**
   * Met à jour le produit
   */
  const handleUpdateProduct = async (
    data: ProductUpdateDTO,
    images?: File[],
    imagesToDelete?: number[]
  ) => {
    if (!product) return;

    setIsSaving(true);
    setError(null);
    try {
      const token = getAuthToken();

      // Supprimer les images si nécessaire
      if (imagesToDelete && imagesToDelete.length > 0) {
        for (const imageId of imagesToDelete) {
          const deleteResponse = await fetch(
            `${API_URL}/api/admin/products/${product.id}/images/${imageId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!deleteResponse.ok) {
            console.error(`Erreur suppression image ${imageId}`);
          }
        }
      }

      // Mettre à jour le produit
      const response = await fetch(
        `${API_URL}/api/admin/products/${product.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du produit");
      }

      // Ajouter les nouvelles images si nécessaire
      if (images && images.length > 0) {
        // Convertir les fichiers en base64 et créer les DTOs
        const uploadDTOs: ProductImageUploadDTO[] = await Promise.all(
          images.map(async (file, index) => {
            // Convertir le fichier en base64
            const base64Data = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (typeof reader.result === "string") {
                  // Supprimer le préfixe data:image/...;base64,
                  const base64 = reader.result.replace(
                    /^data:image\/[a-z]+;base64,/,
                    ""
                  );
                  resolve(base64);
                } else {
                  reject(new Error("Failed to convert file to base64"));
                }
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });

            // Déterminer le type MIME
            const mimeType = file.type || "image/jpeg";

            return {
              productId: product.id,
              filename: file.name,
              base64Data: base64Data,
              mimeType: mimeType,
              orderIndex: index,
            };
          })
        );

        const imgResponse = await fetch(
          `${API_URL}/api/admin/products/${product.id}/images/upload`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(uploadDTOs),
          }
        );

        if (!imgResponse.ok) {
          const errorData = await imgResponse.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Erreur lors de l'ajout des images"
          );
        }

        // Typage de la réponse si elle est structurée
        const uploadResult = await imgResponse.json().catch(() => null);
        if (uploadResult && typeof uploadResult === "object") {
          const typedResult = uploadResult as ProductImageUploadResponseDTO;
          if (!typedResult.success && typedResult.error) {
            console.error("Upload error:", typedResult.error);
          }
        }
      }

      // Recharger les données du produit
      await loadProduct();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
      console.error("Error updating product:", err);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Annule l'édition et retourne à la liste
   */
  const handleCancel = () => {
    router.push("/products");
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <Head>
          <title>Chargement... - Nature de Pierre</title>
        </Head>
        <div className="min-h-screen">
          <Header />
          <main className="main-content">
            <div className="page-container">
              <LoadingSpinner message="Chargement du produit..." />
            </div>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  if (!product) {
    return (
      <AuthGuard>
        <Head>
          <title>Produit introuvable - Nature de Pierre</title>
        </Head>
        <div className="min-h-screen">
          <Header />
          <main className="main-content">
            <div className="page-container">
              <ErrorAlert
                message="Produit introuvable"
                onClose={() => router.push("/products")}
              />
            </div>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Head>
        <title>Modifier le produit - Nature de Pierre</title>
        <meta
          name="description"
          content="Modifier les informations d'un produit"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen">
        {/* HEADER */}
        <Header />

        {/* MAIN CONTENT */}
        <main className="main-content">
          <div className="page-container">
            {error && (
              <ErrorAlert message={error} onClose={() => setError(null)} />
            )}

            <PageHeader title={`Modifier le produit : ${product.name}`} />

            <ProductForm
              product={product}
              categories={categories}
              onSubmit={handleUpdateProduct}
              onCancel={handleCancel}
              isLoading={isSaving}
            />
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default EditProductPage;
