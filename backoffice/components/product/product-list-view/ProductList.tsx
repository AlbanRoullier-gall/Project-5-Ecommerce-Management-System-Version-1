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
  ProductSearchDTO,
  ProductFilterDTO,
  CategorySearchDTO,
} from "../../../dto";
import { useAuth } from "../../../contexts/AuthContext";

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
  const { apiCall } = useAuth();

  // États de données
  const [products, setProducts] = useState<ProductPublicDTO[]>([]);
  const [categories, setCategories] = useState<CategoryPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  // États des filtres avec DTOs
  const [searchParams, setSearchParams] = useState<Partial<ProductSearchDTO>>({
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

  // Paramètres de recherche côté serveur pour les catégories
  const [categorySearchParams, setCategorySearchParams] = useState<
    Partial<CategorySearchDTO>
  >({
    search: undefined,
    sortBy: "name",
    sortOrder: "asc",
  });

  // États des filtres UI (pour les composants)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Charger les catégories au montage du composant et quand les paramètres changent
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySearchParams]);

  /**
   * Effet : Mettre à jour les paramètres de recherche quand les filtres UI changent
   * Utilise un debounce pour éviter trop d'appels API
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prevParams) => {
        const newSearchParams: Partial<ProductSearchDTO> = {
          ...prevParams,
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
   * Charge la liste des produits depuis l'API avec filtres côté serveur
   * Utilise ProductSearchDTO pour construire les paramètres de requête
   * Gère les erreurs et met à jour l'état de chargement
   */
  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Construire les paramètres de requête à partir de ProductSearchDTO et ProductFilterDTO
      const queryParams = new URLSearchParams();
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

      const response = await apiCall<{
        data: {
          products: ProductPublicDTO[];
        };
        message?: string;
        timestamp?: string;
        status?: number;
      }>({
        url: `/api/admin/products${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`,
        method: "GET",
        requireAuth: true,
      });

      // Format standardisé : { data: { products: [] }, ... }
      if (!response.data || !Array.isArray(response.data.products)) {
        throw new Error("Format de réponse invalide pour les produits");
      }

      const products = response.data.products;

      setProducts(products);
      setTotalProducts(products.length);
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
      // Construire les paramètres de requête à partir de CategorySearchDTO
      const queryParams = new URLSearchParams();
      if (categorySearchParams.search)
        queryParams.set("search", categorySearchParams.search);
      if (categorySearchParams.sortBy)
        queryParams.set("sortBy", categorySearchParams.sortBy);
      if (categorySearchParams.sortOrder)
        queryParams.set("sortOrder", categorySearchParams.sortOrder);

      const response = await apiCall<{
        data: {
          categories: CategoryPublicDTO[];
        };
        message?: string;
        timestamp?: string;
        status?: number;
      }>({
        url: `/api/admin/categories${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`,
        method: "GET",
        requireAuth: true,
      });

      // Format standardisé : { data: { categories: [], pagination: {} }, ... }
      if (!response.data || !Array.isArray(response.data.categories)) {
        throw new Error("Format de réponse invalide pour les catégories");
      }

      setCategories(response.data.categories);
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
      await apiCall({
        url: `/api/admin/products/${productId}`,
        method: "DELETE",
        requireAuth: true,
      });

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
      const endpoint = currentStatus ? "deactivate" : "activate";
      await apiCall({
        url: `/api/admin/products/${productId}/${endpoint}`,
        method: "POST",
        requireAuth: true,
      });

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
