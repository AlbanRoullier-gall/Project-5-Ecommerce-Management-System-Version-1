import React, { useState, useEffect } from "react";
import {
  ProductPublicDTO,
  CategoryPublicDTO,
  ProductListDTO,
  CategoryListDTO,
  ProductSearchDTO,
} from "../../dto";
import CategoryFilter from "./CategoryFilter";
import ProductGrid from "./ProductGrid";

/**
 * URL de l'API depuis les variables d'environnement
 * OBLIGATOIRE : La variable NEXT_PUBLIC_API_URL doit être définie dans .env.local ou .env.production
 *
 * Exemples :
 * - Développement : NEXT_PUBLIC_API_URL=http://localhost:3020
 * - Production : NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
 */
const API_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL n'est pas définie. Veuillez configurer cette variable d'environnement."
    );
  }
  return url;
})();

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
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État du filtre
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);

  // Paramètres de recherche côté serveur
  const [searchParams, setSearchParams] = useState<Partial<ProductSearchDTO>>({
    page: 1,
    limit: 20,
    search: undefined,
    categoryId: undefined,
    isActive: true, // Seulement les produits actifs pour le frontend
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  /**
   * Charge les catégories au montage du composant
   */
  useEffect(() => {
    loadCategories();
  }, []);

  /**
   * Mettre à jour les paramètres de recherche quand la catégorie change
   */
  useEffect(() => {
    setSearchParams((prevParams) => ({
      ...prevParams,
      page: 1, // Réinitialiser la page
      categoryId: selectedCategoryId === 0 ? undefined : selectedCategoryId,
    }));
  }, [selectedCategoryId]);

  /**
   * Recharger les produits quand les paramètres de recherche changent
   */
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /**
   * Charge la liste des produits actifs depuis l'API publique
   * Utilise ProductSearchDTO pour la recherche côté serveur
   */
  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Construire les paramètres de requête à partir de ProductSearchDTO
      const queryParams = new URLSearchParams();
      if (searchParams.page) queryParams.set("page", String(searchParams.page));
      if (searchParams.limit)
        queryParams.set("limit", String(searchParams.limit));
      if (searchParams.search) queryParams.set("search", searchParams.search);
      if (searchParams.categoryId)
        queryParams.set("categoryId", String(searchParams.categoryId));
      if (searchParams.isActive !== undefined)
        queryParams.set("activeOnly", String(searchParams.isActive));
      if (searchParams.sortBy) queryParams.set("sortBy", searchParams.sortBy);
      if (searchParams.sortOrder)
        queryParams.set("sortOrder", searchParams.sortOrder);

      const response = await fetch(
        `${API_URL}/api/products?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des produits");
      }

      const data = (await response.json()) as
        | ProductListDTO
        | { products: ProductPublicDTO[]; pagination?: any }
        | ProductPublicDTO[];

      // Gérer différents formats de réponse
      if (Array.isArray(data)) {
        setProducts(data);
        setTotalProducts(data.length);
      } else if ("products" in data) {
        setProducts(data.products);
        if ("pagination" in data && data.pagination) {
          setTotalProducts(data.pagination.total || data.products.length);
        } else if ("total" in data) {
          setTotalProducts((data as ProductListDTO).total);
        } else {
          setTotalProducts(data.products.length);
        }
      } else {
        setProducts([]);
        setTotalProducts(0);
      }
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

      const data = (await response.json()) as
        | CategoryListDTO
        | { categories: CategoryPublicDTO[] }
        | CategoryPublicDTO[];

      // Gérer différents formats de réponse
      let categoriesData: CategoryPublicDTO[] = [];
      if (Array.isArray(data)) {
        categoriesData = data;
      } else if ("categories" in data) {
        categoriesData = data.categories;
      }

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

      <ProductGrid products={products} isLoading={isLoading} />
    </>
  );
};

export default ProductCatalog;
