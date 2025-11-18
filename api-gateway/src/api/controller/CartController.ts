/**
 * CartController
 * Gère les routes du panier
 */

import { Request, Response } from "express";
import { proxyRequest } from "../proxy";

export class CartController {
  /**
   * Proxy vers le service cart
   */
  private async proxyToCart(req: Request, res: Response): Promise<void> {
    await proxyRequest(req, res, "cart");
  }

  // ===== ROUTES PUBLIQUES PROXY =====

  getCart = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCart(req, res);
  };

  updateCart = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCart(req, res);
  };

  addItem = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCart(req, res);
  };

  updateItem = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCart(req, res);
  };

  removeItem = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCart(req, res);
  };

  clearCart = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCart(req, res);
  };
}
