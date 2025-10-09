import React from "react";

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
    <div style={{ marginTop: "1rem" }}>
      <p
        style={{
          fontSize: "0.9rem",
          color: "#6b7280",
          marginBottom: "0.5rem",
        }}
      >
        Images sélectionnées ({files.length}/5) :
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {files.map((file, index) => (
          <div
            key={index}
            style={{
              position: "relative",
              width: "100px",
              height: "100px",
              borderRadius: "10px",
              overflow: "hidden",
              border: "2px solid #10b981", // Bordure verte pour différencier
            }}
          >
            {/* Prévisualisation de l'image */}
            <img
              src={previewUrls[index]}
              alt={file.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            {/* Bouton de suppression */}
            <button
              type="button"
              onClick={() => onRemove(index)}
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

            {/* Nom du fichier */}
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
  );
};

export default NewImagesList;
