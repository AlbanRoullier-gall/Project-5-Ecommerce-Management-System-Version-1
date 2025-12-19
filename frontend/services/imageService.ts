import { apiClient } from "./apiClient";

/**
 * Service pour gérer les URLs d'images
 * Centralise la logique de construction des URLs d'images
 * Les images sont maintenant stockées en base de données, donc on utilise uniquement l'ID
 */
class ImageService {
  /**
   * Construit une URL d'image à partir d'un ID d'image
   * @param imageId - ID de l'image
   * @returns URL complète de l'image
   */
  getImageUrlById(imageId: number): string {
    return apiClient.getImageUrl(`/api/images/${imageId}`);
  }

  /**
   * Construit une URL d'image à partir d'un objet image
   * @param image - Objet image avec id
   * @returns URL complète de l'image
   */
  getImageUrlFromImage(image: { id: number }): string {
    return this.getImageUrlById(image.id);
  }
}

// Instance singleton
export const imageService = new ImageService();
