import React from "react";
import { ProductPublicDTO } from "../../../dto";
import styles from "../../../styles/components/ProductInfo.module.css";

/**
 * Props du composant ProductInfo
 */
interface ProductInfoProps {
  /** Produit à afficher */
  product: ProductPublicDTO;
}

/**
 * Composant d'affichage des informations du produit
 * Affiche le nom, la catégorie et la description du produit
 *
 * @example
 * <ProductInfo product={product} />
 */
const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  return (
    <>
      {/* Badge de catégorie - affiché uniquement si la catégorie existe */}
      {product.categoryName && (
        <div className={styles.categoryBadge}>
          <i className="fas fa-tag"></i>
          {product.categoryName}
        </div>
      )}

      {/* Titre du produit */}
      <h1 className={styles.title}>{product.name}</h1>

      {/* Section description - affichée uniquement si la description existe */}
      {product.description && (
        <section className={styles.description}>
          <div className={styles.descriptionHeader}>
            <i className="fas fa-info-circle"></i>
            <span>Description</span>
          </div>
          <div className={styles.descriptionBody}>{product.description}</div>
        </section>
      )}
    </>
  );
};

export default ProductInfo;
