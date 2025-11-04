/**
 * ProductController
 * Gère les routes des produits
 */

import { Request, Response } from "express";
import { proxyRequest } from "../../core/proxy";
import axios from "axios";
import { SERVICES } from "../../config";

export class ProductController {
  /**
   * Proxy vers le service product
   */
  private async proxyToProduct(req: Request, res: Response): Promise<void> {
    await proxyRequest(req, res, "product");
  }

  /**
   * Wrapper pour les handlers
   */
  private wrapHandler(handler: (req: Request, res: Response) => Promise<void>) {
    return async (req: Request, res: Response): Promise<void> => {
      await handler(req, res);
    };
  }

  // ===== ROUTES PUBLIQUES PROXY =====

  listProducts = this.wrapHandler(this.proxyToProduct);
  getProduct = this.wrapHandler(this.proxyToProduct);
  listCategories = this.wrapHandler(this.proxyToProduct);
  getImage = this.wrapHandler(this.proxyToProduct);

  // ===== ROUTES ADMIN PROXY =====

  adminListProducts = this.wrapHandler(this.proxyToProduct);
  adminGetProduct = this.wrapHandler(this.proxyToProduct);
  adminUpdateProduct = this.wrapHandler(this.proxyToProduct);
  adminDeleteProduct = this.wrapHandler(this.proxyToProduct);
  adminCreateProduct = this.wrapHandler(this.proxyToProduct);
  adminListCategories = this.wrapHandler(this.proxyToProduct);
  adminGetCategory = this.wrapHandler(this.proxyToProduct);
  adminUpdateCategory = this.wrapHandler(this.proxyToProduct);
  adminDeleteCategory = this.wrapHandler(this.proxyToProduct);
  activateProduct = this.wrapHandler(this.proxyToProduct);
  deactivateProduct = this.wrapHandler(this.proxyToProduct);
  createProductWithImages = this.wrapHandler(this.proxyToProduct);
  uploadProductImages = this.wrapHandler(this.proxyToProduct);
  listProductImages = this.wrapHandler(this.proxyToProduct);
  deleteProductImage = this.wrapHandler(this.proxyToProduct);

  // ===== ROUTE STATIQUE =====

  /**
   * Handler pour servir les images statiques via proxy
   */
  serveStaticImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const imagePath = req.path;
      const imageUrl = `${SERVICES.product}${imagePath}`;

      console.log(`🖼️  Image request: ${req.path} -> ${imageUrl}`);

      const response = await axios.get(imageUrl, {
        responseType: "stream",
        validateStatus: () => true,
      });

      if (response.status !== 200) {
        console.error(`❌ Image not found: ${imageUrl} (${response.status})`);
        res.status(404).json({ error: "Image non trouvée" });
        return;
      }

      if (response.headers["content-type"]) {
        res.set("Content-Type", response.headers["content-type"]);
      }
      res.set("Cache-Control", "public, max-age=31536000");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");

      response.data.pipe(res);
    } catch (error: any) {
      console.error("Erreur chargement image:", error.message || error);
      res.status(404).json({ error: "Image non trouvée" });
    }
  };
}
