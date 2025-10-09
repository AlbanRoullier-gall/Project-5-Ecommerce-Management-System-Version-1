import React, { useState, useEffect } from "react";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";
import ProductForm from "./ProductForm";
import CategoryManagement from "./CategoryManagement";
import ErrorAlert from "./ui/ErrorAlert";
import PageHeader from "./ui/PageHeader";
import Button from "./ui/Button";
import {
  ProductPublicDTO,
  ProductCreateDTO,
  ProductUpdateDTO,
  CategoryPublicDTO,
  CategoryCreateDTO,
  CategoryUpdateDTO,
} from "../../dto";

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

  // États UI
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductPublicDTO | null>(
    null
  );
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);

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
   * Crée un nouveau produit
   * @param data - Données du produit
   * @param images - Images à uploader (optionnel)
   */
  const handleCreateProduct = async (
    data: ProductCreateDTO | ProductUpdateDTO,
    images?: File[]
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();

      if (images && images.length > 0) {
        const formData = new FormData();
        formData.append("product", JSON.stringify(data));

        images.forEach((image) => {
          formData.append("images", image);
        });

        const response = await fetch(
          `${API_URL}/api/admin/products/with-images`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la création du produit avec images");
        }
      } else {
        const response = await fetch(`${API_URL}/api/admin/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la création du produit");
        }
      }

      await loadProducts();
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la création"
      );
      console.error("Error creating product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Met à jour un produit existant
   * @param data - Nouvelles données du produit
   * @param images - Nouvelles images à ajouter (optionnel)
   * @param imagesToDelete - IDs des images à supprimer (optionnel)
   */
  const handleUpdateProduct = async (
    data: ProductCreateDTO | ProductUpdateDTO,
    images?: File[],
    imagesToDelete?: number[]
  ) => {
    if (!editingProduct) return;

    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();

      if (imagesToDelete && imagesToDelete.length > 0) {
        for (const imageId of imagesToDelete) {
          const deleteResponse = await fetch(
            `${API_URL}/api/admin/products/${editingProduct.id}/images/${imageId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!deleteResponse.ok) {
            console.error(`Erreur suppression image ${imageId}`);
          }
        }
      }

      const response = await fetch(
        `${API_URL}/api/admin/products/${editingProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du produit");
      }

      if (images && images.length > 0) {
        const formData = new FormData();
        images.forEach((image) => {
          formData.append("images", image);
        });

        const imgResponse = await fetch(
          `${API_URL}/api/admin/products/${editingProduct.id}/images`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!imgResponse.ok) {
          throw new Error("Erreur lors de l'ajout des images");
        }
      }

      await loadProducts();
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
      console.error("Error updating product:", err);
    } finally {
      setIsLoading(false);
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

  const handleCreateCategory = async (data: CategoryCreateDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la catégorie");
      }

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la création"
      );
      console.error("Error creating category:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async (
    categoryId: number,
    data: CategoryUpdateDTO
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_URL}/api/admin/categories/${categoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la catégorie");
      }

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
      console.error("Error updating category:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_URL}/api/admin/categories/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 409) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              "Cette catégorie contient des produits. Veuillez d'abord les supprimer ou les déplacer vers une autre catégorie."
          );
        }
        throw new Error("Erreur lors de la suppression de la catégorie");
      }

      await loadCategories();
      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
      console.error("Error deleting category:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Ouvre le formulaire d'édition d'un produit
   * @param product - Produit à éditer
   */
  const handleEditProduct = (product: ProductPublicDTO) => {
    setEditingProduct(product);
    setShowProductForm(true);
    setShowCategoryManagement(false); // Fermer la gestion des catégories
  };

  /**
   * Toggle l'affichage du formulaire de nouveau produit
   * Ferme la gestion des catégories si on ouvre le formulaire
   */
  const handleNewProduct = () => {
    setEditingProduct(null);
    setShowProductForm(!showProductForm); // Toggle le formulaire
    if (!showProductForm) {
      setShowCategoryManagement(false); // Fermer la gestion des catégories si on ouvre le formulaire
    }
  };

  /**
   * Ferme le formulaire de produit et réinitialise l'édition
   */
  const handleCancelForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  /**
   * Toggle l'affichage de la gestion des catégories
   * Ferme le formulaire de produit si on ouvre la gestion des catégories
   */
  const handleToggleCategoryManagement = () => {
    setShowCategoryManagement(!showCategoryManagement);
    if (!showCategoryManagement) {
      setShowProductForm(false); // Fermer le formulaire de produit si on ouvre la gestion des catégories
      setEditingProduct(null);
    }
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

      {showCategoryManagement && (
        <CategoryManagement
          categories={categories}
          onAddCategory={handleCreateCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          isLoading={isLoading}
        />
      )}

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={handleCancelForm}
          isLoading={isLoading}
        />
      )}

      {!showProductForm && (
        <>
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
        </>
      )}
    </div>
  );
};

export default ProductList;
