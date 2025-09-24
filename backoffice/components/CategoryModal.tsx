"use client";

import React, { useState, useEffect } from "react";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../shared-types";
import { useCategories } from "../lib/hooks/useCategories";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onCategoryCreated?: () => void;
  onShowInfo?: (title: string, message: string) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onCategoryCreated,
  onShowInfo,
}) => {
  const { createCategory, updateCategory } = useCategories();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
      });
    }
    setError(null);
  }, [category]);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Le nom de la catégorie est obligatoire");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (category) {
        // Update existing category
        const updateData: UpdateCategoryRequest = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        };

        const updatedCategory = await updateCategory(category.id, updateData);
        if (updatedCategory) {
          console.log("Catégorie mise à jour avec succès");
          // Appeler le callback pour rafraîchir la liste
          onCategoryCreated?.();
          // Fermer la modal principale
          onClose();
          // Afficher le message de succès
          onShowInfo?.(
            "✅ Succès",
            "La catégorie a été mise à jour avec succès."
          );
        } else {
          console.log("Échec de la mise à jour de catégorie");
          alert("❌ Échec de la mise à jour de catégorie");
        }
      } else {
        // Create new category
        const createData: CreateCategoryRequest = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        };

        console.log("Tentative de création de catégorie avec:", createData);
        const newCategory = await createCategory(createData);
        console.log("Résultat de createCategory:", newCategory);

        if (newCategory) {
          console.log("Catégorie créée avec succès");
          // Appeler le callback pour rafraîchir la liste
          onCategoryCreated?.();
          // Fermer la modal principale
          onClose();
          // Afficher le message de succès
          onShowInfo?.("✅ Succès", "La catégorie a été créée avec succès.");
        } else {
          console.log("Échec de la création de catégorie");
          alert("❌ Échec de la création de catégorie");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{category ? "Modifier la catégorie" : "Nouvelle catégorie"}</h3>
          <button
            className="modal-close"
            onClick={handleClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-content">
            <div className="form-group">
              <label htmlFor="name">Nom de la catégorie *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Ex: Électronique, Maison & Jardin..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                disabled={loading}
                placeholder="Description de la catégorie (optionnel)"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formData.name.trim()}
            >
              {loading
                ? "Enregistrement..."
                : category
                ? "Mettre à jour"
                : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
