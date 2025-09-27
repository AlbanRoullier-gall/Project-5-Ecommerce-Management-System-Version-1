"use client";

import React, { useState, useRef } from "react";

interface ImageUploadProps {
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  existingImages?: Array<{
    id: number;
    filename: string;
    altText?: string;
  }>;
  onDeleteExisting?: (imageId: number) => void;
  disabled?: boolean;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  maxImages = 3,
  existingImages = [],
  onDeleteExisting,
  disabled = false,
  className = "",
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || disabled) return;

    const newImages: File[] = [];
    const newPreviews: string[] = [];

    // Validation et ajout des nouveaux fichiers
    Array.from(files).forEach((file) => {
      // Validation du type
      if (!file.type.startsWith("image/")) {
        alert("Seuls les fichiers image sont autorisés");
        return;
      }

      // Validation de la taille (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
        return;
      }

      // Vérification de la limite
      if (selectedImages.length + newImages.length >= maxImages) {
        alert(`Maximum ${maxImages} images autorisées`);
        return;
      }

      newImages.push(file);

      // Création de l'aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === newImages.length) {
          setPreviews([...previews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    const updatedImages = [...selectedImages, ...newImages];
    setSelectedImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setSelectedImages(newImages);
    setPreviews(newPreviews);
    onImagesChange(newImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const remainingSlots =
    maxImages - (existingImages.length + selectedImages.length);
  const canUpload = remainingSlots > 0 && !disabled;

  return (
    <div className={`image-upload-container ${className}`}>
      <label className="form-label block text-sm font-medium text-gray-700 mb-2">
        Images du produit (max {maxImages})
      </label>

      {/* Zone d'upload */}
      {canUpload && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-teal-400 bg-teal-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <div className="space-y-2">
            <div className="text-4xl">📷</div>
            <p className="text-gray-600">
              Cliquez ou glissez-déposez vos images ici
            </p>
            <p className="text-sm text-gray-500">
              Formats acceptés: JPG, PNG, GIF (max 10MB par image)
            </p>
            <p className="text-xs text-gray-400">
              {remainingSlots} emplacement{remainingSlots > 1 ? "s" : ""}{" "}
              restant{remainingSlots > 1 ? "s" : ""}
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
        disabled={disabled}
      />

      {/* Images existantes */}
      {existingImages.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Images actuelles
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {existingImages.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={`/uploads/products/${image.filename}`}
                  alt={image.altText || "Image produit"}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = "/images/default-product.svg";
                  }}
                />
                {onDeleteExisting && (
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    onClick={() => onDeleteExisting(image.id)}
                    title="Supprimer cette image"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aperçus des nouvelles images */}
      {previews.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Nouvelles images
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                  title="Supprimer cette image"
                >
                  ✕
                </button>
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {selectedImages[index]?.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
