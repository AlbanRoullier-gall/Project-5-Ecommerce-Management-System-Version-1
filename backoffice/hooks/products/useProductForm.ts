import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ProductPublicDTO,
  ProductCreateDTO,
  ProductUpdateDTO,
  CategoryPublicDTO,
} from "../../dto";
import { validateProduct } from "../../services/validationService";
import { categoriesToOptions } from "../../utils/formUtils";

interface UseProductFormProps {
  product: ProductPublicDTO | null;
  categories: CategoryPublicDTO[];
}

interface UseProductFormReturn {
  formData: ProductCreateDTO | ProductUpdateDTO;
  errors: Record<string, string>;
  selectedImages: File[];
  imagePreviewUrls: string[];
  imagesToDelete: number[];
  remainingSlots: number;
  categoryOptions: Array<{ value: number; label: string }>;

  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (index: number) => void;
  handleMarkImageForDeletion: (imageId: number) => void;
  handleSubmit: (
    onSubmit: (
      data: ProductCreateDTO | ProductUpdateDTO,
      images?: File[],
      imagesToDelete?: number[]
    ) => void
  ) => Promise<void>;
}

export function useProductForm({
  product,
  categories,
}: UseProductFormProps): UseProductFormReturn {
  const [formData, setFormData] = useState<ProductCreateDTO | ProductUpdateDTO>(
    {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      vatRate: product?.vatRate || 21,
      categoryId: product?.categoryId || categories[0]?.id || 0,
      isActive: product?.isActive ?? true,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  // Initialize form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        vatRate: product.vatRate,
        categoryId: product.categoryId,
        isActive: product.isActive,
      });
      setSelectedImages([]);
      setImagePreviewUrls([]);
      setImagesToDelete([]);
    }
  }, [product]);

  // Cleanup image preview URLs
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "number"
            ? parseFloat(value) || 0
            : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
      }));

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
      const result = await validateProduct(formData);

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

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      const existingCount = product?.images?.length || 0;
      const totalImages = existingCount + selectedImages.length + files.length;

      if (totalImages > 5) {
        alert(
          `Vous ne pouvez avoir que 5 images maximum. Vous avez déjà ${
            existingCount + selectedImages.length
          } image(s).`
        );
        return;
      }

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} n'est pas une image valide`);
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} est trop volumineux (max 10MB)`);
          return;
        }
      }

      setSelectedImages((prev) => [...prev, ...files]);

      files.forEach((file) => {
        const previewUrl = URL.createObjectURL(file);
        setImagePreviewUrls((prev) => [...prev, previewUrl]);
      });

      e.target.value = "";
    },
    [product, selectedImages.length]
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      setSelectedImages((prev) => prev.filter((_, i) => i !== index));
      URL.revokeObjectURL(imagePreviewUrls[index]);
      setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
    },
    [imagePreviewUrls]
  );

  const handleMarkImageForDeletion = useCallback((imageId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
      setImagesToDelete((prev) => [...prev, imageId]);
    }
  }, []);

  const handleSubmit = useCallback(
    async (
      onSubmit: (
        data: ProductCreateDTO | ProductUpdateDTO,
        images?: File[],
        imagesToDelete?: number[]
      ) => void
    ) => {
      const isValid = await validate();
      if (!isValid) {
        return;
      }

      onSubmit(
        formData,
        selectedImages.length > 0 ? selectedImages : undefined,
        imagesToDelete.length > 0 ? imagesToDelete : undefined
      );
    },
    [formData, selectedImages, imagesToDelete, validate]
  );

  // Calculate remaining slots
  const existingCount = product?.images
    ? product.images.filter((img) => !imagesToDelete.includes(img.id)).length
    : 0;
  const remainingSlots = 5 - existingCount - selectedImages.length;

  // Transform categories to options
  const categoryOptions = useMemo(
    () => categoriesToOptions(categories),
    [categories]
  );

  return {
    formData,
    errors,
    selectedImages,
    imagePreviewUrls,
    imagesToDelete,
    remainingSlots,
    categoryOptions,
    handleChange,
    handleImageChange,
    handleRemoveImage,
    handleMarkImageForDeletion,
    handleSubmit,
  };
}
