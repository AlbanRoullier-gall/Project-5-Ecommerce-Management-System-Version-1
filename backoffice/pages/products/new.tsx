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
import {
  ProductCreateDTO,
  ProductUpdateDTO,
  CategoryPublicDTO,
  CategoryListDTO,
  ProductImageUploadDTO,
} from "../../dto";

/** URL de l'API depuis les variables d'environnement */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Page de création d'un nouveau produit
 *
 * Protégée par AuthGuard (accessible uniquement si authentifié et approuvé)
 */
const NewProductPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryPublicDTO[]>([]);

  /**
   * Récupère le token d'authentification du localStorage
   */
  const getAuthToken = () => {
    return localStorage.getItem("auth_token");
  };

  /**
   * Charge les catégories
   */
  useEffect(() => {
    loadCategories();
  }, []);

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
   * Crée un nouveau produit
   */
  const handleCreateProduct = async (
    data: ProductCreateDTO | ProductUpdateDTO,
    images?: File[],
    imagesToDelete?: number[]
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Token d'authentification manquant. Veuillez vous reconnecter."
        );
      }

      // En mode création, on s'assure que tous les champs requis sont présents
      const createData = data as ProductCreateDTO;

      // Créer le produit d'abord (sans images)
      const response = await fetch(`${API_URL}/api/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la création du produit"
        );
      }

      const createdProduct = await response.json();
      // La réponse peut être { message: "...", product: {...} } ou directement le produit
      const productId =
        createdProduct.product?.id ||
        createdProduct.id ||
        (createdProduct.product && createdProduct.product.id);

      // Si des images sont fournies, les uploader via le nouvel endpoint
      if (images && images.length > 0 && productId) {
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
              productId: productId,
              filename: file.name,
              base64Data: base64Data,
              mimeType: mimeType,
              orderIndex: index,
            };
          })
        );

        const imgResponse = await fetch(
          `${API_URL}/api/admin/products/${productId}/images/upload`,
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
          console.error("Erreur lors de l'ajout des images:", errorData);
          // Ne pas bloquer la création si l'upload d'images échoue
        }
      }

      // Rediriger vers la liste des produits après création
      router.push("/products");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la création"
      );
      console.error("Error creating product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Annule la création et retourne à la liste
   */
  const handleCancel = () => {
    router.push("/products");
  };

  return (
    <AuthGuard>
      <Head>
        <title>Nouveau produit - Nature de Pierre</title>
        <meta name="description" content="Créer un nouveau produit" />
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

            <PageHeader title="Nouveau produit" />

            <ProductForm
              product={null}
              categories={categories}
              onSubmit={handleCreateProduct}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default NewProductPage;
