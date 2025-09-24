"use client";

import React, { useState } from "react";
import { Product } from "../shared-types";
import { useProducts } from "../lib/hooks/useProducts";
import ProductModal from "./ProductModal";
import ProductFilters from "./ProductFilters";
import InfoModal from "./InfoModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface ProductListProps {
  className?: string;
}

const ProductList: React.FC<ProductListProps> = ({ className = "" }) => {
  const {
    products,
    categories,
    loading,
    error,
    pagination,
    fetchProducts,
    deleteProduct,
    activateProduct,
    deactivateProduct,
  } = useProducts();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [infoTitle, setInfoTitle] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    sortBy: "name",
    sortOrder: "asc" as "asc" | "desc",
  });

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleProductCreated = () => {
    // Rafraîchir la liste des produits
    fetchProducts();
  };

  const handleShowInfo = (title: string, message: string) => {
    setInfoMessage(message);
    setInfoTitle(title);
    setIsInfoModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deleteProduct(productToDelete.id);
      if (success) {
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
        setInfoTitle("✅ Succès");
        setInfoMessage(
          `Le produit "${productToDelete?.name}" a été supprimé avec succès.`
        );
        setIsInfoModalOpen(true);
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
      alert(
        `Erreur lors de la suppression : ${error.message || "Erreur inconnue"}`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    let success = false;

    if (product.isActive) {
      // Le produit est actif, on le désactive
      success = await deactivateProduct(product.id);
      if (success) {
        setInfoTitle("✅ Succès");
        setInfoMessage(
          `Le produit "${product.name}" a été désactivé avec succès.`
        );
        setIsInfoModalOpen(true);
      }
    } else {
      // Le produit est inactif, on l'active
      success = await activateProduct(product.id);
      if (success) {
        setInfoTitle("✅ Succès");
        setInfoMessage(
          `Le produit "${product.name}" a été activé avec succès.`
        );
        setIsInfoModalOpen(true);
      }
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    // Le filtrage se fait maintenant côté frontend, pas besoin d'appel API
  };

  const formatPrice = (price: number | string) => {
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(numericPrice);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  // Fonction de filtrage côté frontend
  const getFilteredProducts = () => {
    let filteredProducts = [...products];

    // Filtre par recherche (nom et description)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          (product.description &&
            product.description.toLowerCase().includes(searchLower))
      );
    }

    // Filtre par catégorie
    if (filters.category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.categoryId === parseInt(filters.category)
      );
    }

    // Filtre par statut
    if (filters.status) {
      const isActive = filters.status === "active";
      filteredProducts = filteredProducts.filter(
        (product) => product.isActive === isActive
      );
    }

    // Tri
    filteredProducts.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "price":
          aValue = typeof a.price === "string" ? parseFloat(a.price) : a.price;
          bValue = typeof b.price === "string" ? parseFloat(b.price) : b.price;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (filters.sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filteredProducts;
  };

  const filteredProducts = getFilteredProducts();

  if (loading && products.length === 0) {
    return (
      <div className={`product-list ${className}`}>
        <div className="loading">Chargement des produits...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`product-list ${className}`}>
        <div className="error">Erreur : {error}</div>
      </div>
    );
  }

  return (
    <div className={`product-list ${className}`}>
      <div className="product-list-header">
        <h2>Gestion des Produits</h2>
        <div className="header-actions">
          <span className="results-count">
            {filteredProducts.length} produit
            {filteredProducts.length > 1 ? "s" : ""} trouvé
            {filteredProducts.length > 1 ? "s" : ""}
          </span>
          <button className="btn btn-primary" onClick={handleCreateProduct}>
            Nouveau Produit
          </button>
        </div>
      </div>

      <ProductFilters
        filters={filters}
        categories={categories}
        onFiltersChange={handleFiltersChange}
      />

      <div className="product-table-container">
        <table className="product-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>TVA</th>
              <th>Statut</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className={!product.isActive ? "inactive" : ""}
              >
                <td>
                  <div className="product-image">
                    {(() => {
                      console.log(
                        `Product ${product.name} images:`,
                        product.images
                      );
                      if (product.images && product.images.length > 0) {
                        console.log(
                          `First image for ${product.name}:`,
                          product.images[0]
                        );
                        return (
                          <>
                            <img
                              src={`/uploads/products/${product.images[0].filename}`}
                              alt={product.images[0].altText || product.name}
                              className="product-thumbnail"
                              onError={(e) => {
                                console.log(
                                  "Image load error:",
                                  product.images[0].filename
                                );
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextElementSibling.style.display =
                                  "flex";
                              }}
                            />
                            <div
                              className="no-image"
                              style={{ display: "none" }}
                            >
                              <span>📷</span>
                            </div>
                          </>
                        );
                      } else {
                        console.log(`No images for product ${product.name}`);
                        return (
                          <div className="no-image">
                            <span>📷</span>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </td>
                <td>
                  <div className="product-name">
                    <strong>{product.name}</strong>
                    {product.description && (
                      <div className="product-description">
                        {product.description}
                      </div>
                    )}
                  </div>
                </td>
                <td>{product.categoryName || "Non catégorisé"}</td>
                <td>
                  <span className="price">{formatPrice(product.price)}</span>
                </td>
                <td>
                  <span className="vat-rate">
                    {typeof product.vatRate === "string"
                      ? parseFloat(product.vatRate)
                      : product.vatRate}
                    %
                  </span>
                </td>
                <td>
                  <span
                    className={`status ${
                      product.isActive ? "active" : "inactive"
                    }`}
                  >
                    {product.isActive ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td>
                  <span className="date">{formatDate(product.createdAt)}</span>
                </td>
                <td>
                  <div className="actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditProduct(product)}
                      title="Modifier"
                    >
                      ✎
                    </button>
                    <button
                      className={`btn btn-sm ${
                        product.isActive ? "btn-warning" : "btn-success"
                      }`}
                      onClick={() => handleToggleStatus(product)}
                      title={product.isActive ? "Désactiver" : "Activer"}
                    >
                      {product.isActive ? "⏸" : "▶"}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteProduct(product)}
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="no-products">
            <p>Aucun produit trouvé.</p>
          </div>
        )}
      </div>

      {/* Pagination supprimée car filtrage côté frontend */}

      {isModalOpen && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          onClose={handleCloseModal}
          onProductCreated={handleProductCreated}
          onShowInfo={handleShowInfo}
        />
      )}

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={infoTitle}
        message={infoMessage}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Supprimer le produit"
        message="Êtes-vous sûr de vouloir supprimer ce produit ?"
        itemName={productToDelete?.name || ""}
        isLoading={isDeleting}
        warningMessage="Cette action ne peut pas être annulée."
      />

      <style jsx>{`
        .product-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-image {
          flex-shrink: 0;
        }

        .product-thumbnail {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #e5e7eb;
        }

        .no-image {
          width: 50px;
          height: 50px;
          background-color: #f3f4f6;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #9ca3af;
        }

        .product-name {
          flex: 1;
        }

        @media (max-width: 768px) {
          .product-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .product-thumbnail {
            width: 40px;
            height: 40px;
          }

          .no-image {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductList;
