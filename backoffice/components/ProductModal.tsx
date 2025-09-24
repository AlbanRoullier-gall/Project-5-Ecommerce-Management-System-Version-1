"use client";

import React, { useState, useEffect } from "react";
import {
  Product,
  Category,
  CreateProductRequest,
  CreateProductWithImagesRequest,
  UpdateProductRequest,
} from "../../shared-types";
import { useProducts } from "../lib/hooks/useProducts";
import { productService } from "../lib/services/productService";
import ImageUpload from "./ImageUpload";

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
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
        categoryId: product.categoryId,
        isActive: product.isActive,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        vatRate: 20,
        categoryId: categories.length > 0 ? categories[0].id : 0,
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
        const updateData: UpdateProductRequest = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          vatRate: formData.vatRate,
          categoryId: formData.categoryId,
          isActive: formData.isActive,
        };

        const updatedProduct = await updateProduct(product.id, updateData);
        if (updatedProduct) {
          console.log("Produit mis à jour avec succès");

          // Supprimer les images marquées pour suppression
          if (imagesToDelete.length > 0) {
            console.log("Suppression des images:", imagesToDelete);
            for (const imageId of imagesToDelete) {
              try {
                const deleteResult = await productService.deleteImage(
                  product.id,
                  imageId
                );
                if (deleteResult.error) {
                  console.error(
                    "Erreur lors de la suppression de l'image:",
                    deleteResult.error
                  );
                } else {
                  console.log("Image supprimée avec succès:", imageId);
                }
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
              const addImagesResult = await productService.addImagesToProduct(
                product.id,
                selectedImages
              );

              if (addImagesResult.error) {
                console.error(
                  "Erreur lors de l'ajout des images:",
                  addImagesResult.error
                );
              } else {
                console.log(
                  "Images ajoutées avec succès:",
                  addImagesResult.data?.images?.length || 0
                );
              }
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
          const createData: CreateProductWithImagesRequest = {
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
          if (result.data) {
            console.log("Produit créé avec succès avec images");
            console.log("Images créées:", result.data.images?.length || 0);
            // Appeler le callback pour rafraîchir la liste
            onProductCreated?.();
            // Fermer la modal principale
            onClose();
            // Afficher le message de succès
            onShowInfo?.(
              "✅ Succès",
              `Le produit a été créé avec succès avec ${
                result.data.images?.length || 0
              } image(s).`
            );
          } else {
            console.log("Échec de la création du produit avec images");
            setError(
              result.error || "Échec de la création du produit avec images"
            );
          }
        } else {
          // Create product without images (existing logic)
          const createData: CreateProductRequest = {
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
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{product ? "Modifier le produit" : "Nouveau produit"}</h3>
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
              <label htmlFor="name">Nom du produit *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Prix HT *</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
                <div className="price-preview">
                  Prix TTC:{" "}
                  {formatPrice(formData.price * (1 + formData.vatRate / 100))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="vatRate">Taux de TVA (%)</label>
                <input
                  id="vatRate"
                  name="vatRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.vatRate}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="categoryId">Catégorie *</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                {categories.length === 0 ? (
                  <option value="">Aucune catégorie disponible</option>
                ) : (
                  <>
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Images du produit</label>

              {/* Afficher les images existantes si on modifie un produit */}
              {product && product.images && product.images.length > 0 && (
                <div className="existing-images">
                  <h4>Images actuelles :</h4>
                  <div className="existing-images-grid">
                    {product.images
                      .filter((image) => !imagesToDelete.includes(image.id))
                      .map((image, index) => (
                        <div
                          key={image.id || index}
                          className="existing-image-item"
                        >
                          <div className="image-container">
                            <img
                              src={`/uploads/products/${image.filename}`}
                              alt={image.altText || product.name}
                              className="existing-image-thumbnail"
                              onError={(e) => {
                                console.log(
                                  "Image load error:",
                                  image.filename
                                );
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextElementSibling.style.display =
                                  "flex";
                              }}
                            />
                            <div
                              className="no-image-fallback"
                              style={{ display: "none" }}
                            >
                              <span>📷</span>
                            </div>
                            <button
                              type="button"
                              className="delete-image-btn"
                              onClick={() => handleDeleteImage(image.id)}
                              title="Supprimer cette image"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="image-info">
                            <p className="image-filename">{image.filename}</p>
                            {image.altText && (
                              <p className="image-alt">{image.altText}</p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Afficher les images marquées pour suppression */}
                  {imagesToDelete.length > 0 && (
                    <div className="deleted-images-section">
                      <h5 className="deleted-images-title">
                        🗑️ Images à supprimer ({imagesToDelete.length})
                      </h5>
                      <div className="deleted-images-list">
                        {imagesToDelete.map((imageId) => {
                          const image = product.images?.find(
                            (img) => img.id === imageId
                          );
                          return image ? (
                            <div key={imageId} className="deleted-image-item">
                              <div className="deleted-image-info">
                                <span className="deleted-image-icon">📷</span>
                                <span
                                  className="deleted-image-name"
                                  title={image.filename}
                                >
                                  {image.filename.length > 30
                                    ? `${image.filename.substring(0, 30)}...`
                                    : image.filename}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="cancel-delete-btn"
                                onClick={() => handleCancelDeleteImage(imageId)}
                                title="Annuler la suppression"
                              >
                                ↶ Annuler
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Section pour ajouter de nouvelles images */}
              <div className="new-images-section">
                <h4>
                  {product
                    ? "Ajouter de nouvelles images :"
                    : "Images du produit :"}
                </h4>
                <ImageUpload
                  onImagesChange={setSelectedImages}
                  maxImages={product ? 3 - (product.images?.length || 0) : 3}
                  disabled={loading}
                />
                {product && (
                  <small className="image-help">
                    Vous pouvez ajouter jusqu'à{" "}
                    {3 - (product.images?.length || 0)} nouvelles images. Les
                    images existantes seront conservées.
                  </small>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span>Produit actif</span>
              </label>
              <small className="checkbox-help">
                Un produit actif est visible dans le catalogue et peut être
                commandé par les clients
              </small>
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
              disabled={loading || !formData.name || !formData.categoryId}
            >
              {loading
                ? "Enregistrement..."
                : product
                ? "Mettre à jour"
                : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
