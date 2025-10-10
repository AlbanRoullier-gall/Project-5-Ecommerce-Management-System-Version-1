import React, { useState, useEffect } from "react";
import { ProductPublicDTO, CategoryPublicDTO } from "../../dto";
import CategoryFilter from "./CategoryFilter";
import ProductGrid from "./ProductGrid";

/**
 * URL de l'API depuis les variables d'environnement
 * En développement, utiliser directement localhost:3020
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Composant principal du catalogue de produits
 * Gère le chargement des produits et catégories, le filtrage par catégorie
 * et l'affichage de la grille de produits
 *
 * @example
 * <ProductCatalog />
 */
const ProductCatalog: React.FC = () => {
  // États de données
  const [products, setProducts] = useState<ProductPublicDTO[]>([]);
  const [categories, setCategories] = useState<CategoryPublicDTO[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductPublicDTO[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État du filtre
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);

  /**
   * Charge les produits au montage du composant
   */
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  /**
   * Filtre les produits quand la catégorie sélectionnée change
   */
  useEffect(() => {
    if (selectedCategoryId === 0) {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((p) => p.categoryId === selectedCategoryId)
      );
    }
  }, [selectedCategoryId, products]);

  /**
   * Charge la liste des produits actifs depuis l'API publique
   */
  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/products`);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des produits");
      }

      const data = await response.json();

      // Filtrer uniquement les produits actifs
      const activeProducts = (data.products || data || []).filter(
        (p: ProductPublicDTO) => p.isActive
      );

      setProducts(activeProducts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des produits"
      );
      console.error("Error loading products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Charge la liste des catégories depuis l'API publique
   */
  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`);

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des catégories");
      }

      const data = await response.json();
      const categoriesData = data.categories || data || [];

      // Calculer le nombre de produits actifs par catégorie
      const categoriesWithCount = categoriesData.map(
        (cat: CategoryPublicDTO) => ({
          ...cat,
          productCount: 0, // Sera mis à jour après le chargement des produits
        })
      );

      setCategories(categoriesWithCount);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  /**
   * Met à jour le nombre de produits par catégorie
   * Utilise useMemo pour éviter les re-renders inutiles
   */
  useEffect(() => {
    if (products.length > 0 && categories.length > 0) {
      // Vérifier si les comptages ont changé avant de mettre à jour
      const needsUpdate = categories.some((cat) => {
        const actualCount = products.filter(
          (p) => p.categoryId === cat.id
        ).length;
        return cat.productCount !== actualCount;
      });

      if (needsUpdate) {
        const categoriesWithCount = categories.map((cat) => ({
          ...cat,
          productCount: products.filter((p) => p.categoryId === cat.id).length,
        }));
        setCategories(categoriesWithCount);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  /**
   * Gère le changement de catégorie
   */
  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
  };

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
          onCategoryChange={handleCategoryChange}
        />
      )}

      <ProductGrid products={filteredProducts} isLoading={isLoading} />
    </>
  );
};

export default ProductCatalog;
