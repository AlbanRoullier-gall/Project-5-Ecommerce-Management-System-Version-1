import React from "react";
import styles from "../../../../styles/components/NewImagesList.module.css";

/**
 * Props du composant NewImagesList
 */
interface NewImagesListProps {
  /** Liste des fichiers images sélectionnés */
  files: File[];
  /** URLs de prévisualisation générées pour chaque fichier */
  previewUrls: string[];
  /** Callback appelé pour retirer une image de la sélection */
  onRemove: (index: number) => void;
}

/**
 * Composant d'affichage des nouvelles images sélectionnées
 * Affiche les prévisualisations des images avec bouton de suppression et nom du fichier
 * Bordure verte pour différencier des images existantes
 *
 * @example
 * <NewImagesList
 *   files={selectedImages}
 *   previewUrls={imagePreviewUrls}
 *   onRemove={handleRemoveImage}
 * />
 */
const NewImagesList: React.FC<NewImagesListProps> = ({
  files,
  previewUrls,
  onRemove,
}) => {
  // Ne rien afficher si aucune nouvelle image
  if (files.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <p className={styles.caption}>
        Images sélectionnées ({files.length}/5) :
      </p>
      <div className={styles.grid}>
        {files.map((file, index) => (
          <div key={index} className={styles.card}>
            {/* Prévisualisation de l'image */}
            <img
              src={previewUrls[index]}
              alt={file.name}
              className={styles.image}
            />

            {/* Bouton de suppression */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className={styles.remove}
            >
              ✕
            </button>

            {/* Nom du fichier */}
            <div className={styles.filename}>{file.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewImagesList;
