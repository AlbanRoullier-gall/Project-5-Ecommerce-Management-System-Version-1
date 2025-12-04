"use client";

import { CategoryManagement } from "../../components/product/category-management-view";
import { PageLayout } from "../../components/shared";
import { useCategoriesPage } from "../../hooks";

/**
 * Page de gestion des catégories
 * Orchestrateur léger - toute la logique est dans useCategoriesPage
 */
const CategoriesPage: React.FC = () => {
  const {
    categories,
    isLoading,
    error,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleClose,
    setError,
  } = useCategoriesPage();

  return (
    <PageLayout
      title="Gestion des catégories"
      description="Gérer les catégories de produits"
      error={error || undefined}
      onErrorClose={() => setError(null)}
      pageTitle="Gestion des catégories"
      showPageHeader={true}
      isLoading={isLoading && categories.length === 0}
      loadingMessage="Chargement des catégories..."
    >
      <CategoryManagement
        categories={categories}
        onAddCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        isLoading={isLoading}
        onClose={handleClose}
      />
    </PageLayout>
  );
};

export default CategoriesPage;
