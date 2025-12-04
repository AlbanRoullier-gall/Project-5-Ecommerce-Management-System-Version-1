import { apiClient } from "./apiClient";

/**
 * Service pour gérer les URLs d'images
 * Centralise la logique de construction des URLs d'images
 */
class ImageService {
  /**
   * Construit une URL d'image complète à partir d'un filePath
   * @param filePath - Chemin de l'image (relatif ou absolu)
   * @returns URL complète de l'image
   */
  getImageUrl(filePath: string): string {
    return apiClient.getImageUrl(filePath);
  }

  /**
   * Construit une URL d'image à partir d'un ID d'image
   * @param imageId - ID de l'image
   * @returns URL complète de l'image
   */
  getImageUrlById(imageId: number): string {
    return apiClient.getImageUrl(`/api/images/${imageId}`);
  }
}

// Instance singleton
export const imageService = new ImageService();
