import React from "react";
import { ProductPublicDTO, CategoryPublicDTO } from "../../dto";
import CategoryFilter from "./CategoryFilter";
import ProductGrid from "./ProductGrid";

/**
 * Props du composant ProductCatalog
 */
interface ProductCatalogProps {
  /** Liste des produits à afficher */
  products: ProductPublicDTO[];
  /** Liste des catégories disponibles */
  categories: CategoryPublicDTO[];
  /** Indique si les produits sont en cours de chargement */
  isLoading: boolean;
  /** Message d'erreur éventuel */
  error: string | null;
  /** ID de la catégorie sélectionnée */
  selectedCategoryId: number;
  /** Callback appelé quand la catégorie change */
  onCategoryChange: (categoryId: number) => void;
}

/**
 * Composant de présentation du catalogue de produits
 * Affiche les filtres de catégories et la grille de produits
 *
 * @example
 * <ProductCatalog
 *   products={products}
 *   categories={categories}
 *   isLoading={false}
 *   error={null}
 *   selectedCategoryId={0}
 *   onCategoryChange={handleCategoryChange}
 * />
 */
const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  isLoading,
  error,
  selectedCategoryId,
  onCategoryChange,
}) => {
  return (
    <>
      {error && (
        <div
          style={{
            background: "#fee",
            border: "2px solid #c33",
            color: "#c33",
            padding: "1.5rem",
            borderRadius: "8px",
            margin: "2rem",
            textAlign: "center",
            fontSize: "1.2rem",
          }}
        >
          <i
            className="fas fa-exclamation-triangle"
            style={{ marginRight: "1rem" }}
          ></i>
          {error}
        </div>
      )}

      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={onCategoryChange}
        />
      )}

      <ProductGrid products={products} isLoading={isLoading} />
    </>
  );
};

export default ProductCatalog;
