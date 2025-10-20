/**
 * Cart Controller - Version simplifiée pour Redis
 * HTTP request handling pour les opérations de panier
 */

import { Request, Response } from "express";
import CartService from "../../services/CartService";
import { CartMapper, ResponseMapper } from "../mapper";
import { CartItemCreateDTO, CartItemUpdateDTO, CartCreateDTO } from "../dto";

export class CartController {
  private cartService: CartService;

  constructor(cartService: CartService) {
    this.cartService = cartService;
  }

  /**
   * Créer un panier
   */
  async createCart(req: Request, res: Response): Promise<void> {
    try {
      const cartData = CartMapper.cartCreateDTOToServiceData(
        req.body as CartCreateDTO
      );
      const cart = await this.cartService.createCart(cartData);
      res.status(201).json(ResponseMapper.cartCreated(cart));
    } catch (error: any) {
      console.error("Create cart error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Récupérer un panier
   */
  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.query;
      if (!sessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("sessionId is required"));
        return;
      }

      const cart = await this.cartService.getCart(sessionId as string);

      if (!cart) {
        res.status(404).json(ResponseMapper.notFoundError("Panier"));
        return;
      }

      res.status(200).json(ResponseMapper.cartRetrieved(cart));
    } catch (error: any) {
      console.error("Get cart error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Ajouter un article au panier
   */
  async addItem(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.query;
      if (!sessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("sessionId is required"));
        return;
      }

      const itemData = CartMapper.cartItemCreateDTOToServiceData(
        req.body as CartItemCreateDTO
      );

      const cart = await this.cartService.addItem(
        sessionId as string,
        itemData
      );

      res.status(200).json(ResponseMapper.itemAdded(cart));
    } catch (error: any) {
      console.error("Add item error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Mettre à jour la quantité d'un article
   */
  async updateItemQuantity(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.query;
      const { productId } = req.params; // Correction: productId vient de req.params, pas req.query
      const { quantity } = req.body as CartItemUpdateDTO;

      if (!sessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("sessionId is required"));
        return;
      }

      if (!productId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("productId is required"));
        return;
      }

      if (quantity === undefined) {
        res
          .status(400)
          .json(ResponseMapper.validationError("quantity is required"));
        return;
      }

      const cart = await this.cartService.updateItemQuantity(
        sessionId as string,
        parseInt(productId),
        quantity
      );

      res.status(200).json(ResponseMapper.itemUpdated(cart));
    } catch (error: any) {
      console.error("Update item quantity error:", error);
      if (error.message.includes("non trouvé")) {
        res.status(404).json(ResponseMapper.notFoundError("Panier"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Supprimer un article du panier
   */
  async removeItem(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.query;
      const { productId } = req.params; // Correction: productId vient de req.params, pas req.query

      if (!sessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("sessionId is required"));
        return;
      }

      if (!productId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("productId is required"));
        return;
      }

      const cart = await this.cartService.removeItem(
        sessionId as string,
        parseInt(productId)
      );

      res.status(200).json(ResponseMapper.itemRemoved(cart));
    } catch (error: any) {
      console.error("Remove item error:", error);
      if (error.message.includes("non trouvé")) {
        res.status(404).json(ResponseMapper.notFoundError("Panier"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Vider le panier
   */
  async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.query;

      if (!sessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("sessionId is required"));
        return;
      }

      const cart = await this.cartService.clearCart(sessionId as string);

      res.status(200).json(ResponseMapper.cartCleared(cart));
    } catch (error: any) {
      console.error("Clear cart error:", error);
      if (error.message.includes("non trouvé")) {
        res.status(404).json(ResponseMapper.notFoundError("Panier"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Valider un panier
   */
  async validateCart(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.query;

      if (!sessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("sessionId is required"));
        return;
      }

      const validation = await this.cartService.validateCart(
        sessionId as string
      );

      res.status(200).json(ResponseMapper.cartValidated(validation));
    } catch (error: any) {
      console.error("Validate cart error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Obtenir les statistiques des paniers
   */
  async getCartStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.cartService.getCartStats();
      res.json(ResponseMapper.cartStats(stats));
    } catch (error: any) {
      console.error("Get cart stats error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Attacher un snapshot de checkout au panier
   */
  async attachCheckoutSnapshot(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.query;
      if (!sessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("sessionId is required"));
        return;
      }
      await this.cartService.attachCheckoutSnapshot(
        sessionId as string,
        req.body
      );
      res.status(204).send();
    } catch (error: any) {
      console.error("Attach checkout snapshot error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Récupérer le snapshot de checkout pour un panier
   */
  async getCheckoutSnapshot(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.query;
      if (!sessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("sessionId is required"));
        return;
      }
      const snapshot = await this.cartService.getCheckoutSnapshot(
        sessionId as string
      );
      if (!snapshot) {
        res.status(404).json(ResponseMapper.notFoundError("Checkout snapshot"));
        return;
      }
      res.status(200).json({ snapshot });
    } catch (error: any) {
      console.error("Get checkout snapshot error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  // REMOVED: any Stripe-specific mapping endpoints. Kept only snapshot attach.
}
