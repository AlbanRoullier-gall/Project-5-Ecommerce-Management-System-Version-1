/**
 * ProductImage Controller
 * Product image management endpoints
 *
 * Architecture : Controller pattern
 * - HTTP request handling
 * - Service orchestration
 * - Response formatting
 */

import { Request, Response } from "express";
import ProductService from "../../services/ProductService";
import { ProductMapper, ResponseMapper } from "../mapper";
import { ProductImageCreateDTO, ProductImageUpdateDTO } from "../dto";

export class ProductImageController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  /**
   * Create product image
   */
  async createProductImage(req: Request, res: Response): Promise<void> {
    try {
      const imageData = ProductMapper.productImageCreateDTOToProductImageData(
        req.body as ProductImageCreateDTO
      );
      const image = await this.productService.createImage(imageData);
      res
        .status(201)
        .json(
          ResponseMapper.imageCreated(
            ProductMapper.productImageToPublicDTO(image)
          )
        );
    } catch (error: any) {
      console.error("Create product image error:", error);
      if (error.message === "Product not found") {
        res.status(404).json(ResponseMapper.notFoundError("Product"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Get product image by ID
   */
  async getProductImageById(req: Request, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;
      const image = await this.productService.getImageById(parseInt(imageId));

      if (!image) {
        res.status(404).json(ResponseMapper.notFoundError("Product image"));
        return;
      }

      res.json(
        ResponseMapper.imageRetrieved(
          ProductMapper.productImageToPublicDTO(image)
        )
      );
    } catch (error: any) {
      console.error("Get product image error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Update product image
   */
  async updateProductImage(req: Request, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;
      const imageData = ProductMapper.productImageUpdateDTOToProductImageData(
        req.body as ProductImageUpdateDTO
      );
      const image = await this.productService.updateImage(
        parseInt(imageId),
        imageData
      );

      if (!image) {
        res.status(404).json(ResponseMapper.notFoundError("Product image"));
        return;
      }

      res.json(
        ResponseMapper.imageUpdated(
          ProductMapper.productImageToPublicDTO(image)
        )
      );
    } catch (error: any) {
      console.error("Update product image error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Delete product image
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
      console.error("Delete product image error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * List product images
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
      console.error("List product images error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Serve product image file (public)
   * Serves the actual image file instead of JSON metadata
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
      console.error("Error serving image file:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
