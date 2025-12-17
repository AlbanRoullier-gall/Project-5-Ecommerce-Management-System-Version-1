import React from "react";
// Try absolute import using path mapping
import { ProductImagePublicDTO } from "dto";
import styles from "../../../../styles/components/ExistingImagesList.module.css";

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
    <div className={styles.container}>
      <p className={styles.caption}>
        Images actuelles ({visibleImages.length}/5) :
      </p>
      <div className={styles.grid}>
        {visibleImages.map((img) => (
          <div key={img.id} className={styles.card}>
            {/* Image */}
            <img
              src={`${API_URL}/api/images/${img.id}`}
              alt={img.filename}
              className={styles.image}
            />

            {/* Bouton de suppression */}
            <button
              type="button"
              onClick={() => onMarkForDeletion(img.id)}
              className={styles.remove}
            >
              ✕
            </button>

            {/* Numéro d'ordre */}
            <div className={styles.badge}>#{img.orderIndex + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExistingImagesList;
