import React, { useState, useEffect } from "react";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";
import ProductForm from "./ProductForm";
import CategoryManagement from "./CategoryManagement";
import ProductImageManager from "./ProductImageManager";
import {
  ProductPublicDTO,
  ProductCreateDTO,
  ProductUpdateDTO,
  CategoryPublicDTO,
  CategoryCreateDTO,
  CategoryUpdateDTO,
} from "../../dto";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

const ProductList: React.FC = () => {
  // States pour les produits
  const [products, setProducts] = useState<ProductPublicDTO[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductPublicDTO[]>(
    []
  );
  const [categories, setCategories] = useState<CategoryPublicDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // States pour les modales/formulaires
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductPublicDTO | null>(
    null
  );
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [imageManagerProduct, setImageManagerProduct] =
    useState<ProductPublicDTO | null>(null);

  // Charger les données au montage
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Filtrer les produits
  useEffect(() => {
    let filtered = [...products];

    // Filtre de recherche
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.categoryId === parseInt(selectedCategory)
      );
    }

    // Filtre par statut
    if (statusFilter === "active") {
      filtered = filtered.filter((p) => p.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((p) => !p.isActive);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, statusFilter]);

  // API Calls
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des produits");
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

  const loadCategories = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des catégories");
      }

      const data = await response.json();
      setCategories(data.categories || data || []);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const handleCreateProduct = async (
    data: ProductCreateDTO | ProductUpdateDTO
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/products`, {
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

  const handleUpdateProduct = async (
    data: ProductCreateDTO | ProductUpdateDTO
  ) => {
    if (!editingProduct) return;

    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_URL}/admin/products/${editingProduct.id}`,
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

  const handleDeleteProduct = async (productId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
        `${API_URL}/admin/products/${productId}/${endpoint}`,
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
      const response = await fetch(`${API_URL}/admin/categories`, {
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
        `${API_URL}/admin/categories/${categoryId}`,
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
        `${API_URL}/admin/categories/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la catégorie");
      }

      await loadCategories();
      await loadProducts(); // Recharger les produits car ils ont peut-être été impactés
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
      console.error("Error deleting category:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImage = async (productId: number, file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${API_URL}/admin/products/${productId}/images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload de l'image");
      }

      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
      console.error("Error uploading image:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (productId: number, imageId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_URL}/admin/products/${productId}/images/${imageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'image");
      }

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
      console.error("Error deleting image:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateImageOrder = async (
    productId: number,
    imageId: number,
    newOrder: number
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/images/${imageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderIndex: newOrder }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'ordre");
      }

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
      console.error("Error updating image order:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product: ProductPublicDTO) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleCancelForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleManageImages = (product: ProductPublicDTO) => {
    setImageManagerProduct(product);
  };

  return (
    <div style={{ fontSize: "1rem" }}>
      {/* Messages d'erreur */}
      {error && (
        <div
          style={{
            background: "linear-gradient(135deg, #fdf2f2 0%, #fef2f2 100%)",
            border: "2px solid #fecaca",
            borderLeft: "4px solid #dc2626",
            color: "#dc2626",
            padding: "1.5rem",
            borderRadius: "12px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
            boxShadow: "0 4px 12px rgba(220, 38, 38, 0.1)",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <i
            className="fas fa-exclamation-circle"
            style={{ fontSize: "1.5rem", marginTop: "0.25rem" }}
          ></i>
          <div style={{ flex: 1 }}>
            <strong
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "1.1rem",
              }}
            >
              Erreur
            </strong>
            <span style={{ fontSize: "1rem" }}>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            style={{
              background: "none",
              border: "none",
              color: "#dc2626",
              cursor: "pointer",
              padding: "0.25rem",
              fontSize: "1.25rem",
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Boutons d'actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "3rem",
          paddingBottom: "2rem",
          borderBottom: "3px solid #d9b970",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            color: "#13686a",
            fontWeight: "bold",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.05)",
            margin: 0,
          }}
        >
          Produits
        </h1>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowCategoryManagement(!showCategoryManagement)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem 2rem",
              background: "linear-gradient(135deg, #d9b970 0%, #f4d03f 100%)",
              color: "#13686a",
              border: "none",
              borderRadius: "12px",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(217, 185, 112, 0.2)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(217, 185, 112, 0.35)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(217, 185, 112, 0.2)";
            }}
          >
            <i className="fas fa-tags" style={{ fontSize: "1.1rem" }}></i>
            <span>Gérer les catégories</span>
          </button>
          <button
            onClick={handleNewProduct}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1rem 2rem",
              background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(19, 104, 106, 0.2)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(19, 104, 106, 0.35)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(19, 104, 106, 0.2)";
            }}
          >
            <i className="fas fa-plus" style={{ fontSize: "1.1rem" }}></i>
            <span>Nouveau produit</span>
          </button>
        </div>
      </div>

      {/* Gestion des catégories */}
      {showCategoryManagement && (
        <CategoryManagement
          categories={categories}
          onAddCategory={handleCreateCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          isLoading={isLoading}
        />
      )}

      {/* Formulaire de produit */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={handleCancelForm}
          isLoading={isLoading}
        />
      )}

      {/* Filtres */}
      {!showProductForm && (
        <ProductFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categories={categories}
        />
      )}

      {/* Tableau des produits */}
      {!showProductForm && (
        <>
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
            onManageImages={handleManageImages}
          />
        </>
      )}

      {/* Gestionnaire d'images */}
      {imageManagerProduct && (
        <ProductImageManager
          product={imageManagerProduct}
          onClose={() => setImageManagerProduct(null)}
          onUploadImage={handleUploadImage}
          onDeleteImage={handleDeleteImage}
          onUpdateImageOrder={handleUpdateImageOrder}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default ProductList;
