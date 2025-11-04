/**
 * CartController
 * Gère les routes du panier
 */

import { Request, Response } from "express";
import { proxyRequest } from "../proxy";
import { checkoutSnapshots } from "../handlers/payment-handler";

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

  // ===== ROUTES DE SNAPSHOT CHECKOUT =====

  /**
   * Handler pour sauvegarder un snapshot de checkout
   */
  saveCheckoutSnapshot = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.query;
      if (!sessionId) {
        res.status(400).json({ error: "sessionId is required" });
        return;
      }

      checkoutSnapshots.set(sessionId as string, req.body);
      res.status(204).send();
    } catch (error) {
      console.error("Attach checkout snapshot error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Handler pour récupérer un snapshot de checkout
   */
  getCheckoutSnapshot = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.query;
      if (!sessionId) {
        res.status(400).json({ error: "sessionId is required" });
        return;
      }

      const snapshot = checkoutSnapshots.get(sessionId as string);

      if (!snapshot) {
        res.status(404).json({ error: "Checkout snapshot not found" });
        return;
      }

      res.status(200).json({ snapshot });
    } catch (error) {
      console.error("Get checkout snapshot error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
