/**
 * Contrôleur des Commandes
 * Gestion des requêtes HTTP pour les opérations de commandes
 *
 * Architecture : Pattern Contrôleur
 * - Gestion des requêtes/réponses HTTP
 * - Orchestration des services
 * - Conversion des DTO
 */

import { Request, Response } from "express";
import Joi from "joi";
import OrderService from "../../services/OrderService";
import { OrderMapper, ResponseMapper } from "../mapper";
import Order from "../../models/Order";
import {
  OrderListRequestDTO,
  OrderUpdateDeliveryStatusDTO,
  OrderUpdateCreditNoteStatusDTO,
} from "../dto";

export class OrderController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  /**
   * Obtenir une commande par son ID
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(parseInt(id!));

      if (!order) {
        res.status(404).json(ResponseMapper.notFoundError("Order"));
        return;
      }

      // Recalculer les totaux à partir des articles pour garantir la cohérence
      let totalAmountHT = order.totalAmountHT;
      let totalAmountTTC = order.totalAmountTTC;
      try {
        const items = await this.orderService.getOrderItemsByOrderId(
          parseInt(id!)
        );
        if (Array.isArray(items) && items.length > 0) {
          const totals = Order.calculateTotalsFromItems(items);
          totalAmountHT = parseFloat(totals.totalHT.toFixed(2));
          totalAmountTTC = parseFloat(totals.totalTTC.toFixed(2));
        }
      } catch (e) {
        // En cas d'erreur sur le chargement des articles, on garde les totaux d'origine
        console.error("Error calculating totals from items:", e);
      }

      // Utiliser les totaux calculés si disponibles, sinon ceux de la commande
      const finalTotalAmountHT = totalAmountHT !== undefined ? totalAmountHT : order.totalAmountHT;
      const finalTotalAmountTTC = totalAmountTTC !== undefined ? totalAmountTTC : order.totalAmountTTC;

      const orderDTO = OrderMapper.orderToPublicDTO({
        ...order,
        totalAmountHT: finalTotalAmountHT,
        totalAmountTTC: finalTotalAmountTTC,
      });

      // Format standardisé : { data: { order }, ... }
      res.json(
        ResponseMapper.success(
          { order: orderDTO },
          "Order retrieved successfully"
        )
      );
    } catch (error: any) {
      console.error("Get order error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Supprimer une commande
   */
  async deleteOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.orderService.deleteOrder(parseInt(id!));

      if (!success) {
        res.status(404).json(ResponseMapper.notFoundError("Order"));
        return;
      }

      res.json(ResponseMapper.orderDeleted());
    } catch (error: any) {
      console.error("Delete order error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Lister les commandes avec pagination
   * Parse et valide les query params côté serveur
   */
  /**
   * Lister les commandes
   */
  async listOrders(req: Request, res: Response): Promise<void> {
    try {
      // Schéma de validation Joi pour les query params
      const orderListQuerySchema = Joi.object({
        search: Joi.string().max(255).optional().allow(""),
        customerId: Joi.number().integer().positive().optional(),
        year: Joi.number().integer().min(1900).max(2100).optional(),
        total: Joi.number().min(0).optional(),
        date: Joi.string().optional().allow(""),
        delivered: Joi.string()
          .valid("true", "false", "delivered", "1", "0", "")
          .optional(),
      }).unknown(true);

      // Valider les query params
      const { error, value } = orderListQuerySchema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const messages = error.details
          .map((detail) => detail.message)
          .join("; ");
        res
          .status(400)
          .json(
            ResponseMapper.validationError(
              `Paramètres de recherche invalides: ${messages}`
            )
          );
        return;
      }

      // Construire le DTO à partir des valeurs validées
      const options: OrderListRequestDTO = {
        ...(value.search && { search: value.search }),
        ...(value.customerId && { customerId: value.customerId }),
        ...(value.year && { year: value.year }),
        ...(value.total !== undefined && { total: value.total }),
        ...(value.date && { date: value.date }),
        ...(value.delivered !== undefined &&
          value.delivered !== "" && {
            delivered:
              value.delivered === "true" ||
              value.delivered === "delivered" ||
              value.delivered === "1",
          }),
      };

      const orders = await this.orderService.listOrders(options);
      // Format standardisé : { data: { orders: [] }, ... }
      res.json(
        ResponseMapper.success(
          {
            orders: orders || [],
          },
          "Liste des commandes récupérée avec succès"
        )
      );
    } catch (error: any) {
      console.error("List orders error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Mettre à jour le statut de livraison d'une commande
   */
  async updateDeliveryStatus(req: Request, res: Response): Promise<void> {
    try {
      const orderId = parseInt(req.params.id);
      const updateDTO: OrderUpdateDeliveryStatusDTO = req.body;

      if (typeof updateDTO.delivered !== "boolean") {
        res
          .status(400)
          .json(ResponseMapper.badRequestError("delivered must be a boolean"));
        return;
      }

      const order = await this.orderService.updateDeliveryStatus(
        orderId,
        updateDTO.delivered
      );

      if (!order) {
        res.status(404).json(ResponseMapper.notFoundError("Order"));
        return;
      }

      const orderDTO = OrderMapper.orderToPublicDTO(order);
      res.json(ResponseMapper.success(orderDTO));
    } catch (error: any) {
      console.error("Update delivery status error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Mettre à jour le statut d'un avoir
   */
  async updateCreditNoteStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateDTO: OrderUpdateCreditNoteStatusDTO = req.body;

      if (
        !updateDTO.status ||
        !["pending", "refunded"].includes(updateDTO.status)
      ) {
        res.status(400).json({
          success: false,
          error: "Statut invalide. Doit être 'pending' ou 'refunded'",
        });
        return;
      }

      const creditNote = await this.orderService.updateCreditNoteStatus(
        parseInt(id),
        updateDTO.status
      );

      res.json({
        success: true,
        message: `Statut de l'avoir mis à jour vers ${updateDTO.status}`,
        data: OrderMapper.creditNoteToPublicDTO(creditNote),
      });
    } catch (error: any) {
      console.error("Update credit note status error:", error);
      res.status(500).json({
        success: false,
        error: "Erreur lors de la mise à jour du statut de l'avoir",
      });
    }
  }

  /**
   * Obtenir les données d'export d'une année (commandes et avoirs)
   */
  async getYearExportData(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.params.year);

      if (isNaN(year) || year < 2025) {
        res.status(400).json({
          success: false,
          error: "Année invalide. L'année doit être >= 2025",
        });
        return;
      }

      const data = await this.orderService.getYearExportData(year);

      res.json({
        success: true,
        year,
        data,
      });
    } catch (error: any) {
      console.error("Get year export data error:", error);
      res.status(500).json({
        success: false,
        error: "Erreur lors de la récupération des données d'export",
      });
    }
  }

  /**
   * Créer une commande depuis un panier avec checkoutData
   * Accepte le panier avec checkoutData et construit le payload en interne
   */
  async createOrderFromCart(req: Request, res: Response): Promise<void> {
    try {
      const order = await this.orderService.createOrderFromCart(req.body);
      const orderDTO = OrderMapper.orderToPublicDTO(order);

      res.status(201).json(ResponseMapper.orderCreated(orderDTO));
    } catch (error: any) {
      console.error("Create order from cart error:", error);
      if (
        error.message.includes("vide") ||
        error.message.includes("obligatoires")
      ) {
        res.status(400).json(ResponseMapper.validationError(error.message));
        return;
      }
      if (error.message.includes("already exists")) {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
