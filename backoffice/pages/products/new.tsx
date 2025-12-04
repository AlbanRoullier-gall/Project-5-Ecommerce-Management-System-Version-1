"use client";

import { ProductForm } from "../../components/product/product-form-view";
import { PageLayout } from "../../components/shared";
import { useProductFormPage } from "../../hooks";

/**
 * Page de création d'un nouveau produit
 * Orchestrateur léger - toute la logique est dans useProductFormPage
 */
const NewProductPage: React.FC = () => {
  const {
    categories,
    isLoading: categoriesLoading,
    isSaving: isLoading,
    error,
    handleSaveProduct,
    handleCancel,
    setError,
  } = useProductFormPage();

  return (
    <PageLayout
      title="Nouveau produit"
      description="Créer un nouveau produit"
      error={error || undefined}
      onErrorClose={() => setError(null)}
      pageTitle="Nouveau produit"
      showPageHeader={true}
      isLoading={categoriesLoading}
      loadingMessage="Chargement des catégories..."
    >
      {!categoriesLoading && (
        <ProductForm
          product={null}
          categories={categories}
          onSubmit={handleSaveProduct}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
    </PageLayout>
  );
};

export default NewProductPage;
