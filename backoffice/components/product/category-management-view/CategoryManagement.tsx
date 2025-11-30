import React, { useState, useEffect } from "react";
import {
  CategoryPublicDTO,
  CategoryCreateDTO,
  CategoryUpdateDTO,
} from "../../../dto";
import CategoryForm from "./category/CategoryForm";
import CategoryTable from "./category/CategoryTable";
import Button from "../../shared/Button";

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
  const [formData, setFormData] = useState<
    CategoryCreateDTO | CategoryUpdateDTO
  >({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || "",
      });
      setIsFormOpen(true);
    }
  }, [editingCategory]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = async (): Promise<boolean> => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";
      const response = await fetch(`${API_URL}/api/categories/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.isValid && result.errors) {
        const newErrors: Record<string, string> = {};
        result.errors.forEach((error: { field: string; message: string }) => {
          newErrors[error.field] = error.message;
        });
        setErrors(newErrors);
        return false;
      }

      setErrors({});
      return true;
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      setErrors({ _general: "Erreur lors de la validation" });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validate();
    if (!isValid) {
      return;
    }

    if (editingCategory) {
      onUpdateCategory(editingCategory.id, formData);
    } else {
      onAddCategory(formData as CategoryCreateDTO);
    }

    handleCancel();
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setErrors({});
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
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "2rem",
        marginBottom: "2rem",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        border: "2px solid rgba(19, 104, 106, 0.1)",
      }}
    >
      <div
        className="category-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          paddingBottom: "1rem",
          borderBottom: "3px solid #d9b970",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#13686a",
            margin: 0,
          }}
        >
          🏷️ Catégories
        </h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {!isFormOpen && (
            <Button
              onClick={() => setIsFormOpen(true)}
              variant="primary"
              icon="fas fa-plus"
            >
              Nouvelle catégorie
            </Button>
          )}
          {onClose && (
            <Button onClick={onClose} variant="gold" icon="fas fa-times">
              Fermer
            </Button>
          )}
        </div>
      </div>

      {/* Formulaire */}
      {isFormOpen && (
        <CategoryForm
          formData={formData}
          errors={errors}
          editingCategory={editingCategory}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onCancel={handleCancel}
        />
      )}

      {/* Liste des catégories */}
      <CategoryTable
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default CategoryManagement;
