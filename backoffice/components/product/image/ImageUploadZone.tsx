import React from "react";

/**
 * Props du composant ImageUploadZone
 */
interface ImageUploadZoneProps {
  /** Callback appelé lors de la sélection de fichiers */
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Nombre d'emplacements restants pour les images (max 5) */
  remainingSlots: number;
  /** Indique si l'upload est désactivé */
  isDisabled?: boolean;
  /** Permet la sélection de plusieurs fichiers */
  multiple?: boolean;
}

/**
 * Composant de zone d'upload d'images
 * Affiche une zone cliquable avec drag & drop visuel pour uploader des images
 * Se cache automatiquement quand le nombre maximum d'images est atteint
 *
 * @example
 * <ImageUploadZone
 *   onFileChange={handleImageChange}
 *   remainingSlots={5 - images.length}
 *   isDisabled={isLoading}
 * />
 */
const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  onFileChange,
  remainingSlots,
  isDisabled = false,
  multiple = true,
}) => {
  // Cacher la zone si plus d'emplacements disponibles
  if (remainingSlots <= 0) {
    return null;
  }

  return (
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
      {/* Icône d'upload */}
      <i
        className="fas fa-cloud-upload-alt"
        style={{
          fontSize: "2.5rem",
          color: "#9ca3af",
          marginBottom: "0.5rem",
        }}
      ></i>

      {/* Instructions */}
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
        PNG, JPG, GIF - Max 10MB par image - {remainingSlots} restante(s)
      </p>

      {/* Input file caché */}
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={onFileChange}
        style={{ display: "none" }}
        disabled={isDisabled}
      />
    </label>
  );
};

export default ImageUploadZone;
