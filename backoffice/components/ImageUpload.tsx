"use client";

import React, { useState, useRef } from "react";

interface ImageUploadProps {
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  existingImages?: string[];
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  maxImages = 3,
  existingImages = [],
  disabled = false,
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newImages: File[] = [];
    const newPreviews: string[] = [];

    // Convert FileList to Array and validate
    Array.from(files).forEach((file) => {
      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Seuls les fichiers image sont autorisés");
        return;
      }

      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
        return;
      }

      // Check if we haven't reached the limit
      if (selectedImages.length + newImages.length >= maxImages) {
        alert(`Maximum ${maxImages} images autorisées`);
        return;
      }

      newImages.push(file);

      // Create preview
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
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="image-upload-container">
      <label className="form-label">Images du produit (max {maxImages})</label>

      {/* Upload Area */}
      <div
        className={`image-upload-area ${disabled ? "disabled" : ""}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: "none" }}
          disabled={disabled}
        />

        <div className="upload-content">
          <div className="upload-icon">📷</div>
          <p className="upload-text">
            Cliquez ou glissez-déposez vos images ici
          </p>
          <p className="upload-hint">
            Formats acceptés: JPG, PNG, GIF (max 10MB par image)
          </p>
        </div>
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="image-previews">
          <h4>Images sélectionnées:</h4>
          <div className="preview-grid">
            {previews.map((preview, index) => (
              <div key={index} className="image-preview-item">
                <img src={preview} alt={`Preview ${index + 1}`} />
                <div className="image-info">
                  <span className="image-name">
                    {selectedImages[index]?.name}
                  </span>
                  <span className="image-size">
                    {Math.round((selectedImages[index]?.size || 0) / 1024)} KB
                  </span>
                </div>
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Images Display */}
      {existingImages.length > 0 && (
        <div className="existing-images">
          <h4>Images existantes:</h4>
          <div className="existing-images-grid">
            {existingImages.map((image, index) => (
              <div key={index} className="existing-image-item">
                <img src={image} alt={`Existing ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .image-upload-container {
          margin-bottom: 1rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .image-upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: #f9fafb;
        }

        .image-upload-area:hover:not(.disabled) {
          border-color: #3b82f6;
          background-color: #eff6ff;
        }

        .image-upload-area.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .upload-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .upload-text {
          font-size: 1.1rem;
          color: #374151;
          margin: 0;
        }

        .upload-hint {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .image-previews,
        .existing-images {
          margin-top: 1rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background-color: #ffffff;
        }

        .image-previews h4,
        .existing-images h4 {
          margin: 0 0 1rem 0;
          color: #374151;
          font-size: 1rem;
        }

        .preview-grid,
        .existing-images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }

        .image-preview-item,
        .existing-image-item {
          position: relative;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          background-color: #f9fafb;
        }

        .image-preview-item img,
        .existing-image-item img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          display: block;
        }

        .image-info {
          padding: 0.5rem;
          background-color: #ffffff;
        }

        .image-name {
          display: block;
          font-size: 0.75rem;
          color: #374151;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .image-size {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .remove-image-btn {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 50%;
          background-color: #ef4444;
          color: white;
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }

        .remove-image-btn:hover:not(:disabled) {
          background-color: #dc2626;
        }

        .remove-image-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .preview-grid,
          .existing-images-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;
