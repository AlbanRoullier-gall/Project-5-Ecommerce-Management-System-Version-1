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
          totalAmountHT = Number(totals.totalHT.toFixed(2));
          totalAmountTTC = Number(totals.totalTTC.toFixed(2));
        }
      } catch (e) {
        // En cas d'erreur sur le chargement des articles, on garde les totaux d'origine
      }

      const orderDTO = OrderMapper.orderToPublicDTO(order);
      (orderDTO as any).totalAmountHT = totalAmountHT;
      (orderDTO as any).totalAmountTTC = totalAmountTTC;

      res.json(ResponseMapper.orderRetrieved(orderDTO));
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
  async listOrders(req: Request, res: Response): Promise<void> {
    try {
      const options: Partial<OrderListRequestDTO> = {};

      // Parser et valider page
      if (req.query.page) {
        const page = parseInt(req.query.page as string);
        if (isNaN(page) || page < 1) {
          res
            .status(400)
            .json(ResponseMapper.badRequestError("Invalid page parameter"));
          return;
        }
        options.page = page;
      }

      // Parser et valider limit
      if (req.query.limit) {
        const limit = parseInt(req.query.limit as string);
        if (isNaN(limit) || limit < 1) {
          res
            .status(400)
            .json(ResponseMapper.badRequestError("Invalid limit parameter"));
          return;
        }
        options.limit = limit;
      }

      // Parser et valider search (string)
      if (req.query.search) {
        options.search = req.query.search as string;
      }

      // Parser et valider customerId
      if (req.query.customerId) {
        const customerId = parseInt(req.query.customerId as string);
        if (isNaN(customerId) || customerId < 1) {
          res
            .status(400)
            .json(
              ResponseMapper.badRequestError("Invalid customerId parameter")
            );
          return;
        }
        options.customerId = customerId;
      }

      // Parser et valider year
      if (req.query.year && req.query.year !== "") {
        const year = parseInt(req.query.year as string);
        if (isNaN(year) || year < 1900 || year > 2100) {
          res
            .status(400)
            .json(ResponseMapper.badRequestError("Invalid year parameter"));
          return;
        }
        options.year = year;
      }

      // Parser et valider total
      if (req.query.total && req.query.total !== "") {
        const total = parseFloat(req.query.total as string);
        if (isNaN(total) || total < 0) {
          res
            .status(400)
            .json(ResponseMapper.badRequestError("Invalid total parameter"));
          return;
        }
        options.total = total;
      }

      // Parser et valider date (string)
      if (req.query.date && req.query.date !== "") {
        options.date = req.query.date as string;
      }

      // Parser et valider delivered (boolean)
      if (req.query.delivered !== undefined && req.query.delivered !== "") {
        const deliveredParam = req.query.delivered as string;
        // Accepter "true", "delivered", "1" comme true, sinon false
        options.delivered =
          deliveredParam === "true" ||
          deliveredParam === "delivered" ||
          deliveredParam === "1";
      }

      const result = await this.orderService.listOrders(options);
      // Format standardisé : { data: { orders: [], pagination: {} }, ... }
      res.json(
        ResponseMapper.success(
          {
            orders: result.orders || [],
            pagination: result.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              pages: 0,
              hasMore: false,
            },
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
