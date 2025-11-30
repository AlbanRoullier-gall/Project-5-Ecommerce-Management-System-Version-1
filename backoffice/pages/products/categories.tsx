"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthGuard from "../../components/auth/AuthGuard";
import { CategoryManagement } from "../../components/product/category-management-view";
import ErrorAlert from "../../components/shared/ErrorAlert";
import PageHeader from "../../components/shared/PageHeader";
import { LoadingSpinner } from "../../components/shared";
import {
  CategoryPublicDTO,
  CategoryCreateDTO,
  CategoryUpdateDTO,
  CategoryListDTO,
} from "../../dto";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Page de gestion des catégories
 *
 * Protégée par AuthGuard (accessible uniquement si authentifié et approuvé)
 */
const CategoriesPage: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { apiCall } = useAuth();

  /**
   * Charge les catégories
   */
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiCall<
        | CategoryListDTO
        | { categories: CategoryPublicDTO[] }
        | CategoryPublicDTO[]
      >({
        url: "/api/admin/categories",
        method: "GET",
        requireAuth: true,
      });
      // Gérer différents formats de réponse
      if (Array.isArray(data)) {
        setCategories(data);
      } else if ("categories" in data) {
        setCategories(data.categories);
      } else {
        setCategories([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement"
      );
      console.error("Error loading categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Crée une nouvelle catégorie
   */
  const handleCreateCategory = async (data: CategoryCreateDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiCall({
        url: "/api/admin/categories",
        method: "POST",
        body: data,
        requireAuth: true,
      });

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la création"
      );
      console.error("Error creating category:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Met à jour une catégorie
   */
  const handleUpdateCategory = async (
    categoryId: number,
    data: CategoryUpdateDTO
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiCall({
        url: `/api/admin/categories/${categoryId}`,
        method: "PUT",
        body: data,
        requireAuth: true,
      });

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
      console.error("Error updating category:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Supprime une catégorie
   */
  const handleDeleteCategory = async (categoryId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      try {
        await apiCall({
          url: `/api/admin/categories/${categoryId}`,
          method: "DELETE",
          requireAuth: true,
        });
      } catch (err: any) {
        if (err.status === 409) {
          throw new Error(
            err.data?.message ||
              "Cette catégorie contient des produits. Veuillez d'abord les supprimer ou les déplacer vers une autre catégorie."
          );
        }
        throw new Error("Erreur lors de la suppression de la catégorie");
      }

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
      console.error("Error deleting category:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Ferme la page et retourne à la liste
   */
  const handleClose = () => {
    router.push("/products");
  };

  if (isLoading && categories.length === 0) {
    return (
      <AuthGuard>
        <Head>
          <title>Chargement... - Nature de Pierre</title>
        </Head>
        <div className="min-h-screen">
          <Header />
          <main className="main-content">
            <div className="page-container">
              <LoadingSpinner message="Chargement des catégories..." />
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
        <title>Gestion des catégories - Nature de Pierre</title>
        <meta name="description" content="Gérer les catégories de produits" />
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

            <PageHeader title="Gestion des catégories" />

            <CategoryManagement
              categories={categories}
              onAddCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              isLoading={isLoading}
              onClose={handleClose}
            />
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default CategoriesPage;
