"use client";

import { ProductForm } from "../../components/product/product-form-view";
import { PageLayout } from "../../components/shared";
import { useCreateProductPage } from "../../hooks";

/**
 * Page de création d'un nouveau produit
 * Orchestrateur léger - toute la logique est dans useCreateProductPage
 */
const NewProductPage: React.FC = () => {
  const {
    categories,
    categoriesLoading,
    isLoading,
    error,
    handleCreateProduct,
    handleCancel,
    setError,
  } = useCreateProductPage();

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
          onSubmit={handleCreateProduct}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
    </PageLayout>
  );
};

export default NewProductPage;
