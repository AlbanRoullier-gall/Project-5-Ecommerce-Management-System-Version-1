"use client";

import React, { useState, useEffect } from "react";
import { ProductData, CategoryData } from "../../../shared-types";
import { useProducts } from "../lib/hooks/useProducts";
import { productService } from "../lib/services/productService";
import { Modal, Button, FormField, ImageUpload } from "./common";

interface ProductModalProps {
  product: ProductData | null;
  categories: CategoryData[];
  onClose: () => void;
  onProductCreated?: () => void;
  onShowInfo?: (title: string, message: string) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  categories,
  onClose,
  onProductCreated,
  onShowInfo,
}) => {
  const { createProduct, updateProduct } = useProducts();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    vatRate: 20,
    categoryId: 0,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price:
          typeof product.price === "string"
            ? parseFloat(product.price)
            : product.price,
        vatRate:
          typeof product.vatRate === "string"
            ? parseFloat(product.vatRate)
            : product.vatRate,
        categoryId: product.categoryId!,
        isActive: product.isActive!,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        vatRate: 20,
        categoryId: categories.length > 0 ? categories[0].id! : 0,
        isActive: true,
      });
    }

    // Réinitialiser les états d'images à chaque ouverture de modal
    setSelectedImages([]);
    setImagesToDelete([]);
  }, [product, categories]);

  // Réinitialiser les états d'images à chaque fois que la modal s'ouvre
  useEffect(() => {
    setSelectedImages([]);
    setImagesToDelete([]);
  }, [product?.id]); // Se déclenche à chaque changement de produit

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleDeleteImage = (imageId: number) => {
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  const handleCancelDeleteImage = (imageId: number) => {
    setImagesToDelete((prev) => prev.filter((id) => id !== imageId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (product) {
        // Update existing product
        const updateData: ProductData = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          vatRate: formData.vatRate,
          categoryId: formData.categoryId,
          isActive: formData.isActive,
        };

        const updatedProduct = await updateProduct(product.id!, updateData);
        if (updatedProduct) {
          console.log("Produit mis à jour avec succès");

          // Supprimer les images marquées pour suppression
          if (imagesToDelete.length > 0) {
            console.log("Suppression des images:", imagesToDelete);
            for (const imageId of imagesToDelete) {
              try {
                await productService.deleteImage(product.id!, imageId);
                console.log("Image supprimée avec succès:", imageId);
              } catch (error) {
                console.error(
                  "Erreur lors de la suppression de l'image:",
                  error
                );
              }
            }
          }

          // Ajouter les nouvelles images si il y en a
          if (selectedImages && selectedImages.length > 0) {
            console.log("Ajout de nouvelles images:", selectedImages.length);
            try {
              await productService.addImagesToProduct(
                product.id!,
                selectedImages
              );
              console.log("Images ajoutées avec succès");
            } catch (error) {
              console.error("Erreur lors de l'ajout des images:", error);
            }
          }

          // Appeler le callback pour rafraîchir la liste
          onProductCreated?.();
          // Fermer la modal principale
          onClose();
          // Afficher le message de succès
          let message = "Le produit a été mis à jour avec succès.";
          if (
            imagesToDelete.length > 0 &&
            selectedImages &&
            selectedImages.length > 0
          ) {
            message = `Le produit a été mis à jour avec succès. ${imagesToDelete.length} image(s) supprimée(s) et ${selectedImages.length} nouvelle(s) image(s) ajoutée(s).`;
          } else if (imagesToDelete.length > 0) {
            message = `Le produit a été mis à jour avec succès. ${imagesToDelete.length} image(s) supprimée(s).`;
          } else if (selectedImages && selectedImages.length > 0) {
            message = `Le produit a été mis à jour avec succès. ${selectedImages.length} nouvelle(s) image(s) ajoutée(s).`;
          }
          onShowInfo?.("✅ Succès", message);
        } else {
          console.log("Échec de la mise à jour du produit");
          alert("❌ Échec de la mise à jour du produit");
        }
      } else {
        // Create new product
        if (selectedImages.length > 0) {
          // Create product with images
          const createData: ProductData & { images: File[] } = {
            name: formData.name,
            description: formData.description,
            price: formData.price,
            vatRate: formData.vatRate,
            categoryId: formData.categoryId,
            isActive: formData.isActive,
            images: selectedImages,
          };

          const result = await productService.createProductWithImages(
            createData
          );
          if (result) {
            console.log("Produit créé avec succès avec images");
            console.log("Images créées:", (result as any).images?.length || 0);
            // Appeler le callback pour rafraîchir la liste
            onProductCreated?.();
            // Fermer la modal principale
            onClose();
            // Afficher le message de succès
            onShowInfo?.(
              "✅ Succès",
              `Le produit a été créé avec succès avec ${
                (result as any).images?.length || 0
              } image(s).`
            );
          } else {
            console.log("Échec de la création du produit avec images");
            setError(
              (result as any).error ||
                "Échec de la création du produit avec images"
            );
          }
        } else {
          // Create product without images (existing logic)
          const createData: ProductData = {
            name: formData.name,
            description: formData.description,
            price: formData.price,
            vatRate: formData.vatRate,
            categoryId: formData.categoryId,
            isActive: formData.isActive,
          };

          const newProduct = await createProduct(createData);
          if (newProduct) {
            console.log("Produit créé avec succès");
            // Appeler le callback pour rafraîchir la liste
            onProductCreated?.();
            // Fermer la modal principale
            onClose();
            // Afficher le message de succès
            onShowInfo?.("✅ Succès", "Le produit a été créé avec succès.");
          } else {
            console.log("Échec de la création du produit");
            alert("❌ Échec de la création du produit");
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const formatPrice = (price: number | string) => {
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(numericPrice);
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={product ? "Modifier le produit" : "Nouveau produit"}
      size="lg"
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
            label="Nom du produit"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
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
            rows={3}
            disabled={loading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormField
                label="Prix HT"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
                disabled={loading}
                min={0}
                step="0.01"
              />
              <div className="text-sm text-gray-600 mt-1">
                Prix TTC:{" "}
                {formatPrice(formData.price * (1 + formData.vatRate / 100))}
              </div>
            </div>

            <FormField
              label="Taux de TVA (%)"
              name="vatRate"
              type="number"
              value={formData.vatRate}
              onChange={handleInputChange}
              disabled={loading}
              min={0}
              max={100}
              step="0.1"
            />
          </div>

          <FormField
            label="Catégorie"
            name="categoryId"
            type="select"
            value={formData.categoryId}
            onChange={handleInputChange}
            required
            disabled={loading}
            options={categories.map((cat) => ({
              value: cat.id!,
              label: cat.name,
            }))}
            placeholder={
              categories.length === 0
                ? "Aucune catégorie disponible"
                : "Sélectionner une catégorie"
            }
          />

          <ImageUpload
            onImagesChange={setSelectedImages}
            maxImages={3}
            existingImages={product ? (product as any).images || [] : []}
            onDeleteExisting={handleDeleteImage}
            disabled={loading}
          />

          <div className="form-group">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                disabled={loading}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Produit actif
              </span>
            </label>
            <small className="text-gray-500 text-sm mt-1 block">
              Un produit actif est visible dans le catalogue et peut être
              commandé par les clients
            </small>
          </div>
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
            disabled={loading || !formData.name || !formData.categoryId}
            loading={loading}
            className="flex-1"
          >
            {product ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
