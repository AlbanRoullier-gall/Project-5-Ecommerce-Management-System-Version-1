/**
 * Cart Controller - Version simplifiée pour Redis
 * HTTP request handling pour les opérations de panier
 */

import { Request, Response } from "express";
import CartService from "../../services/CartService";
import { CartMapper, ResponseMapper } from "../mapper";
import { CartItemCreateDTO, CartItemUpdateDTO, CartClearDTO } from "../dto";
import * as DTO from "@tfe/shared-types/cart-service";

export class CartController {
  private cartService: CartService;

  constructor(cartService: CartService) {
    this.cartService = cartService;
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
      const clearData = CartMapper.cartClearDTOToServiceData(
        req.body as CartClearDTO
      );

      const cart = await this.cartService.clearCart(clearData.sessionId);

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
   * Résoudre un cartSessionId et vérifier que le panier existe
   *
   * Vérifie que le cartSessionId fourni correspond à un panier existant.
   */
  async resolveSession(req: Request, res: Response): Promise<void> {
    try {
      const resolveData = req.body as DTO.CartSessionResolveDTO;

      const result = await this.cartService.resolveCartSessionId(
        resolveData.cartSessionId
      );

      if (!result.resolved) {
        res.status(404).json({
          error: "Cart session not found",
          message: "Cart session does not exist",
          cartSessionId: null,
          resolved: false,
        });
        return;
      }

      res.status(200).json({
        success: true,
        cartSessionId: result.cartSessionId,
        resolved: result.resolved,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Resolve session error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Sauvegarder un snapshot checkout
   */
  async saveCheckoutSnapshot(req: Request, res: Response): Promise<void> {
    try {
      const { cartSessionId } = req.params;
      if (!cartSessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("cartSessionId is required"));
        return;
      }

      await this.cartService.saveCheckoutSnapshot(cartSessionId, req.body);

      res.status(204).send();
    } catch (error: any) {
      console.error("Save checkout snapshot error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Récupérer un snapshot checkout
   */
  async getCheckoutSnapshot(req: Request, res: Response): Promise<void> {
    try {
      const { cartSessionId } = req.params;
      if (!cartSessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("cartSessionId is required"));
        return;
      }

      const snapshot = await this.cartService.getCheckoutSnapshot(
        cartSessionId
      );

      if (!snapshot) {
        res.status(404).json(ResponseMapper.notFoundError("Checkout snapshot"));
        return;
      }

      res.status(200).json({
        success: true,
        snapshot,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Get checkout snapshot error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Supprimer un snapshot checkout
   */
  async deleteCheckoutSnapshot(req: Request, res: Response): Promise<void> {
    try {
      const { cartSessionId } = req.params;
      if (!cartSessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("cartSessionId is required"));
        return;
      }

      await this.cartService.deleteCheckoutSnapshot(cartSessionId);

      res.status(204).send();
    } catch (error: any) {
      console.error("Delete checkout snapshot error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Récupérer le panier et le snapshot checkout ensemble
   */
  async getCheckoutData(req: Request, res: Response): Promise<void> {
    try {
      const { cartSessionId } = req.params;
      if (!cartSessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("cartSessionId is required"));
        return;
      }

      const checkoutData = await this.cartService.getCheckoutData(
        cartSessionId
      );

      if (!checkoutData) {
        res.status(404).json({
          error: "Checkout data not found",
          message: "Cart or snapshot not found for this session",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Formater le cart en DTO
      const cartDTO = CartMapper.cartToPublicDTO(checkoutData.cart);

      res.status(200).json({
        success: true,
        cart: cartDTO,
        snapshot: checkoutData.snapshot,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Get checkout data error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Préparer les données de commande à partir du cart et snapshot
   *
   * Retourne les données formatées pour order-service, incluant :
   * - Items avec calculs HT/TTC
   * - Totaux
   * - Informations customer et adresses extraites du snapshot
   */
  async prepareOrderData(req: Request, res: Response): Promise<void> {
    try {
      const { cartSessionId } = req.params;
      if (!cartSessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("cartSessionId is required"));
        return;
      }

      const orderData = await this.cartService.prepareOrderData(cartSessionId);

      if (!orderData) {
        res.status(404).json({
          error: "Order data not found",
          message: "Cart or snapshot not found for this session",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: orderData,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Prepare order data error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
