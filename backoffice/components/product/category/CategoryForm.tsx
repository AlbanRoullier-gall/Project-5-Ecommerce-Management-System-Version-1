import React from "react";
import {
  CategoryPublicDTO,
  CategoryCreateDTO,
  CategoryUpdateDTO,
} from "../../../dto";
import FormInput from "../form/FormInput";
import FormTextarea from "../form/FormTextarea";
import FormActions from "../form/FormActions";

interface CategoryFormProps {
  formData: CategoryCreateDTO | CategoryUpdateDTO;
  errors: Record<string, string>;
  editingCategory: CategoryPublicDTO | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  formData,
  errors,
  editingCategory,
  isLoading,
  onSubmit,
  onChange,
  onCancel,
}) => {
  return (
    <div
      style={{
        marginBottom: "2rem",
        padding: "2rem",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        borderRadius: "12px",
        border: "2px solid rgba(19, 104, 106, 0.2)",
        width: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <h3
        style={{
          fontSize: "1.5rem",
          fontWeight: "600",
          marginBottom: "1.5rem",
          color: "#13686a",
        }}
      >
        {editingCategory ? "✏️ Modifier la catégorie" : "➕ Nouvelle catégorie"}
      </h3>
      <form
        onSubmit={onSubmit}
        style={{
          display: "grid",
          gap: "1.5rem",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <FormInput
          id="name"
          name="name"
          value={formData.name || ""}
          onChange={onChange}
          label="Nom"
          placeholder="Ex: Pierres précieuses"
          error={errors.name}
          required
        />

        <FormTextarea
          id="description"
          name="description"
          value={(formData.description as string) || ""}
          onChange={onChange}
          label="Description"
          placeholder="Description de la catégorie..."
          rows={3}
        />

        <FormActions
          onCancel={onCancel}
          isLoading={isLoading}
          isEdit={!!editingCategory}
          submitLabel={editingCategory ? "💾 Mettre à jour" : "➕ Créer"}
        />
      </form>
    </div>
  );
};

export default CategoryForm;
