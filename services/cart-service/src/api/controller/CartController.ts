/**
 * Cart Controller - Version simplifiée pour Redis
 * HTTP request handling pour les opérations de panier
 */

import { Request, Response } from "express";
import CartService from "../../services/CartService";
import { CartMapper, ResponseMapper } from "../mapper";
import {
  CartItemCreateDTO,
  CartItemUpdateDTO,
  CartClearDTO,
  CartRequestDTO,
} from "../dto";

export class CartController {
  private cartService: CartService;

  constructor(cartService: CartService) {
    this.cartService = cartService;
  }

  /**
   * Helper pour valider cartSessionId depuis req.params
   */
  private validateCartSessionId(
    cartSessionId: string | undefined
  ): string | null {
    if (!cartSessionId) {
      return null;
    }
    return cartSessionId;
  }

  /**
   * Récupérer un panier
   */
  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const cartRequest: CartRequestDTO = {
        sessionId: req.query.sessionId as string,
      };

      if (!cartRequest.sessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("sessionId is required"));
        return;
      }

      const cart = await this.cartService.getCart(cartRequest.sessionId);

      // Si le panier n'existe pas, retourner un panier vide au lieu d'un 404
      // Cela permet au frontend de toujours avoir une structure de panier valide
      if (!cart) {
        // Créer un panier vide pour cette session
        const emptyCart = await this.cartService.getOrCreateCart(
          cartRequest.sessionId
        );
        res.status(200).json(ResponseMapper.cartRetrieved(emptyCart));
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
      const cartRequest: CartRequestDTO = {
        sessionId: req.query.sessionId as string,
      };

      if (!cartRequest.sessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("sessionId is required"));
        return;
      }

      const itemData: CartItemCreateDTO = req.body;
      const cart = await this.cartService.addItem(
        cartRequest.sessionId,
        itemData
      );

      res.status(200).json(ResponseMapper.itemAdded(cart));
    } catch (error: any) {
      console.error("Add item error:", error);
      if (
        error.message.includes("Stock insuffisant") ||
        error.message.includes("plus disponible")
      ) {
        res.status(400).json(ResponseMapper.validationError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Mettre à jour la quantité d'un article
   */
  async updateItemQuantity(req: Request, res: Response): Promise<void> {
    try {
      const cartRequest: CartRequestDTO = {
        sessionId: req.query.sessionId as string,
      };
      const { productId } = req.params;
      const cartItemUpdateDTO: CartItemUpdateDTO = req.body;

      if (!cartRequest.sessionId) {
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

      if (cartItemUpdateDTO.quantity === undefined) {
        res
          .status(400)
          .json(ResponseMapper.validationError("quantity is required"));
        return;
      }

      const cart = await this.cartService.updateItemQuantity(
        cartRequest.sessionId,
        parseInt(productId),
        cartItemUpdateDTO.quantity
      );

      res.status(200).json(ResponseMapper.itemUpdated(cart));
    } catch (error: any) {
      console.error("Update item quantity error:", error);
      if (error.message.includes("non trouvé") || error.message.includes("n'existe pas")) {
        // Si l'article n'existe pas dans le panier, retourner 404 avec un message clair
        res.status(404).json({
          error: "Article non trouvé",
          message: error.message || "L'article n'existe pas dans le panier",
          timestamp: new Date().toISOString(),
          status: 404,
        });
        return;
      }
      if (
        error.message.includes("Stock insuffisant") ||
        error.message.includes("plus disponible")
      ) {
        res.status(400).json(ResponseMapper.validationError(error.message));
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
      const cartRequest: CartRequestDTO = {
        sessionId: req.query.sessionId as string,
      };
      const { productId } = req.params;

      if (!cartRequest.sessionId) {
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
        cartRequest.sessionId,
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
   * Mettre à jour les données checkout
   */
  async updateCheckoutData(req: Request, res: Response): Promise<void> {
    try {
      const cartRequest: CartRequestDTO = {
        sessionId: req.query.sessionId as string,
      };

      if (!cartRequest.sessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("sessionId is required"));
        return;
      }

      const checkoutData = req.body;
      const cart = await this.cartService.updateCheckoutData(
        cartRequest.sessionId,
        checkoutData
      );

      res.status(200).json(ResponseMapper.cartRetrieved(cart));
    } catch (error: any) {
      console.error("Update checkout data error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Récupérer les données checkout
   */
  async getCheckoutData(req: Request, res: Response): Promise<void> {
    try {
      const cartRequest: CartRequestDTO = {
        sessionId: req.query.sessionId as string,
      };

      if (!cartRequest.sessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("sessionId is required"));
        return;
      }

      const checkoutData = await this.cartService.getCheckoutData(
        cartRequest.sessionId
      );

      if (checkoutData === null) {
        res.status(200).json({
          success: true,
          data: null,
          message: "Aucune donnée checkout trouvée",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: checkoutData,
      });
    } catch (error: any) {
      console.error("Get checkout data error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Supprimer les données checkout
   */
  async clearCheckoutData(req: Request, res: Response): Promise<void> {
    try {
      const cartRequest: CartRequestDTO = {
        sessionId: req.query.sessionId as string,
      };

      if (!cartRequest.sessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("sessionId is required"));
        return;
      }

      const cart = await this.cartService.clearCheckoutData(
        cartRequest.sessionId
      );

      res.status(200).json({
        success: true,
        message: "Données checkout supprimées avec succès",
        data: CartMapper.cartToPublicDTO(cart),
      });
    } catch (error: any) {
      console.error("Clear checkout data error:", error);
      if (error.message.includes("non trouvé")) {
        res.status(404).json(ResponseMapper.notFoundError("Panier"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
