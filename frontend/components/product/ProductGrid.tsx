import React from "react";
import { ProductPublicDTO } from "../../dto";
import ProductCard from "./ProductCard";

/**
 * Props du composant ProductGrid
 */
interface ProductGridProps {
  /** Liste des produits à afficher */
  products: ProductPublicDTO[];
  /** Indique si les produits sont en cours de chargement */
  isLoading?: boolean;
}

/**
 * Composant grille de produits
 * Affiche les produits dans une grille responsive
 *
 * @example
 * <ProductGrid products={products} isLoading={false} />
 */
const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="catalog-section">
        <div className="catalog-container">
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              fontSize: "1.5rem",
              color: "#13686a",
            }}
          >
            <i
              className="fas fa-spinner fa-spin"
              style={{ marginRight: "1rem" }}
            ></i>
            Chargement des produits...
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="catalog-section">
        <div className="catalog-container">
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              fontSize: "1.5rem",
              color: "#666",
            }}
          >
            <i
              className="fas fa-inbox"
              style={{
                fontSize: "3rem",
                color: "#d1d5db",
                marginBottom: "1rem",
                display: "block",
              }}
            ></i>
            Aucun produit disponible pour le moment
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-section">
      <div className="catalog-container">
        <div className="catalog-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
