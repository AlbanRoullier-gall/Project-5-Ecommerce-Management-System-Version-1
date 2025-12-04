import { useState, useEffect, useCallback } from "react";
import {
  CategoryPublicDTO,
  CategoryCreateDTO,
  CategoryUpdateDTO,
} from "../dto";
import { validateCategory } from "../services/validationService";

interface UseCategoryFormProps {
  editingCategory: CategoryPublicDTO | null;
}

interface UseCategoryFormReturn {
  formData: CategoryCreateDTO | CategoryUpdateDTO;
  errors: Record<string, string>;

  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (
    onSubmit: (
      data: CategoryCreateDTO | CategoryUpdateDTO,
      isEdit: boolean
    ) => void
  ) => Promise<void>;
  resetForm: () => void;
}

export function useCategoryForm({
  editingCategory,
}: UseCategoryFormProps): UseCategoryFormReturn {
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
    } else {
      setFormData({ name: "", description: "" });
    }
  }, [editingCategory]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const validate = useCallback(async (): Promise<boolean> => {
    try {
      const result = await validateCategory(formData);

      if (!result.isValid && result.errors) {
        const newErrors: Record<string, string> = {};
        result.errors.forEach((error) => {
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
  }, [formData]);

  const handleSubmit = useCallback(
    async (
      onSubmit: (
        data: CategoryCreateDTO | CategoryUpdateDTO,
        isEdit: boolean
      ) => void
    ) => {
      const isValid = await validate();
      if (!isValid) {
        return;
      }

      onSubmit(formData, !!editingCategory);
    },
    [editingCategory, formData, validate]
  );

  const resetForm = useCallback(() => {
    setFormData({ name: "", description: "" });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
  };
}
