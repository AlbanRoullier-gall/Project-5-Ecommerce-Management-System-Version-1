import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";
import ErrorAlert from "../../shared/ErrorAlert";
import PageHeader from "../../shared/PageHeader";
import Button from "../../shared/Button";
import {
  ProductPublicDTO,
  CategoryPublicDTO,
  ProductListDTO,
  CategoryListDTO,
  ProductSearchDTO,
  ProductFilterDTO,
} from "../../../dto";

/** URL de l'API depuis les variables d'environnement */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Composant principal de gestion des produits
 *
 * Fonctionnalités :
 * - Affichage de la liste des produits avec filtres (recherche, catégorie, statut)
 * - Création et édition de produits avec gestion d'images
 * - Gestion des catégories
 * - Activation/désactivation de produits
 * - Suppression de produits
 *
 * États gérés :
 * - Liste des produits et catégories
 * - Filtres de recherche
 * - Formulaires d'ajout/édition
 * - Gestion des erreurs et chargement
 */
const ProductList: React.FC = () => {
  const router = useRouter();

  // États de données
  const [products, setProducts] = useState<ProductPublicDTO[]>([]);
  const [categories, setCategories] = useState<CategoryPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  // États des filtres avec DTOs
  const [searchParams, setSearchParams] = useState<Partial<ProductSearchDTO>>({
    page: 1,
    limit: 20,
    search: undefined,
    categoryId: undefined,
    isActive: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [filterParams, setFilterParams] = useState<Partial<ProductFilterDTO>>({
    categories: undefined,
    isActive: undefined,
  });

  // États des filtres UI (pour les composants)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Charger les catégories au montage du composant
  useEffect(() => {
    loadCategories();
  }, []);

  /**
   * Effet : Mettre à jour les paramètres de recherche quand les filtres UI changent
   * Utilise un debounce pour éviter trop d'appels API
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prevParams) => {
        const newSearchParams: Partial<ProductSearchDTO> = {
          ...prevParams,
          page: 1, // Réinitialiser la page à 1 lors d'un nouveau filtre
          search: searchTerm || undefined,
          categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
          isActive:
            statusFilter === "active"
              ? true
              : statusFilter === "inactive"
              ? false
              : undefined,
        };
        return newSearchParams;
      });

      setFilterParams({
        categories: selectedCategory ? [parseInt(selectedCategory)] : undefined,
        isActive:
          statusFilter === "active"
            ? true
            : statusFilter === "inactive"
            ? false
            : undefined,
      });
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, statusFilter]);

  /**
   * Effet : Recharger les produits quand les paramètres de recherche changent
   * Ce useEffect gère aussi le chargement initial
   */
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /**
   * Récupère le token d'authentification du localStorage
   * @returns Le token JWT ou null
   */
  const getAuthToken = () => {
    return localStorage.getItem("auth_token");
  };

  /**
   * Charge la liste des produits depuis l'API avec filtres côté serveur
   * Utilise ProductSearchDTO pour construire les paramètres de requête
   * Gère les erreurs et met à jour l'état de chargement
   */
  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Token d'authentification manquant. Veuillez vous reconnecter."
        );
      }

      // Construire les paramètres de requête à partir de ProductSearchDTO et ProductFilterDTO
      const queryParams = new URLSearchParams();
      if (searchParams.page) queryParams.set("page", String(searchParams.page));
      if (searchParams.limit)
        queryParams.set("limit", String(searchParams.limit));
      if (searchParams.search) queryParams.set("search", searchParams.search);
      if (searchParams.categoryId)
        queryParams.set("categoryId", String(searchParams.categoryId));
      // Envoyer activeOnly seulement si isActive est défini (true ou false)
      // Si undefined, on n'envoie pas le paramètre pour voir tous les produits
      if (
        searchParams.isActive !== undefined &&
        searchParams.isActive !== null
      ) {
        queryParams.set("activeOnly", String(searchParams.isActive));
      }
      if (searchParams.sortBy) queryParams.set("sortBy", searchParams.sortBy);
      if (searchParams.sortOrder)
        queryParams.set("sortOrder", searchParams.sortOrder);

      // Utiliser ProductFilterDTO pour le filtrage avancé
      if (filterParams.categories && filterParams.categories.length > 0) {
        queryParams.set("categories", filterParams.categories.join(","));
      }
      if (filterParams.priceRange) {
        if (filterParams.priceRange.min !== undefined) {
          queryParams.set("minPrice", String(filterParams.priceRange.min));
        }
        if (filterParams.priceRange.max !== undefined) {
          queryParams.set("maxPrice", String(filterParams.priceRange.max));
        }
      }

      const response = await fetch(
        `${API_URL}/api/admin/products?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors du chargement des produits"
        );
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
        err instanceof Error ? err.message : "Erreur lors du chargement"
      );
      console.error("Error loading products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Charge la liste des catégories depuis l'API
   * Utilise CategorySearchDTO pour la recherche et pagination côté serveur
   */
  const loadCategories = async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        console.error("Token manquant pour chargement des catégories");
        return;
      }

      // Utiliser CategorySearchDTO pour la recherche et pagination
      const queryParams = new URLSearchParams();
      queryParams.set("page", "1");
      queryParams.set("limit", "100"); // Charger toutes les catégories pour les filtres
      queryParams.set("sortBy", "name");
      queryParams.set("sortOrder", "asc");

      const response = await fetch(
        `${API_URL}/api/admin/categories?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors du chargement des catégories"
        );
      }

      const data = (await response.json()) as
        | CategoryListDTO
        | { categories: CategoryPublicDTO[]; pagination?: any }
        | CategoryPublicDTO[];
      // Gérer différents formats de réponse
      if (Array.isArray(data)) {
        setCategories(data);
      } else if ("categories" in data) {
        setCategories(data.categories);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  /**
   * Supprime un produit
   * @param productId - ID du produit à supprimer
   */
  const handleDeleteProduct = async (productId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_URL}/api/admin/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du produit");
      }

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
      console.error("Error deleting product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Active ou désactive un produit
   * @param productId - ID du produit
   * @param currentStatus - Statut actuel du produit
   */
  const handleToggleProductStatus = async (
    productId: number,
    currentStatus: boolean
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const endpoint = currentStatus ? "deactivate" : "activate";
      const response = await fetch(
        `${API_URL}/api/admin/products/${productId}/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du changement de statut");
      }

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du changement de statut"
      );
      console.error("Error toggling product status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Navigue vers la page d'édition d'un produit
   * @param product - Produit à éditer
   */
  const handleEditProduct = (product: ProductPublicDTO) => {
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
    <div style={{ fontSize: "1rem" }}>
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <p
          style={{
            fontSize: "1.1rem",
            color: "#6b7280",
            fontWeight: "500",
          }}
        >
          {totalProducts} produit(s) trouvé(s)
        </p>
      </div>
      <ProductTable
        products={products}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onToggleStatus={handleToggleProductStatus}
      />
    </div>
  );
};

export default ProductList;
