import React from "react";
import { ProductPublicDTO } from "../../../dto";
import ProductCard from "./ProductCard";
import styles from "../../../styles/components/ProductGrid.module.css";

interface ProductGridProps {
  products: ProductPublicDTO[];
  isLoading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingContent}>
            <i className={`fas fa-spinner fa-spin ${styles.loadingIcon}`}></i>
            <span className={styles.loadingText}>
              Chargement des produits...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyWrapper}>
          <div className={styles.emptyContent}>
            <i className={`fas fa-inbox ${styles.emptyIcon}`}></i>
            <span className={styles.emptyText}>
              Aucun produit disponible pour le moment
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
