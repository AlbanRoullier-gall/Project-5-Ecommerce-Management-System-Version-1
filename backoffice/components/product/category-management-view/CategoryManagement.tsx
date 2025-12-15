import React, { useState, useEffect } from "react";
import {
  CategoryPublicDTO,
  CategoryCreateDTO,
  CategoryUpdateDTO,
} from "dto";
import CategoryForm from "./category/CategoryForm";
import CategoryTable from "./category/CategoryTable";
import { ManagementSection } from "../../shared";
import { useCategoryForm } from "../../../hooks";

/**
 * Props du composant CategoryManagement
 */
interface CategoryManagementProps {
  /** Liste des catégories */
  categories: CategoryPublicDTO[];
  /** Callback appelé pour ajouter une catégorie */
  onAddCategory: (data: CategoryCreateDTO) => void;
  /** Callback appelé pour mettre à jour une catégorie */
  onUpdateCategory: (id: number, data: CategoryUpdateDTO) => void;
  /** Callback appelé pour supprimer une catégorie */
  onDeleteCategory: (id: number) => void;
  /** Indique si une action est en cours */
  isLoading?: boolean;
  /** Fermer la gestion des catégories */
  onClose?: () => void;
}

/**
 * Composant de gestion des catégories de produits
 *
 * Fonctionnalités :
 * - Affichage de la liste des catégories avec compteur de produits
 * - Création de nouvelles catégories
 * - Édition de catégories existantes
 * - Suppression de catégories (avec confirmation)
 * - Gestion du formulaire inline
 *
 * @example
 * <CategoryManagement
 *   categories={categories}
 *   onAddCategory={handleCreateCategory}
 *   onUpdateCategory={handleUpdateCategory}
 *   onDeleteCategory={handleDeleteCategory}
 *   isLoading={isLoading}
 * />
 */
const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  isLoading = false,
  onClose,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryPublicDTO | null>(null);

  const {
    formData,
    errors,
    handleChange,
    handleSubmit: handleFormSubmit,
    resetForm,
  } = useCategoryForm({ editingCategory });

  // Ouvrir le formulaire quand on édite une catégorie
  useEffect(() => {
    if (editingCategory) {
      setIsFormOpen(true);
    }
  }, [editingCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleFormSubmit((data, isEdit) => {
      if (isEdit && editingCategory) {
        onUpdateCategory(editingCategory.id, data);
      } else {
        onAddCategory(data as CategoryCreateDTO);
      }
      handleCancel();
    });
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    resetForm();
  };

  const handleEdit = (category: CategoryPublicDTO) => {
    setEditingCategory(category);
  };

  const handleDelete = (categoryId: number, categoryName: string) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ? Tous les produits de cette catégorie devront être réassignés.`
      )
    ) {
      onDeleteCategory(categoryId);
    }
  };

  return (
    <ManagementSection
      title="🏷️ Catégories"
      addButtonText="Nouvelle catégorie"
      onAdd={() => setIsFormOpen(true)}
      onClose={onClose}
      isFormOpen={isFormOpen}
      formContent={
        <CategoryForm
          formData={formData}
          errors={errors}
          editingCategory={editingCategory}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onCancel={handleCancel}
        />
      }
      listContent={
        <CategoryTable
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      }
    />
  );
};

export default CategoryManagement;
