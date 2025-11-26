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
import { OrderCreateDTO, OrderUpdateDTO, OrderCompleteDTO } from "../dto";
import { OrderMapper, ResponseMapper } from "../mapper";

export class OrderController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  /**
   * Créer une nouvelle commande
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderCreateDTO: OrderCreateDTO = req.body;

      // Convertir le DTO en OrderData
      const orderData = OrderMapper.orderCreateDTOToOrderData(orderCreateDTO);
      if ((orderCreateDTO as any).paymentIntentId) {
        (orderData as any).payment_intent_id = (
          orderCreateDTO as any
        ).paymentIntentId;
      }

      const order = await this.orderService.createOrder(orderData);
      const orderDTO = OrderMapper.orderToPublicDTO(order);

      res.status(201).json(ResponseMapper.orderCreated(orderDTO));
    } catch (error: any) {
      console.error("Create order error:", error);
      if (error.message.includes("already exists")) {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
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
          const sumHT = items.reduce(
            (acc, it: any) => acc + Number(it.totalPriceHT || 0),
            0
          );
          const sumTTC = items.reduce(
            (acc, it: any) => acc + Number(it.totalPriceTTC || 0),
            0
          );
          totalAmountHT = Number(sumHT.toFixed(2));
          totalAmountTTC = Number(sumTTC.toFixed(2));
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
   * Mettre à jour une commande
   */
  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orderUpdateDTO: OrderUpdateDTO = req.body;

      // Convertir le DTO en OrderData
      const orderData = OrderMapper.orderUpdateDTOToOrderData(orderUpdateDTO);

      const order = await this.orderService.updateOrder(
        parseInt(id!),
        orderData
      );
      const orderDTO = OrderMapper.orderToPublicDTO(order);

      res.json(ResponseMapper.orderUpdated(orderDTO));
    } catch (error: any) {
      console.error("Update order error:", error);
      if (error.message === "Order not found") {
        res.status(404).json(ResponseMapper.notFoundError("Order"));
        return;
      }
      if (error.message.includes("already exists")) {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
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
   */
  async listOrders(req: Request, res: Response): Promise<void> {
    try {
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        ...(req.query.customerId && {
          customerId: parseInt(req.query.customerId as string),
        }),
        ...(req.query.year && {
          year: parseInt(req.query.year as string),
        }),
        ...(req.query.total &&
          req.query.total !== "" && {
            total: parseFloat(req.query.total as string),
          }),
        ...(req.query.date &&
          req.query.date !== "" && {
            date: req.query.date as string,
          }),
      };

      const result = await this.orderService.listOrders(options);
      res.json(ResponseMapper.success(result));
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
      const { delivered } = req.body;

      if (typeof delivered !== "boolean") {
        res
          .status(400)
          .json(ResponseMapper.badRequestError("delivered must be a boolean"));
        return;
      }

      const order = await this.orderService.updateDeliveryStatus(
        orderId,
        delivered
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
      const { status } = req.body;

      if (!status || !["pending", "refunded"].includes(status)) {
        res.status(400).json({
          success: false,
          error: "Statut invalide. Doit être 'pending' ou 'refunded'",
        });
        return;
      }

      const creditNote = await this.orderService.updateCreditNoteStatus(
        parseInt(id),
        status
      );

      res.json({
        success: true,
        message: `Statut de l'avoir mis à jour vers ${status}`,
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
   * Créer une commande complète depuis un checkout
   * Crée la commande, les items et les adresses en une seule transaction atomique
   */
  async createOrderFromCheckout(req: Request, res: Response): Promise<void> {
    try {
      const checkoutData: OrderCompleteDTO = req.body;

      const order = await this.orderService.createOrderFromCheckout(
        checkoutData
      );
      const orderDTO = OrderMapper.orderToPublicDTO(order);

      res.status(201).json(ResponseMapper.orderCreated(orderDTO));
    } catch (error: any) {
      console.error("Create order from checkout error:", error);
      if (error.message.includes("already exists")) {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
