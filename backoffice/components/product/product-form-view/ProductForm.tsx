import React, { useState, useEffect } from "react";
import {
  ProductPublicDTO,
  ProductCreateDTO,
  ProductUpdateDTO,
  CategoryPublicDTO,
} from "../../../dto";
import FormInput from "../../shared/form/FormInput";
import FormTextarea from "../../shared/form/FormTextarea";
import FormSelect from "../../shared/form/FormSelect";
import FormCheckbox from "../../shared/form/FormCheckbox";
import FormActions from "../../shared/form/FormActions";
import ImageUploadZone from "./image/ImageUploadZone";
import ExistingImagesList from "./image/ExistingImagesList";
import NewImagesList from "./image/NewImagesList";

/**
 * Props du composant ProductForm
 */
interface ProductFormProps {
  /** Produit à éditer (null ou undefined pour création) */
  product?: ProductPublicDTO | null;
  /** Liste des catégories disponibles */
  categories: CategoryPublicDTO[];
  /** Callback appelé lors de la soumission du formulaire */
  onSubmit: (
    data: ProductCreateDTO | ProductUpdateDTO,
    images?: File[],
    imagesToDelete?: number[]
  ) => void;
  /** Callback appelé lors de l'annulation */
  onCancel: () => void;
  /** Indique si une action est en cours */
  isLoading?: boolean;
}

/**
 * Composant de formulaire de produit (création/édition)
 *
 * Fonctionnalités :
 * - Champs : nom, description, prix, TVA, catégorie, statut actif
 * - Gestion des images (max 5) avec upload et suppression
 * - Validation des données avant soumission
 * - Gestion des états de chargement
 * - Prévisualisation des images
 *
 * En mode édition, affiche les données du produit et permet de :
 * - Modifier toutes les informations
 * - Supprimer des images existantes
 * - Ajouter de nouvelles images
 *
 * @example
 * <ProductForm
 *   product={editingProduct}
 *   categories={categories}
 *   onSubmit={handleSubmit}
 *   onCancel={handleCancel}
 *   isLoading={isLoading}
 * />
 */
const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // État du formulaire
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

  // États de validation et images
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  /**
   * Effet : réinitialise le formulaire quand le produit change
   * Utile en mode édition pour charger les données du produit
   */
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

  /**
   * Effet de nettoyage : libère les URLs de prévisualisation
   * Évite les fuites mémoire avec les object URLs
   */
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  /**
   * Gère les changements de valeurs dans les champs du formulaire
   * Convertit automatiquement les valeurs numériques et booléennes
   */
  const handleChange = (
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
  };

  /**
   * Valide les données du formulaire
   * @returns true si toutes les validations passent, false sinon
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Le nom du produit est requis";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Le prix doit être supérieur à 0";
    }

    if (
      formData.vatRate === undefined ||
      formData.vatRate < 0 ||
      formData.vatRate > 100
    ) {
      newErrors.vatRate = "Le taux de TVA doit être entre 0 et 100";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "La catégorie est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Gère l'ajout de nouvelles images
   * Valide le type, la taille et le nombre maximum d'images
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  /**
   * Retire une nouvelle image de la sélection
   * @param index - Index de l'image à retirer
   */
  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Marque une image existante pour suppression
   * @param imageId - ID de l'image à supprimer
   */
  const handleMarkImageForDeletion = (imageId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
      setImagesToDelete((prev) => [...prev, imageId]);
    }
  };

  /**
   * Gère la soumission du formulaire
   * Valide les données et appelle le callback onSubmit
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit(
      formData,
      selectedImages.length > 0 ? selectedImages : undefined,
      imagesToDelete.length > 0 ? imagesToDelete : undefined
    );
  };

  // Prépare les options pour le select de catégories
  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  // Calcule le nombre d'emplacements restants pour les images
  const existingCount = product?.images
    ? product.images.filter((img) => !imagesToDelete.includes(img.id)).length
    : 0;
  const remainingSlots = 5 - existingCount - selectedImages.length;

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "2.5rem",
        marginBottom: "2rem",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
        border: "2px solid rgba(19, 104, 106, 0.1)",
        width: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <h2
        style={{
          fontSize: "2.5rem",
          color: "#13686a",
          fontWeight: "bold",
          marginBottom: "2rem",
          paddingBottom: "1rem",
          borderBottom: "3px solid #d9b970",
        }}
      >
        {product ? "✏️ Modifier le produit" : "➕ Nouveau produit"}
      </h2>

      <form
        onSubmit={handleSubmit}
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
          onChange={handleChange}
          label="Nom du produit"
          placeholder="Ex: Pierre de lune"
          error={errors.name}
          required
        />

        <FormTextarea
          id="description"
          name="description"
          value={(formData.description as string) || ""}
          onChange={handleChange}
          label="Description"
          placeholder="Description détaillée du produit..."
          rows={4}
        />

        <div
          className="form-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <FormInput
            id="price"
            name="price"
            type="number"
            value={formData.price || 0}
            onChange={handleChange}
            label="Prix (€)"
            placeholder="0.00"
            error={errors.price}
            required
            step="0.01"
            min="0"
          />

          <FormInput
            id="vatRate"
            name="vatRate"
            type="number"
            value={formData.vatRate || 0}
            onChange={handleChange}
            label="Taux TVA (%)"
            placeholder="21"
            error={errors.vatRate}
            required
            step="0.01"
            min="0"
            max="100"
          />
        </div>

        <FormSelect
          id="categoryId"
          name="categoryId"
          value={formData.categoryId || ""}
          onChange={handleChange}
          label="Catégorie"
          options={categoryOptions}
          error={errors.categoryId}
          required
          placeholder="Sélectionnez une catégorie"
        />

        <FormCheckbox
          id="isActive"
          name="isActive"
          checked={formData.isActive ?? true}
          onChange={handleChange}
          label="✅ Produit actif (visible sur le site)"
        />

        <div
          className="images-section"
          style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
        >
          <label
            style={{
              display: "block",
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "#13686a",
              marginBottom: "0.75rem",
            }}
          >
            📷 Images du produit (max 5)
          </label>

          {product && product.images && product.images.length > 0 && (
            <ExistingImagesList
              images={product.images}
              imagesToDelete={imagesToDelete}
              onMarkForDeletion={handleMarkImageForDeletion}
            />
          )}

          <ImageUploadZone
            onFileChange={handleImageChange}
            remainingSlots={remainingSlots}
            isDisabled={isLoading}
          />

          <NewImagesList
            files={selectedImages}
            previewUrls={imagePreviewUrls}
            onRemove={handleRemoveImage}
          />
        </div>

        <FormActions
          onCancel={onCancel}
          isLoading={isLoading}
          isEdit={!!product}
          submitLabel={product ? "💾 Mettre à jour" : "➕ Créer le produit"}
        />
      </form>
    </div>
  );
};

export default ProductForm;
