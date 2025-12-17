import React, { useState } from "react";
import styles from "../../../../styles/components/ImageUploadZone.module.css";

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
  const [isHover, setIsHover] = useState(false);

  // Cacher la zone si plus d'emplacements disponibles
  if (remainingSlots <= 0) {
    return null;
  }

  return (
    <label
      className={`${styles.zone} ${isHover ? styles.zoneHover : ""}`}
      onMouseOver={() => setIsHover(true)}
      onMouseOut={() => setIsHover(false)}
    >
      {/* Icône d'upload */}
      <i className={`fas fa-cloud-upload-alt ${styles.icon}`}></i>

      {/* Instructions */}
      <p className={styles.text}>Cliquez pour sélectionner des images</p>
      <p className={styles.helper}>
        PNG, JPG, GIF - Max 10MB par image - {remainingSlots} restante(s)
      </p>

      {/* Input file caché */}
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={onFileChange}
        className={styles.inputHidden}
        disabled={isDisabled}
      />
    </label>
  );
};

export default ImageUploadZone;
