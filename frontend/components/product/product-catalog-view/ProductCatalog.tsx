import React from "react";
import { ProductPublicDTO, CategoryPublicDTO } from "../../../dto";
import CategoryFilter from "./CategoryFilter";
import ProductGrid from "./ProductGrid";
import { Alert } from "../../shared";

interface ProductCatalogProps {
  products: ProductPublicDTO[];
  categories: CategoryPublicDTO[];
  isLoading: boolean;
  error: string | null;
  selectedCategoryId: number;
  onCategoryChange: (categoryId: number) => void;
}

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
      {error && <Alert type="error" message={error} />}

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
