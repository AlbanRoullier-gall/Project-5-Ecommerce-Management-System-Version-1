import React from "react";
import { ProductPublicDTO } from "../../dto";
import { PLACEHOLDER_IMAGE_PATH } from "../shared";

/**
 * URL de l'API depuis les variables d'environnement
 * OBLIGATOIRE : La variable NEXT_PUBLIC_API_URL doit être définie dans .env.local ou .env.production
 *
 * Exemples :
 * - Développement : NEXT_PUBLIC_API_URL=http://localhost:3020
 * - Production : NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
 */
const API_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL n'est pas définie. Veuillez configurer cette variable d'environnement."
    );
  }
  return url;
})();

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
   * État pour gérer l'effet hover sur l'image principale
   */
  const [imageHovered, setImageHovered] = React.useState(false);

  /**
   * Récupère l'URL complète d'une image à partir de son ID
   */
  const getImageUrl = (imageId: number) => {
    const image = product?.images?.find((img) => img.id === imageId);
    if (image) {
      return `${API_URL}/${image.filePath}`;
    }
    return `${API_URL}/api/images/${imageId}`;
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e6eef5",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(16,42,67,0.06)",
        padding: "1rem 1.25rem",
      }}
    >
      {/* Conteneur de l'image principale avec effet hover */}
      <div
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #fbfdfd 100%)",
          borderRadius: "16px",
          overflow: "hidden",
          marginBottom: "1rem",
          boxShadow: imageHovered
            ? "0 20px 60px rgba(19, 104, 106, 0.2)"
            : "0 10px 40px rgba(0, 0, 0, 0.1)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          transform: imageHovered ? "translateY(-4px)" : "translateY(0)",
        }}
        onMouseEnter={() => setImageHovered(true)}
        onMouseLeave={() => setImageHovered(false)}
      >
        {/* Barre décorative en haut lors du hover */}
        {imageHovered && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: "linear-gradient(90deg, #13686a 0%, #0dd3d1 100%)",
              zIndex: 10,
            }}
          />
        )}
        {/* Image principale - affichée si des images existent */}
        {product.images && product.images.length > 0 ? (
          <img
            className="main-product-image"
            src={getImageUrl(product.images[selectedImageIndex].id)}
            alt={product.name}
            style={{
              width: "100%",
              height: "520px",
              objectFit: "contain",
              backgroundColor: "#fff",
              transition: "transform 0.4s ease",
              transform: imageHovered ? "scale(1.02)" : "scale(1)",
            }}
            onError={(e) => {
              // Si l'image ne charge pas, utiliser le placeholder
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_PATH;
            }}
          />
        ) : (
          // Image placeholder si aucune image n'est disponible
          <img
            className="main-product-image"
            src={PLACEHOLDER_IMAGE_PATH}
            alt="Pas d'image"
            style={{
              width: "100%",
              height: "520px",
              objectFit: "contain",
              backgroundColor: "#fff",
            }}
          />
        )}
      </div>

      {/* Galerie de miniatures - affichée uniquement s'il y a plus d'une image */}
      {product.images && product.images.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            overflowX: "auto",
            padding: "0.25rem 0",
            justifyContent: "center",
          }}
        >
          {product.images.map((image, index) => (
            <button
              key={image.id}
              className="thumbnail-button"
              onClick={() => setSelectedImageIndex(index)}
              style={{
                border: "1px solid #e8edf3",
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
                padding: 0,
                background: "white",
                minWidth: "110px",
                boxShadow:
                  selectedImageIndex === index
                    ? "0 0 0 3px rgba(19,104,106,0.25), 0 4px 12px rgba(19,104,106,0.18)"
                    : "0 2px 8px rgba(0, 0, 0, 0.06)",
                transition: "all 0.3s ease",
                transform:
                  selectedImageIndex === index ? "scale(1.05)" : "scale(1)",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                // Effet hover sur les miniatures non sélectionnées
                if (selectedImageIndex !== index) {
                  e.currentTarget.style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                // Remet l'échelle par défaut si non sélectionnée
                if (selectedImageIndex !== index) {
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              {/* Badge de sélection sur la miniature active */}
              {selectedImageIndex === index && (
                <div
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    background:
                      "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
                    color: "white",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    zIndex: 10,
                  }}
                >
                  <i className="fas fa-check"></i>
                </div>
              )}
              {/* Image miniature */}
              <img
                className="thumbnail-image"
                src={getImageUrl(image.id)}
                alt={`${product.name} - ${index + 1}`}
                style={{
                  width: "110px",
                  height: "110px",
                  objectFit: "cover",
                  display: "block",
                }}
                onError={(e) => {
                  // Si l'image ne charge pas, utiliser le placeholder
                  (e.target as HTMLImageElement).src =
                    PLACEHOLDER_IMAGE_PATH;
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
