/**
 * OrderItem Controller
 * HTTP request handling for order item operations
 *
 * Architecture : Controller pattern
 * - HTTP request/response handling
 * - Service orchestration
 * - DTO conversion
 */

import { Request, Response } from "express";
import OrderService from "../../services/OrderService";
import { OrderItemCreateDTO, OrderItemUpdateDTO } from "../dto";
import { OrderMapper, ResponseMapper } from "../mapper";

export class OrderItemController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  /**
   * Create a new order item
   */
  async createOrderItem(req: Request, res: Response): Promise<void> {
    try {
      const orderItemCreateDTO: OrderItemCreateDTO = req.body;

      // Convert DTO to OrderItemData
      const orderItemData =
        OrderMapper.orderItemCreateDTOToOrderItemData(orderItemCreateDTO);

      const orderItem = await this.orderService.createOrderItem(orderItemData);
      const orderItemDTO = OrderMapper.orderItemToPublicDTO(orderItem);

      res.status(201).json(ResponseMapper.orderItemCreated(orderItemDTO));
    } catch (error: any) {
      console.error("Create order item error:", error);
      if (error.message.includes("already exists")) {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Get order item by ID
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
   * Update order item
   */
  async updateOrderItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orderItemUpdateDTO: OrderItemUpdateDTO = req.body;

      // Convert DTO to OrderItemData
      const orderItemData =
        OrderMapper.orderItemUpdateDTOToOrderItemData(orderItemUpdateDTO);

      const orderItem = await this.orderService.updateOrderItem(
        parseInt(id!),
        orderItemData
      );
      const orderItemDTO = OrderMapper.orderItemToPublicDTO(orderItem);

      res.json(ResponseMapper.orderItemUpdated(orderItemDTO));
    } catch (error: any) {
      console.error("Update order item error:", error);
      if (error.message === "Order item not found") {
        res.status(404).json(ResponseMapper.notFoundError("Order item"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Delete order item
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
   * Get order items by order ID
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
