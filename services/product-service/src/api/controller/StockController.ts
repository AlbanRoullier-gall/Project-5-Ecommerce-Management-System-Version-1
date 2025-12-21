/**
 * Contrôleur Stock
 * Points de terminaison pour la gestion des réservations de stock
 *
 * Architecture : Pattern Contrôleur
 * - Gestion des requêtes HTTP
 * - Orchestration des services
 * - Formatage des réponses
 */

import { Request, Response } from "express";
import ProductService from "../../services/ProductService";
import { ResponseMapper } from "../mapper";

export class StockController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  /**
   * Réserver du stock pour un panier
   * POST /api/stock/reserve
   * Body: { productId, quantity, sessionId, ttlMinutes? }
   */
  async reserveStock(req: Request, res: Response): Promise<void> {
    try {
      const { productId, quantity, sessionId, ttlMinutes } = req.body;

      if (!productId || !quantity || !sessionId) {
        res
          .status(400)
          .json(
            ResponseMapper.validationError(
              "productId, quantity et sessionId sont requis"
            )
          );
        return;
      }

      if (quantity <= 0) {
        res
          .status(400)
          .json(ResponseMapper.validationError("quantity doit être positif"));
        return;
      }

      const reservation = await this.productService.reserveStock(
        parseInt(productId),
        parseInt(quantity),
        sessionId,
        ttlMinutes ? parseInt(ttlMinutes) : 30
      );

      res.status(200).json(
        ResponseMapper.successWithData(
          {
            reservation: {
              id: reservation.reservationId,
              productId: reservation.productId,
              quantity: reservation.quantity,
              expiresAt: reservation.expiresAt,
              availableStock: reservation.availableStock,
            },
          },
          "Stock réservé avec succès"
        )
      );
    } catch (error: any) {
      console.error("Erreur lors de la réservation de stock:", error);
      if (
        error.message.includes("Stock insuffisant") ||
        error.message.includes("non trouvé") ||
        error.message.includes("plus disponible")
      ) {
        res.status(400).json(ResponseMapper.badRequestError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Libérer une réservation de stock
   * POST /api/stock/release
   * Body: { sessionId, productId? }
   */
  async releaseStock(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, productId } = req.body;

      if (!sessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("sessionId est requis"));
        return;
      }

      const releasedCount = await this.productService.releaseStockReservation(
        sessionId,
        productId ? parseInt(productId) : undefined
      );

      res
        .status(200)
        .json(
          ResponseMapper.successWithData(
            { releasedCount },
            `${releasedCount} réservation(s) libérée(s)`
          )
        );
    } catch (error: any) {
      console.error("Erreur lors de la libération du stock:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Confirmer les réservations (lors du checkout)
   * POST /api/stock/confirm
   * Body: { sessionId }
   */
  async confirmReservations(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("sessionId est requis"));
        return;
      }

      const confirmedCount = await this.productService.confirmStockReservations(
        sessionId
      );

      res
        .status(200)
        .json(
          ResponseMapper.successWithData(
            { confirmedCount },
            `${confirmedCount} réservation(s) confirmée(s)`
          )
        );
    } catch (error: any) {
      console.error("Erreur lors de la confirmation des réservations:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Obtenir le stock disponible
   * GET /api/stock/available/:productId
   */
  async getAvailableStock(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;

      if (!productId) {
        res
          .status(400)
          .json(ResponseMapper.validationError("productId est requis"));
        return;
      }

      const availableStock = await this.productService.getAvailableStock(
        parseInt(productId)
      );

      res.status(200).json(
        ResponseMapper.successWithData(
          {
            productId: parseInt(productId),
            availableStock,
          },
          "Stock disponible récupéré"
        )
      );
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération du stock disponible:",
        error
      );
      if (error.message.includes("non trouvé")) {
        res.status(404).json(ResponseMapper.notFoundError("Product"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Mettre à jour la quantité d'une réservation
   * PUT /api/stock/reservation
   * Body: { sessionId, productId, quantity }
   */
  async updateReservation(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, productId, quantity } = req.body;

      if (!sessionId || !productId || quantity === undefined) {
        res
          .status(400)
          .json(
            ResponseMapper.validationError(
              "sessionId, productId et quantity sont requis"
            )
          );
        return;
      }

      if (quantity < 0) {
        res
          .status(400)
          .json(
            ResponseMapper.validationError("quantity doit être positif ou zéro")
          );
        return;
      }

      // Si quantity est 0, libérer la réservation
      if (quantity === 0) {
        const releasedCount = await this.productService.releaseStockReservation(
          sessionId,
          parseInt(productId)
        );
        res
          .status(200)
          .json(
            ResponseMapper.successWithData(
              { releasedCount },
              "Réservation libérée"
            )
          );
        return;
      }

      const reservation = await this.productService.updateReservationQuantity(
        sessionId,
        parseInt(productId),
        parseInt(quantity)
      );

      if (!reservation) {
        res
          .status(404)
          .json(ResponseMapper.notFoundError("Réservation non trouvée"));
        return;
      }

      res.status(200).json(
        ResponseMapper.successWithData(
          {
            reservation: {
              id: reservation.reservationId,
              productId: reservation.productId,
              quantity: reservation.quantity,
              availableStock: reservation.availableStock,
            },
          },
          "Réservation mise à jour"
        )
      );
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de la réservation:", error);
      if (error.message.includes("Stock insuffisant")) {
        res.status(400).json(ResponseMapper.badRequestError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
