import React, { useState, useRef } from "react";
import { ProductImageData } from "../../../shared-types";

interface ImageUploadProps {
  productId: number;
  images: ProductImageData[];
  onImageUpload: (
    productId: number,
    file: File,
    altText?: string,
    description?: string,
    orderIndex?: number
  ) => Promise<void>;
  onImageDelete: (productId: number, imageId: number) => Promise<void>;
  maxImages?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  productId,
  images,
  onImageUpload,
  onImageDelete,
  maxImages = 3,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      alert(`Vous ne pouvez ajouter que ${maxImages} images maximum.`);
      return;
    }

    setIsUploading(true);

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];

        // Validation du type de fichier
        if (!file.type.startsWith("image/")) {
          alert(`Le fichier ${file.name} n'est pas une image valide.`);
          continue;
        }

        // Validation de la taille (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          alert(`Le fichier ${file.name} est trop volumineux (max 10MB).`);
          continue;
        }

        await onImageUpload(productId!, file, "", "", images.length + i);
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      alert("Erreur lors de l'upload des images.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteImage = async (imageId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
      try {
        await onImageDelete(productId!, imageId);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression de l'image.");
      }
    }
  };

  const remainingSlots = maxImages - images.length;
  const canUpload = remainingSlots > 0 && !isUploading;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Images du produit</h3>
        <span className="text-sm text-gray-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Zone d'upload */}
      {canUpload && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Cliquez pour télécharger
              </span>{" "}
              ou glissez-déposez vos images ici
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF jusqu'à 10MB (max {remainingSlots} image
              {remainingSlots > 1 ? "s" : ""})
            </p>
          </div>
        </div>
      )}

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Indicateur de chargement */}
      {isUploading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Upload en cours...</span>
        </div>
      )}

      {/* Grille des images */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={`/api/products/${productId!}/images/${image.filename}`}
                  alt={image.altText || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/images/default-product.svg";
                  }}
                />
              </div>

              {/* Bouton de suppression */}
              <button
                onClick={() => handleDeleteImage(image.id!)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Supprimer l'image"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Informations de l'image */}
              <div className="mt-2 text-xs text-gray-500">
                <p className="truncate">{image.filename}</p>
                <p>{Math.round(image.fileSize / 1024)} KB</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message si aucune image */}
      {images.length === 0 && !isUploading && (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2">Aucune image pour ce produit</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
