import React from "react";
import { ProductPublicDTO } from "../../../dto";
import { PLACEHOLDER_IMAGE_PATH } from "../../shared";
import { imageService } from "../../../services/imageService";
import { useHover } from "../../../hooks";
import styles from "../../../styles/components/ImageGallery.module.css";

/**
 * Props du composant ImageGallery
 */
interface ImageGalleryProps {
  /** Produit dont on affiche les images */
  product: ProductPublicDTO;
  /** Index de l'image actuellement sélectionnée */
  selectedImageIndex: number;
  /** Callback appelé quand une nouvelle image est sélectionnée */
  setSelectedImageIndex: (index: number) => void;
}

/**
 * Composant galerie d'images pour un produit
 * Affiche une image principale et des miniatures cliquables
 *
 * @example
 * <ImageGallery
 *   product={product}
 *   selectedImageIndex={0}
 *   setSelectedImageIndex={setSelectedImageIndex}
 * />
 */
const ImageGallery: React.FC<ImageGalleryProps> = ({
  product,
  selectedImageIndex,
  setSelectedImageIndex,
}) => {
  /**
   * Hook pour gérer l'effet hover sur l'image principale
   */
  const { isHovered: imageHovered, hoverProps } = useHover();

  /**
   * Récupère l'URL complète d'une image à partir de son ID
   */
  const getImageUrl = (imageId: number) => {
    const image = product?.images?.find(
      (img: { id: number }) => img.id === imageId
    );
    if (image) {
      return imageService.getImageUrlFromImage(image);
    }
    return imageService.getImageUrlById(imageId);
  };

  return (
    <div className={styles.container}>
      {/* Conteneur de l'image principale avec effet hover */}
      <div
        className={`${styles.mainWrapper} ${
          imageHovered ? styles.mainHovered : ""
        }`}
        {...hoverProps}
      >
        {/* Barre décorative en haut lors du hover */}
        {imageHovered && <div className={styles.hoverBar} />}
        {/* Image principale - affichée si des images existent */}
        {product.images && product.images.length > 0 ? (
          <img
            className={`${styles.mainImage} ${
              imageHovered ? styles.mainImageHovered : ""
            }`}
            src={getImageUrl(product.images[selectedImageIndex].id)}
            alt={product.name}
            onError={(e) => {
              // Si l'image ne charge pas, utiliser le placeholder
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_PATH;
            }}
          />
        ) : (
          // Image placeholder si aucune image n'est disponible
          <img
            className={styles.mainImage}
            src={PLACEHOLDER_IMAGE_PATH}
            alt="Pas d'image"
          />
        )}
      </div>

      {/* Galerie de miniatures - affichée uniquement s'il y a plus d'une image */}
      {product.images && product.images.length > 1 && (
        <div className={styles.thumbList}>
          {product.images.map((image: { id: number }, index: number) => (
            <button
              key={image.id}
              className={`${styles.thumbButton} ${
                selectedImageIndex === index ? styles.thumbSelected : ""
              }`}
              onClick={() => setSelectedImageIndex(index)}
              type="button"
            >
              {/* Badge de sélection sur la miniature active */}
              {selectedImageIndex === index && (
                <div className={styles.selectedBadge}>
                  <i className="fas fa-check"></i>
                </div>
              )}
              {/* Image miniature */}
              <img
                className={styles.thumbImage}
                src={getImageUrl(image.id)}
                alt={`${product.name} - ${index + 1}`}
                onError={(e) => {
                  // Si l'image ne charge pas, utiliser le placeholder
                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_PATH;
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
