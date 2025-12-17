import React from "react";
import {
  ProductPublicDTO,
  ProductCreateDTO,
  ProductUpdateDTO,
  CategoryPublicDTO,
} from "dto";
import FormInput from "../../shared/form/FormInput";
import FormTextarea from "../../shared/form/FormTextarea";
import FormSelect from "../../shared/form/FormSelect";
import FormCheckbox from "../../shared/form/FormCheckbox";
import FormActions from "../../shared/form/FormActions";
import ImageUploadZone from "./image/ImageUploadZone";
import ExistingImagesList from "./image/ExistingImagesList";
import NewImagesList from "./image/NewImagesList";
import { useProductForm } from "../../../hooks";
import styles from "../../../styles/components/ProductForm.module.css";

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
  const {
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
  } = useProductForm({ product: product || null, categories });

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(onSubmit);
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>
        {product ? "✏️ Modifier le produit" : "➕ Nouveau produit"}
      </h2>

      <form onSubmit={onSubmitHandler} className={styles.form}>
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

        <div className={styles.grid}>
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

        <div className={styles.imagesSection}>
          <label className={styles.imagesLabel}>
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
