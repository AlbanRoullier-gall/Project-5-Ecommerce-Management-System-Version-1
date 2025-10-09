import React, { useState, useEffect } from "react";
import {
  ProductPublicDTO,
  ProductCreateDTO,
  ProductUpdateDTO,
  CategoryPublicDTO,
} from "../../dto";

interface ProductFormProps {
  product?: ProductPublicDTO | null;
  categories: CategoryPublicDTO[];
  onSubmit: (
    data: ProductCreateDTO | ProductUpdateDTO,
    images?: File[],
    imagesToDelete?: number[]
  ) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
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
      // Reset les images sélectionnées en mode édition
      setSelectedImages([]);
      setImagePreviewUrls([]);
      setImagesToDelete([]);
    }
  }, [product]);

  // Nettoyer les preview URLs au démontage
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

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

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const existingCount = product?.images?.length || 0;
    const totalImages = existingCount + selectedImages.length + files.length;

    // Limiter à 5 images total
    if (totalImages > 5) {
      alert(
        `Vous ne pouvez avoir que 5 images maximum. Vous avez déjà ${
          existingCount + selectedImages.length
        } image(s).`
      );
      return;
    }

    // Valider chaque fichier
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

    // Ajouter les fichiers
    setSelectedImages((prev) => [...prev, ...files]);

    // Créer les previews
    files.forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrls((prev) => [...prev, previewUrl]);
    });

    e.target.value = ""; // Reset input
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMarkImageForDeletion = (imageId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
      setImagesToDelete((prev) => [...prev, imageId]);
    }
  };

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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "1rem 1.25rem",
    border: "2px solid #e1e5e9",
    borderRadius: "10px",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    background: "#f8f9fa",
    fontFamily: "inherit",
    boxSizing: "border-box",
    maxWidth: "100%",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#13686a",
    marginBottom: "0.75rem",
  };

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
        {/* Nom */}
        <div
          style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
        >
          <label htmlFor="name" style={labelStyle}>
            Nom du produit *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{
              ...inputStyle,
              borderColor: errors.name ? "#dc2626" : "#e1e5e9",
            }}
            placeholder="Ex: Pierre de lune"
            onFocus={(e) => {
              if (!errors.name) {
                e.target.style.borderColor = "#13686a";
                e.target.style.background = "white";
                e.target.style.boxShadow = "0 0 0 3px rgba(19, 104, 106, 0.1)";
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.name ? "#dc2626" : "#e1e5e9";
              e.target.style.background = "#f8f9fa";
              e.target.style.boxShadow = "none";
            }}
          />
          {errors.name && (
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.9rem",
                color: "#dc2626",
              }}
            >
              ⚠️ {errors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div
          style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
        >
          <label htmlFor="description" style={labelStyle}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            style={inputStyle}
            placeholder="Description détaillée du produit..."
            onFocus={(e) => {
              e.target.style.borderColor = "#13686a";
              e.target.style.background = "white";
              e.target.style.boxShadow = "0 0 0 3px rgba(19, 104, 106, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e1e5e9";
              e.target.style.background = "#f8f9fa";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Prix et TVA */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
          >
            <label htmlFor="price" style={labelStyle}>
              Prix (€) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              style={{
                ...inputStyle,
                borderColor: errors.price ? "#dc2626" : "#e1e5e9",
              }}
              placeholder="0.00"
              onFocus={(e) => {
                if (!errors.price) {
                  e.target.style.borderColor = "#13686a";
                  e.target.style.background = "white";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(19, 104, 106, 0.1)";
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.price
                  ? "#dc2626"
                  : "#e1e5e9";
                e.target.style.background = "#f8f9fa";
                e.target.style.boxShadow = "none";
              }}
            />
            {errors.price && (
              <p
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.9rem",
                  color: "#dc2626",
                }}
              >
                ⚠️ {errors.price}
              </p>
            )}
          </div>

          <div
            style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
          >
            <label htmlFor="vatRate" style={labelStyle}>
              Taux TVA (%) *
            </label>
            <input
              type="number"
              id="vatRate"
              name="vatRate"
              value={formData.vatRate}
              onChange={handleChange}
              step="0.01"
              min="0"
              max="100"
              style={{
                ...inputStyle,
                borderColor: errors.vatRate ? "#dc2626" : "#e1e5e9",
              }}
              placeholder="21"
              onFocus={(e) => {
                if (!errors.vatRate) {
                  e.target.style.borderColor = "#13686a";
                  e.target.style.background = "white";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(19, 104, 106, 0.1)";
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.vatRate
                  ? "#dc2626"
                  : "#e1e5e9";
                e.target.style.background = "#f8f9fa";
                e.target.style.boxShadow = "none";
              }}
            />
            {errors.vatRate && (
              <p
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.9rem",
                  color: "#dc2626",
                }}
              >
                ⚠️ {errors.vatRate}
              </p>
            )}
          </div>
        </div>

        {/* Catégorie */}
        <div
          style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
        >
          <label htmlFor="categoryId" style={labelStyle}>
            Catégorie *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            style={{
              ...inputStyle,
              borderColor: errors.categoryId ? "#dc2626" : "#e1e5e9",
            }}
            onFocus={(e) => {
              if (!errors.categoryId) {
                e.target.style.borderColor = "#13686a";
                e.target.style.background = "white";
                e.target.style.boxShadow = "0 0 0 3px rgba(19, 104, 106, 0.1)";
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.categoryId
                ? "#dc2626"
                : "#e1e5e9";
              e.target.style.background = "#f8f9fa";
              e.target.style.boxShadow = "none";
            }}
          >
            <option value="">Sélectionnez une catégorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.9rem",
                color: "#dc2626",
              }}
            >
              ⚠️ {errors.categoryId}
            </p>
          )}
        </div>

        {/* Statut */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#f8f9fa",
            padding: "1.5rem",
            borderRadius: "10px",
            border: "2px solid #e1e5e9",
          }}
        >
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            style={{
              width: "1.25rem",
              height: "1.25rem",
              marginRight: "1rem",
              cursor: "pointer",
            }}
          />
          <label
            htmlFor="isActive"
            style={{
              fontSize: "1rem",
              color: "#111827",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            ✅ Produit actif (visible sur le site)
          </label>
        </div>

        {/* Images */}
        <div
          style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
        >
          <label style={labelStyle}>📷 Images du produit (max 5)</label>

          {/* Images existantes en mode édition */}
          {product && product.images && product.images.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#6b7280",
                  marginBottom: "0.5rem",
                }}
              >
                Images actuelles (
                {
                  product.images.filter(
                    (img) => !imagesToDelete.includes(img.id)
                  ).length
                }
                /5) :
              </p>
              <div
                style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
              >
                {product.images
                  .filter((img) => !imagesToDelete.includes(img.id))
                  .map((img) => (
                    <div
                      key={img.id}
                      style={{
                        position: "relative",
                        width: "100px",
                        height: "100px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: "2px solid #e1e5e9",
                      }}
                    >
                      <img
                        src={`http://localhost:3020/${img.filePath}`}
                        alt={img.filename}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleMarkImageForDeletion(img.id)}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          background: "rgba(239, 68, 68, 0.9)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                        }}
                      >
                        ✕
                      </button>
                      <div
                        style={{
                          position: "absolute",
                          bottom: "0",
                          left: "0",
                          right: "0",
                          background: "rgba(0, 0, 0, 0.7)",
                          color: "white",
                          fontSize: "0.6rem",
                          padding: "0.25rem",
                          textAlign: "center",
                        }}
                      >
                        #{img.orderIndex + 1}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Zone d'upload */}
          {(() => {
            const existingCount = product?.images
              ? product.images.filter((img) => !imagesToDelete.includes(img.id))
                  .length
              : 0;
            const totalCount = existingCount + selectedImages.length;
            return totalCount < 5;
          })() && (
            <label
              style={{
                display: "block",
                border: "2px dashed #d1d5db",
                borderRadius: "10px",
                padding: "2rem",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background: "#f9fafb",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#13686a";
                e.currentTarget.style.background = "#f0fdf4";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
                e.currentTarget.style.background = "#f9fafb";
              }}
            >
              <i
                className="fas fa-cloud-upload-alt"
                style={{
                  fontSize: "2.5rem",
                  color: "#9ca3af",
                  marginBottom: "0.5rem",
                }}
              ></i>
              <p
                style={{
                  fontSize: "1rem",
                  color: "#6b7280",
                  marginBottom: "0.25rem",
                }}
              >
                Cliquez pour sélectionner des images
              </p>
              <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                PNG, JPG, GIF - Max 10MB par image -{" "}
                {(() => {
                  const existingCount = product?.images
                    ? product.images.filter(
                        (img) => !imagesToDelete.includes(img.id)
                      ).length
                    : 0;
                  return 5 - existingCount - selectedImages.length;
                })()}{" "}
                restante(s)
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                style={{ display: "none" }}
                disabled={isLoading}
              />
            </label>
          )}

          {/* Aperçu des nouvelles images */}
          {selectedImages.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#6b7280",
                  marginBottom: "0.5rem",
                }}
              >
                Images sélectionnées ({selectedImages.length}/5) :
              </p>
              <div
                style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
              >
                {selectedImages.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      width: "100px",
                      height: "100px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      border: "2px solid #10b981",
                    }}
                  >
                    <img
                      src={imagePreviewUrls[index]}
                      alt={file.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        background: "rgba(239, 68, 68, 0.9)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                      }}
                    >
                      ✕
                    </button>
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0",
                        left: "0",
                        right: "0",
                        background: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        fontSize: "0.7rem",
                        padding: "0.25rem",
                        textAlign: "center",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {file.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Boutons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
            paddingTop: "2rem",
            borderTop: "2px solid #e1e5e9",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: "1rem 2rem",
              border: "2px solid #e1e5e9",
              background: "white",
              color: "#6b7280",
              borderRadius: "10px",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              opacity: isLoading ? 0.5 : 1,
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.borderColor = "#13686a";
                e.currentTarget.style.color = "#13686a";
                e.currentTarget.style.background = "#f8f9fa";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#e1e5e9";
              e.currentTarget.style.color = "#6b7280";
              e.currentTarget.style.background = "white";
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "1rem 2rem",
              background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(19, 104, 106, 0.2)",
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(19, 104, 106, 0.35)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(19, 104, 106, 0.2)";
            }}
          >
            {isLoading
              ? "⏳ En cours..."
              : product
              ? "💾 Mettre à jour"
              : "➕ Créer le produit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
