import { useCallback, useMemo } from "react";
import {
  CategoryPublicDTO,
  CategoryCreateDTO,
  CategoryUpdateDTO,
} from "../../dto";
import { validateCategory } from "../../services/validationService";
import { useForm } from "../shared/useForm";

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
  const initialValues: CategoryCreateDTO = useMemo(
    () => ({
      name: "",
      description: "",
    }),
    []
  );

  const {
    formData,
    errors,
    handleChange,
    handleSubmit: baseHandleSubmit,
    resetForm,
  } = useForm<CategoryCreateDTO, CategoryPublicDTO>({
    original: editingCategory || null,
    initialValues,
    validateFn: validateCategory,
  });

  // Wrapper pour handleSubmit qui ajoute le paramètre isEdit
  const handleSubmit = useCallback(
    async (
      onSubmit: (
        data: CategoryCreateDTO | CategoryUpdateDTO,
        isEdit: boolean
      ) => void
    ) => {
      await baseHandleSubmit((data) => {
        onSubmit(
          data as CategoryCreateDTO | CategoryUpdateDTO,
          !!editingCategory
        );
      });
    },
    [baseHandleSubmit, editingCategory]
  );

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
  };
}
