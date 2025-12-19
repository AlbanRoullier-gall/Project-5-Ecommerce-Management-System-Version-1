/**
 * Contrôleur Image de Produit
 * Points de terminaison de gestion des images de produit
 *
 * Architecture : Pattern Contrôleur
 * - Gestion des requêtes HTTP
 * - Orchestration des services
 * - Formatage des réponses
 */

import { Request, Response } from "express";
import ProductService from "../../services/ProductService";
import { ProductMapper, ResponseMapper } from "../mapper";

export class ProductImageController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  // (Handlers admin pour récupérer/mettre à jour une image supprimés)

  /**
   * Supprimer une image de produit
   */
  async deleteProductImage(req: Request, res: Response): Promise<void> {
    try {
      const { id, imageId } = req.params;
      const success = await this.productService.deleteImage(
        parseInt(id),
        parseInt(imageId)
      );

      if (!success) {
        res.status(404).json(ResponseMapper.notFoundError("Product image"));
        return;
      }

      res.json(ResponseMapper.imageDeleted());
    } catch (error: any) {
      console.error(
        "Erreur lors de la suppression de l'image de produit:",
        error
      );
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Lister les images de produit
   */
  async listProductImages(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const images = await this.productService.listImages(parseInt(id));
      const imagesDTO = images.map((image) =>
        ProductMapper.productImageToPublicDTO(image)
      );
      res.json(ResponseMapper.imageListed(imagesDTO));
    } catch (error: any) {
      console.error("Erreur lors de la liste des images de produit:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Servir le fichier image de produit (public)
   * Sert l'image depuis la base de données (image_data)
   */
  async serveProductImageFile(req: Request, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;
      // Récupérer l'image avec les données binaires
      const image = await this.productService.getImageById(
        parseInt(imageId),
        true
      );

      if (!image) {
        res.status(404).json(ResponseMapper.notFoundError("Image"));
        return;
      }

      // Vérifier que l'image a des données binaires
      if (!image.imageData || image.imageData.length === 0) {
        console.error("Image data not found for image:", imageId);
        res.status(404).json(ResponseMapper.notFoundError("Image data"));
        return;
      }

      // Déterminer le type MIME à partir de l'extension
      const path = require("path");
      const ext = path.extname(image.filename).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
      };
      const mimeType = mimeTypes[ext] || "application/octet-stream";

      // Envoyer les données binaires depuis la base
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache 1 an
      res.send(image.imageData);
    } catch (error: any) {
      console.error("Erreur lors du service du fichier image:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
