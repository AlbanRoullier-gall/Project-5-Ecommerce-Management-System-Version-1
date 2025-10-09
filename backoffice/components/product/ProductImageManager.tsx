import React, { useState } from "react";
import { ProductPublicDTO, ProductImagePublicDTO } from "../../dto";

interface ProductImageManagerProps {
  product: ProductPublicDTO;
  onClose: () => void;
  onUploadImage: (productId: number, file: File) => void;
  onDeleteImage: (productId: number, imageId: number) => void;
  onUpdateImageOrder: (
    productId: number,
    imageId: number,
    newOrder: number
  ) => void;
  isLoading?: boolean;
}

const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  product,
  onClose,
  onUploadImage,
  onDeleteImage,
  onUpdateImageOrder,
  isLoading = false,
}) => {
  const [draggedImage, setDraggedImage] =
    useState<ProductImagePublicDTO | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner un fichier image");
        return;
      }

      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Le fichier est trop volumineux (max 5MB)");
        return;
      }

      onUploadImage(product.id, file);
      e.target.value = ""; // Reset input
    }
  };

  const handleDragStart = (image: ProductImagePublicDTO) => {
    setDraggedImage(image);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetImage: ProductImagePublicDTO) => {
    if (draggedImage && draggedImage.id !== targetImage.id) {
      onUpdateImageOrder(product.id, draggedImage.id, targetImage.orderIndex);
      onUpdateImageOrder(product.id, targetImage.id, draggedImage.orderIndex);
    }
    setDraggedImage(null);
  };

  const handleDelete = (imageId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
      onDeleteImage(product.id, imageId);
    }
  };

  const images = product.images || [];
  const sortedImages = [...images].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Images - {product.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
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
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Upload area */}
          <div className="mb-6">
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 cursor-pointer transition-colors">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Cliquez pour ajouter une image
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF jusqu'à 5MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
            </label>
          </div>

          {/* Images grid */}
          {sortedImages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="mx-auto h-16 w-16 text-gray-300 mb-4"
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
              <p>Aucune image pour ce produit</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sortedImages.map((image, index) => (
                <div
                  key={image.id}
                  draggable
                  onDragStart={() => handleDragStart(image)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(image)}
                  className="relative group cursor-move bg-gray-100 rounded-lg overflow-hidden"
                >
                  {/* Order badge */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-semibold z-10">
                    #{index + 1}
                  </div>

                  {/* Image */}
                  <div className="aspect-square">
                    <img
                      src={image.filePath}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                    <button
                      onClick={() => handleDelete(image.id)}
                      disabled={isLoading}
                      className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Filename */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white px-2 py-1 text-xs truncate">
                    {image.filename}
                  </div>
                </div>
              ))}
            </div>
          )}

          {sortedImages.length > 0 && (
            <p className="text-xs text-gray-500 mt-4 text-center">
              💡 Glissez-déposez les images pour changer leur ordre
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductImageManager;
