"use client";

import { ProductList } from "../../components/product/product-list-view";
import { PageLayout } from "../../components/shared";

/**
 * Page de liste des produits
 * Affiche la liste des produits avec filtres et actions
 */
const ProductsPage: React.FC = () => {
  return (
    <PageLayout title="Produits" description="Gérer les produits">
      <ProductList />
    </PageLayout>
  );
};

export default ProductsPage;
