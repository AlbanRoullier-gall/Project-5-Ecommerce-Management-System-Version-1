/**
 * OrderAddress Controller
 * HTTP request handling for order address operations
 *
 * Architecture : Controller pattern
 * - HTTP request/response handling
 * - Service orchestration
 * - DTO conversion
 */

import { Request, Response } from "express";
import OrderService from "../../services/OrderService";
import {
  OrderAddressCreateDTO,
  OrderAddressUpdateDTO,
} from "../dto/OrderAddressDTO";
import { OrderAddressData } from "../../models/OrderAddress";
import { OrderMapper, ResponseMapper } from "../mapper";

export class OrderAddressController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  /**
   * Create a new order address
   */
  async createOrderAddress(req: Request, res: Response): Promise<void> {
    try {
      const orderAddressCreateDTO: OrderAddressCreateDTO = req.body;

      // Convert DTO to OrderAddressData
      const orderAddressData =
        OrderMapper.orderAddressCreateDTOToOrderAddressData(
          orderAddressCreateDTO
        );

      const orderAddress = await this.orderService.createOrderAddress(
        orderAddressData as OrderAddressData
      );
      const orderAddressDTO = OrderMapper.orderAddressToPublicDTO(orderAddress);

      res.status(201).json(ResponseMapper.orderAddressCreated(orderAddressDTO));
    } catch (error: any) {
      console.error("Create order address error:", error);
      if (error.message.includes("already exists")) {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Get order address by ID
   */
  async getOrderAddressById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orderAddress = await this.orderService.getOrderAddressById(
        parseInt(id!)
      );

      if (!orderAddress) {
        res.status(404).json(ResponseMapper.notFoundError("Order address"));
        return;
      }

      const orderAddressDTO = OrderMapper.orderAddressToPublicDTO(orderAddress);
      res.json(ResponseMapper.orderAddressRetrieved(orderAddressDTO));
    } catch (error: any) {
      console.error("Get order address error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Update order address
   */
  async updateOrderAddress(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const orderAddressUpdateDTO: OrderAddressUpdateDTO = req.body;

      // Convert DTO to OrderAddressData
      const orderAddressData =
        OrderMapper.orderAddressUpdateDTOToOrderAddressData(
          orderAddressUpdateDTO
        );

      const orderAddress = await this.orderService.updateOrderAddress(
        parseInt(id!),
        orderAddressData
      );
      const orderAddressDTO = OrderMapper.orderAddressToPublicDTO(orderAddress);

      res.json(ResponseMapper.orderAddressUpdated(orderAddressDTO));
    } catch (error: any) {
      console.error("Update order address error:", error);
      if (error.message === "Order address not found") {
        res.status(404).json(ResponseMapper.notFoundError("Order address"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Delete order address
   */
  async deleteOrderAddress(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.orderService.deleteOrderAddress(parseInt(id!));

      if (!success) {
        res.status(404).json(ResponseMapper.notFoundError("Order address"));
        return;
      }

      res.json(ResponseMapper.orderAddressDeleted());
    } catch (error: any) {
      console.error("Delete order address error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Get order addresses by order ID
   */
  async getOrderAddressesByOrderId(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const orderAddresses = await this.orderService.getOrderAddressesByOrderId(
        parseInt(orderId!)
      );

      const orderAddressDTOs = orderAddresses.map((orderAddress) =>
        OrderMapper.orderAddressToPublicDTO(orderAddress)
      );

      res.json(
        ResponseMapper.success({
          orderAddresses: orderAddressDTOs,
          count: orderAddressDTOs.length,
        })
      );
    } catch (error: any) {
      console.error("Get order addresses by order ID error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
