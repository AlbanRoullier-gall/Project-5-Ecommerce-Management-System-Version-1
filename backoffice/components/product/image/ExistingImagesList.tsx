import React from "react";
import { ProductImagePublicDTO } from "../../../dto";

/**
 * Props du composant ExistingImagesList
 */
interface ExistingImagesListProps {
  /** Liste des images existantes du produit */
  images: ProductImagePublicDTO[];
  /** IDs des images marquées pour suppression */
  imagesToDelete: number[];
  /** Callback appelé pour marquer une image à supprimer */
  onMarkForDeletion: (imageId: number) => void;
}

/**
 * Composant d'affichage des images existantes d'un produit
 * Affiche les images actuelles avec bouton de suppression et numéro d'ordre
 * Filtre automatiquement les images marquées pour suppression
 *
 * @example
 * <ExistingImagesList
 *   images={product.images}
 *   imagesToDelete={imagesToDelete}
 *   onMarkForDeletion={handleMarkImageForDeletion}
 * />
 */
const ExistingImagesList: React.FC<ExistingImagesListProps> = ({
  images,
  imagesToDelete,
  onMarkForDeletion,
}) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";
  // Filtrer les images non marquées pour suppression
  const visibleImages = images.filter(
    (img) => !imagesToDelete.includes(img.id)
  );

  // Ne rien afficher si aucune image visible
  if (visibleImages.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      <p
        style={{
          fontSize: "0.9rem",
          color: "#6b7280",
          marginBottom: "0.5rem",
        }}
      >
        Images actuelles ({visibleImages.length}/5) :
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {visibleImages.map((img) => (
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
            {/* Image */}
            <img
              src={`${API_URL}/api/images/${img.id}`}
              alt={img.filename}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            {/* Bouton de suppression */}
            <button
              type="button"
              onClick={() => onMarkForDeletion(img.id)}
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

            {/* Numéro d'ordre */}
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
  );
};

export default ExistingImagesList;
