"use client";

import React, { useState, useEffect } from "react";
import { CategoryData } from "../../shared-types";
import { useCategories } from "../lib/hooks/useCategories";
import { Modal, Button, FormField } from "./common";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CategoryData | null;
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
        const updateData: CategoryData = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        };

        const updatedCategory = await updateCategory(category.id!, updateData);
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
        const createData: CategoryData = {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={category ? "Modifier la catégorie" : "Nouvelle catégorie"}
      size="md"
      closeOnOverlayClick={!loading}
    >
      <form onSubmit={handleSubmit} className="product-form">
        {error && (
          <div className="error-message bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="form-content space-y-4">
          <FormField
            label="Nom de la catégorie"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ex: Électronique, Maison & Jardin..."
            required
            disabled={loading}
            error={
              error && formData.name.trim() === ""
                ? "Le nom est obligatoire"
                : undefined
            }
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description de la catégorie (optionnel)"
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="modal-actions flex gap-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !formData.name.trim()}
            loading={loading}
            className="flex-1"
          >
            {category ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
