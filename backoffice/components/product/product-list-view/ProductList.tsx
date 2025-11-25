import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";
import ErrorAlert from "../../shared/ErrorAlert";
import PageHeader from "../../shared/PageHeader";
import Button from "../../shared/Button";
import { ProductPublicDTO, CategoryPublicDTO } from "../../../dto";

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
  const [filteredProducts, setFilteredProducts] = useState<ProductPublicDTO[]>(
    []
  );
  const [categories, setCategories] = useState<CategoryPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États des filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Charger les données au montage du composant
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  /**
   * Effet de filtrage des produits
   * Applique les filtres de recherche, catégorie et statut
   */
  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.categoryId === parseInt(selectedCategory)
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((p) => p.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((p) => !p.isActive);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, statusFilter]);

  /**
   * Récupère le token d'authentification du localStorage
   * @returns Le token JWT ou null
   */
  const getAuthToken = () => {
    return localStorage.getItem("auth_token");
  };

  /**
   * Charge la liste des produits depuis l'API
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

      const response = await fetch(`${API_URL}/api/admin/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors du chargement des produits"
        );
      }

      const data = await response.json();
      setProducts(data.products || data || []);
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
   */
  const loadCategories = async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        console.error("Token manquant pour chargement des catégories");
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors du chargement des catégories"
        );
      }

      const data = await response.json();
      setCategories(data.categories || data || []);
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
          {filteredProducts.length} produit(s) trouvé(s)
        </p>
      </div>
      <ProductTable
        products={filteredProducts}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onToggleStatus={handleToggleProductStatus}
      />
    </div>
  );
};

export default ProductList;
