import React, { useState, useEffect } from "react";
import {
  ProductPublicDTO,
  CategoryPublicDTO,
  CategoryListDTO,
  ProductSearchDTO,
  CategorySearchDTO,
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

  // Paramètres de recherche côté serveur pour les produits
  const [searchParams, setSearchParams] = useState<Partial<ProductSearchDTO>>({
    page: 1,
    limit: 20,
    search: undefined,
    categoryId: undefined,
    isActive: true, // Seulement les produits actifs pour le frontend
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Paramètres de recherche côté serveur pour les catégories
  const [categorySearchParams, setCategorySearchParams] = useState<
    Partial<CategorySearchDTO>
  >({
    page: 1,
    limit: 100, // Charger toutes les catégories pour les filtres
    search: undefined,
    sortBy: "name",
    sortOrder: "asc",
  });

  /**
   * Charge les catégories au montage du composant
   */
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySearchParams]);

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

      const fetchResponse = await fetch(
        `${API_URL}/api/products?${queryParams.toString()}`,
        {
          credentials: "include", // Important pour CORS avec credentials: true
        }
      );

      if (!fetchResponse.ok) {
        throw new Error("Erreur lors du chargement des produits");
      }

      const response = (await fetchResponse.json()) as {
        data?: {
          products: ProductPublicDTO[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        };
        products?: ProductPublicDTO[]; // Fallback pour compatibilité
        pagination?: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
        message?: string;
        timestamp?: string;
        status?: number;
      };

      // Format standardisé : { data: { products: [], pagination: {} }, ... }
      // Support du nouveau format et de l'ancien format pour compatibilité
      const products = response.data?.products || response.products || [];
      const pagination = response.data?.pagination || response.pagination;

      setProducts(products);
      setTotalProducts(pagination?.total || products.length);
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
   * Utilise CategorySearchDTO pour la recherche et pagination côté serveur
   */
  const loadCategories = async () => {
    try {
      // Construire les paramètres de requête à partir de CategorySearchDTO
      const queryParams = new URLSearchParams();
      if (categorySearchParams.page)
        queryParams.set("page", String(categorySearchParams.page));
      if (categorySearchParams.limit)
        queryParams.set("limit", String(categorySearchParams.limit));
      if (categorySearchParams.search)
        queryParams.set("search", categorySearchParams.search);
      if (categorySearchParams.sortBy)
        queryParams.set("sortBy", categorySearchParams.sortBy);
      if (categorySearchParams.sortOrder)
        queryParams.set("sortOrder", categorySearchParams.sortOrder);

      const response = await fetch(
        `${API_URL}/api/categories?${queryParams.toString()}`,
        {
          credentials: "include", // Important pour CORS avec credentials: true
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des catégories");
      }

      const data = (await response.json()) as
        | CategoryListDTO
        | { categories: CategoryPublicDTO[]; pagination?: any }
        | CategoryPublicDTO[];

      // Gérer différents formats de réponse
      let categoriesData: CategoryPublicDTO[] = [];
      if (Array.isArray(data)) {
        categoriesData = data;
      } else if ("categories" in data) {
        categoriesData = data.categories;
      }

      // Le productCount est maintenant calculé côté serveur
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  // Le productCount est maintenant calculé côté serveur dans les requêtes SQL
  // Plus besoin de calculer côté client

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
