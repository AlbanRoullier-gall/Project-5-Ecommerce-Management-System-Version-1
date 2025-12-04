/**
 * Utilitaires pour la gestion des images
 * Centralise les transformations d'images (conversion base64, etc.)
 */

import { ProductImageUploadDTO } from "../dto";

/**
 * Convertit un fichier image en base64
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        // Supprimer le préfixe data:image/...;base64,
        const base64 = reader.result.replace(/^data:image\/[a-z]+;base64,/, "");
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convertit un tableau de fichiers en DTOs pour l'upload
 */
export async function filesToUploadDTOs(
  files: File[],
  productId: number
): Promise<ProductImageUploadDTO[]> {
  return Promise.all(
    files.map(async (file, index) => {
      const base64Data = await fileToBase64(file);
      const mimeType = file.type || "image/jpeg";

      return {
        productId: productId,
        filename: file.name,
        base64Data: base64Data,
        mimeType: mimeType,
        orderIndex: index,
      };
    })
  );
}
