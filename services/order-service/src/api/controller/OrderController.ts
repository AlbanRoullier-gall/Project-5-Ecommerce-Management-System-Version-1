/**
 * Order Controller
 * HTTP request handling for order operations
 *
 * Architecture : Controller pattern
 * - HTTP request/response handling
 * - Service orchestration
 * - DTO conversion
 */

import { Request, Response } from "express";
import OrderService from "../../services/OrderService";
import { OrderCreateDTO, OrderUpdateDTO } from "../dto";
import { OrderMapper, ResponseMapper } from "../mapper";

export class OrderController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  /**
   * Create a new order
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderCreateDTO: OrderCreateDTO = req.body;

      // Convert DTO to OrderData
      const orderData = OrderMapper.orderCreateDTOToOrderData(orderCreateDTO);

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
   * Get order by ID
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
        // En cas d'erreur sur le chargement des items, on garde les totaux d'origine
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
   * Update order
   */
  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orderUpdateDTO: OrderUpdateDTO = req.body;

      // Convert DTO to OrderData
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
   * Delete order
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
   * List orders with pagination
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
      };

      const result = await this.orderService.listOrders(options);
      res.json(ResponseMapper.success(result));
    } catch (error: any) {
      console.error("List orders error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
