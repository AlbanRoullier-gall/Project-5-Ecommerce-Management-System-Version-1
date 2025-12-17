import React from "react";
import { useRouter } from "next/router";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";
import ErrorAlert from "../../shared/ErrorAlert";
import PageHeader from "../../shared/PageHeader";
import Button from "../../shared/Button";
import { ProductPublicDTO } from "dto";
import { useProductList } from "../../../hooks";
import styles from "../../../styles/components/ProductList.module.css";

/**
 * Composant d'affichage de la liste des produits
 * Toute la logique métier est gérée par le hook useProductList
 */
const ProductList: React.FC = () => {
  const router = useRouter();
  const {
    products,
    totalProducts,
    productsLoading,
    productsError,
    categories,
    searchTerm,
    selectedCategory,
    statusFilter,
    setSearchTerm,
    setSelectedCategory,
    setStatusFilter,
    handleDeleteProduct,
    handleToggleProductStatus,
    setProductsError,
  } = useProductList();

  /**
   * Navigue vers la page d'édition d'un produit
   */
  const handleEdit = (product: ProductPublicDTO) => {
    router.push(`/products/${product.id}`);
  };

  /**
   * Navigue vers la page de création d'un produit
   */
  const handleNewProduct = () => {
    router.push("/products/new");
  };

  /**
   * Navigue vers la page de gestion des catégories
   */
  const handleToggleCategoryManagement = () => {
    router.push("/products/categories");
  };

  return (
    <div className={styles.wrapper}>
      {productsError && (
        <ErrorAlert
          message={productsError}
          onClose={() => setProductsError(null)}
        />
      )}

      <PageHeader title="Produits">
        <Button
          onClick={handleToggleCategoryManagement}
          variant="gold"
          icon="fas fa-tags"
        >
          Gérer les catégories
        </Button>
        <Button onClick={handleNewProduct} variant="primary" icon="fas fa-plus">
          Nouveau produit
        </Button>
      </PageHeader>

      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categories={categories}
      />

      <div className={styles.summaryBar}>
        <p className={styles.summaryText}>
          {totalProducts} produit(s) trouvé(s)
        </p>
      </div>
      <ProductTable
        products={products}
        onEdit={handleEdit}
        onDelete={handleDeleteProduct}
        onToggleStatus={handleToggleProductStatus}
      />
    </div>
  );
};

export default ProductList;
