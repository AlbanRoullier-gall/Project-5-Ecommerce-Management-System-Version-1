/**
 * Contrôleur des Adresses de Commande
 * Gestion des requêtes HTTP pour les opérations d'adresses de commande
 *
 * Architecture : Pattern Contrôleur
 * - Gestion des requêtes/réponses HTTP
 * - Orchestration des services
 * - Conversion des DTO
 */

import { Request, Response } from "express";
import OrderService from "../../services/OrderService";
import { OrderMapper, ResponseMapper } from "../mapper";

export class OrderAddressController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  /**
   * Obtenir une adresse de commande par son ID
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
   * Supprimer une adresse de commande
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
   * Obtenir les adresses de commande par ID de commande
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
