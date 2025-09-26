"use client";

import React, { useState } from "react";
import { CategoryData } from "../../shared-types";
import { useCategories } from "../lib/hooks/useCategories";
import CategoryModal from "./CategoryModal";
import CategoryFilters from "./CategoryFilters";
import DeleteConfirmModal from "./DeleteConfirmModal";
import InfoModal from "./InfoModal";

interface CategoryListProps {
  className?: string;
}

const CategoryList: React.FC<CategoryListProps> = ({ className = "" }) => {
  const {
    categories,
    loading,
    error,
    pagination,
    fetchCategories,
    deleteCategory,
    refreshCategories,
  } = useCategories();

  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryData | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [infoTitle, setInfoTitle] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "name",
  });

  const handleEditCategory = (category: CategoryData) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleCategoryCreated = () => {
    // Rafraîchir la liste des catégories
    refreshCategories();
  };

  const handleShowInfo = (title: string, message: string) => {
    setInfoTitle(title);
    setInfoMessage(message);
    setIsInfoModalOpen(true);
  };

  const handleDeleteCategory = (category: CategoryData) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deleteCategory(categoryToDelete.id!);
      if (success) {
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
        setInfoMessage(
          `✅ La catégorie "${categoryToDelete?.name}" a été supprimée avec succès.`
        );
        setInfoTitle("✅ Succès");
        setIsInfoModalOpen(true);
      }
    } catch (error: any) {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);

      if (error.message === "CATEGORY_HAS_PRODUCTS") {
        // Afficher une modal d'information au lieu d'une erreur
        setInfoMessage(
          `❌ Impossible de supprimer la catégorie "${categoryToDelete?.name}"\n\nCette catégorie contient encore des produits associés.`
        );
        setInfoTitle("⚠️ Catégorie avec des produits");
        setIsInfoModalOpen(true);
      } else {
        alert(
          `Erreur lors de la suppression : ${
            error.message || "Erreur inconnue"
          }`
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    // Le filtrage se fait maintenant côté frontend, pas besoin d'appel API
  };

  // Filtrer et trier les catégories
  const filteredCategories = categories
    .filter((category) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          category.name.toLowerCase().includes(searchLower) ||
          (category.description &&
            category.description.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof CategoryData];
      let bValue: any = b[filters.sortBy as keyof CategoryData];

      if (filters.sortBy === "createdAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
        // Tri par date : plus récent en premier (décroissant)
        return bValue - aValue;
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
        // Tri alphabétique : A-Z (croissant)
        return aValue.localeCompare(bValue);
      }

      return 0;
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && categories.length === 0) {
    return (
      <div className={`product-list ${className}`}>
        <div className="loading">Chargement des catégories...</div>
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
        <h2>Gestion des Catégories</h2>
        <div className="header-actions">
          <span className="results-count">
            {filteredCategories.length} catégorie
            {filteredCategories.length > 1 ? "s" : ""} trouvée
            {filteredCategories.length > 1 ? "s" : ""}
          </span>
          <button className="btn btn-primary" onClick={handleCreateCategory}>
            Nouvelle Catégorie
          </button>
        </div>
      </div>

      <CategoryFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <div className="product-table-container">
        <table className="product-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Créée le</th>
              <th>Modifiée le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category.id}>
                <td>
                  <div className="category-name">
                    <strong>{category.name}</strong>
                    {(category as any).fullName &&
                      (category as any).fullName !== category.name && (
                        <div className="category-fullname">
                          {(category as any).fullName}
                        </div>
                      )}
                  </div>
                </td>
                <td>
                  <div className="category-description">
                    {category.description ? (
                      <span title={category.description}>
                        {category.description.length > 50
                          ? `${category.description.substring(0, 50)}...`
                          : category.description}
                      </span>
                    ) : (
                      <span className="no-description">Aucune description</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="date">
                    {formatDate(category.createdAt?.toString() || "")}
                  </span>
                </td>
                <td>
                  <span className="date">
                    {formatDate(category.updatedAt?.toString() || "")}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditCategory(category)}
                      title="Modifier"
                    >
                      ✎
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteCategory(category)}
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
      </div>

      {filteredCategories.length === 0 && (
        <div className="no-products">
          <p>Aucune catégorie trouvée.</p>
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={pagination.page === 1}
            onClick={() => fetchCategories()}
          >
            Précédent
          </button>

          <span className="pagination-info">
            Page {pagination.page} sur {pagination.pages} ({pagination.total}{" "}
            catégories)
          </span>

          <button
            className="btn btn-secondary"
            disabled={pagination.page === pagination.pages}
            onClick={() => fetchCategories()}
          >
            Suivant
          </button>
        </div>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={selectedCategory}
        onCategoryCreated={handleCategoryCreated}
        onShowInfo={handleShowInfo}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Supprimer la catégorie"
        message="Êtes-vous sûr de vouloir supprimer cette catégorie ?"
        itemName={categoryToDelete?.name || ""}
        isLoading={isDeleting}
        warningMessage="Cette action ne peut pas être annulée. Si cette catégorie contient des produits, la suppression échouera."
      />

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={infoTitle}
        message={infoMessage}
      />
    </div>
  );
};

export default CategoryList;
