/**
 * ProductController
 * Gère les routes des produits
 */

import { Request, Response } from "express";
import { proxyRequest } from "../proxy";
import axios from "axios";
import { SERVICES } from "../../config";

export class ProductController {
  /**
   * Proxy vers le service product
   */
  private async proxyToProduct(req: Request, res: Response): Promise<void> {
    await proxyRequest(req, res, "product");
  }

  // ===== ROUTES PUBLIQUES PROXY =====

  listProducts = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  getProduct = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  listCategories = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  getImage = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  // ===== ROUTES ADMIN PROXY =====

  adminListProducts = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  adminGetProduct = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  adminUpdateProduct = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  adminDeleteProduct = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  adminCreateProduct = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  adminListCategories = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  adminGetCategory = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  adminUpdateCategory = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  adminDeleteCategory = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  activateProduct = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  deactivateProduct = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  createProductWithImages = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  uploadProductImages = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  listProductImages = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  deleteProductImage = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToProduct(req, res);
  };

  // ===== ROUTE STATIQUE =====

  /**
   * Handler pour servir les images statiques via proxy
   * Gère spécifiquement les images avec headers de cache optimisés
   */
  serveStaticImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const imagePath = req.path;
      const imageUrl = `${SERVICES.product}${imagePath}`;

      console.log(`🖼️  Image request: ${req.path} -> ${imageUrl}`);

      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        validateStatus: () => true,
      });

      if (response.status !== 200) {
        console.error(`❌ Image not found: ${imageUrl} (${response.status})`);
        res.status(404).json({ error: "Image non trouvée" });
        return;
      }

      // Headers spécifiques aux images statiques
      if (response.headers["content-type"]) {
        res.set("Content-Type", response.headers["content-type"]);
      }
      res.set("Cache-Control", "public, max-age=31536000");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");

      res.status(response.status).send(response.data);
    } catch (error: any) {
      console.error("Erreur chargement image:", error.message || error);
      res.status(404).json({ error: "Image non trouvée" });
    }
  };
}
