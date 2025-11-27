/**
 * Contrôleur des Articles de Commande
 * Gestion des requêtes HTTP pour les opérations d'articles de commande
 *
 * Architecture : Pattern Contrôleur
 * - Gestion des requêtes/réponses HTTP
 * - Orchestration des services
 * - Conversion des DTO
 */

import { Request, Response } from "express";
import OrderService from "../../services/OrderService";
import { OrderMapper, ResponseMapper } from "../mapper";

export class OrderItemController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  /**
   * Obtenir un article de commande par son ID
   */
  async getOrderItemById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orderItem = await this.orderService.getOrderItemById(parseInt(id!));

      if (!orderItem) {
        res.status(404).json(ResponseMapper.notFoundError("Order item"));
        return;
      }

      const orderItemDTO = OrderMapper.orderItemToPublicDTO(orderItem);
      res.json(ResponseMapper.orderItemRetrieved(orderItemDTO));
    } catch (error: any) {
      console.error("Get order item error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Supprimer un article de commande
   */
  async deleteOrderItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.orderService.deleteOrderItem(parseInt(id!));

      if (!success) {
        res.status(404).json(ResponseMapper.notFoundError("Order item"));
        return;
      }

      res.json(ResponseMapper.orderItemDeleted());
    } catch (error: any) {
      console.error("Delete order item error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Obtenir les articles de commande par ID de commande
   */
  async getOrderItemsByOrderId(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const orderItems = await this.orderService.getOrderItemsByOrderId(
        parseInt(orderId!)
      );

      const orderItemDTOs = orderItems.map((orderItem) =>
        OrderMapper.orderItemToPublicDTO(orderItem)
      );

      res.json(
        ResponseMapper.success({
          orderItems: orderItemDTOs,
          count: orderItemDTOs.length,
        })
      );
    } catch (error: any) {
      console.error("Get order items by order ID error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
