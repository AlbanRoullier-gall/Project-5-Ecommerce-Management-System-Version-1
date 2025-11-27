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
   * Sert le fichier image réel au lieu des métadonnées JSON
   */
  async serveProductImageFile(req: Request, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;
      const image = await this.productService.getImageById(parseInt(imageId));

      if (!image) {
        res.status(404).json(ResponseMapper.notFoundError("Image"));
        return;
      }

      // Construire le chemin complet du fichier
      const path = require("path");
      const fs = require("fs");
      const imagePath = path.join(process.cwd(), image.filePath);

      // Vérifier si le fichier existe
      if (!fs.existsSync(imagePath)) {
        console.error("Image file not found:", imagePath);
        res.status(404).json(ResponseMapper.notFoundError("Image file"));
        return;
      }

      // Déterminer le type MIME à partir de l'extension
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

      // Envoyer le fichier
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache 1 an
      res.sendFile(imagePath);
    } catch (error: any) {
      console.error("Erreur lors du service du fichier image:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
