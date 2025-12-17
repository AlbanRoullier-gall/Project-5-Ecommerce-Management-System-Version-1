import React from "react";
import { CategoryPublicDTO, CategoryCreateDTO, CategoryUpdateDTO } from "dto";
import FormInput from "../../../shared/form/FormInput";
import FormTextarea from "../../../shared/form/FormTextarea";
import FormActions from "../../../shared/form/FormActions";
import styles from "../../../../styles/components/CategoryForm.module.css";

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
    <div className={styles.card}>
      <h3 className={styles.title}>
        {editingCategory ? "✏️ Modifier la catégorie" : "➕ Nouvelle catégorie"}
      </h3>
      <form onSubmit={onSubmit} className={styles.form}>
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
