"use client";

import { useRouter } from "next/router";
import { ProductForm } from "../../components/product/product-form-view";
import { PageLayout } from "../../components/shared";
import { useEditProductPage } from "../../hooks";

/**
 * Page d'édition d'un produit
 * Orchestrateur léger - toute la logique est dans useEditProductPage
 */
const EditProductPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const {
    product,
    categories,
    isLoading,
    isSaving,
    error,
    handleUpdateProduct,
    handleCancel,
    setError,
  } = useEditProductPage(id);

  return (
    <PageLayout
      title={
        isLoading
          ? "Chargement..."
          : product
          ? `Modifier le produit : ${product.name}`
          : "Produit introuvable"
      }
      description={
        product ? "Modifier les informations d'un produit" : undefined
      }
      error={error || undefined}
      onErrorClose={() => setError(null)}
      pageTitle={product ? `Modifier le produit : ${product.name}` : undefined}
      showPageHeader={!!product}
      isLoading={isLoading}
      loadingMessage="Chargement du produit..."
      notFound={!isLoading && !product}
      notFoundMessage="Produit introuvable"
      onNotFoundClose={() => router.push("/products")}
    >
      {product && (
        <ProductForm
          product={product}
          categories={categories}
          onSubmit={handleUpdateProduct}
          onCancel={handleCancel}
          isLoading={isSaving}
        />
      )}
    </PageLayout>
  );
};

export default EditProductPage;
