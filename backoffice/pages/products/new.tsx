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

      const formData = new FormData();
      formData.append("name", createData.name);
      formData.append("description", createData.description || "");
      formData.append("price", String(createData.price));
      formData.append("vatRate", String(createData.vatRate || 21));
      formData.append("categoryId", String(createData.categoryId));
      formData.append("isActive", String(createData.isActive || true));

      if (images) {
        images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const response = await fetch(`${API_URL}/api/admin/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la création du produit"
        );
      }

      // Note: La création de produit avec images via FormData retourne généralement
      // un ProductPublicDTO avec les images incluses, pas un ProductImageUploadResponseDTO
      // Le ProductImageUploadResponseDTO est utilisé uniquement pour les endpoints
      // d'upload d'images séparés (POST /api/admin/products/:id/images)

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
