/**
 * OrderController
 * Gère les routes des commandes
 */

import { Request, Response } from "express";
import { proxyRequest } from "../../core/proxy";

export class OrderController {
  /**
   * Proxy vers le service order
   */
  private async proxyToOrder(req: Request, res: Response): Promise<void> {
    await proxyRequest(req, res, "order");
  }

  /**
   * Wrapper pour les handlers
   */
  private wrapHandler(handler: (req: Request, res: Response) => Promise<void>) {
    return async (req: Request, res: Response): Promise<void> => {
      await handler(req, res);
    };
  }

  // ===== ROUTES PUBLIQUES PROXY =====

  listOrders = this.wrapHandler(this.proxyToOrder);
  getOrder = this.wrapHandler(this.proxyToOrder);
  createOrder = this.wrapHandler(this.proxyToOrder);
  getOrderItems = this.wrapHandler(this.proxyToOrder);
  createOrderItem = this.wrapHandler(this.proxyToOrder);
  getOrderAddresses = this.wrapHandler(this.proxyToOrder);
  createOrderAddress = this.wrapHandler(this.proxyToOrder);
  getCustomerCreditNotes = this.wrapHandler(this.proxyToOrder);
  getOrderStatistics = this.wrapHandler(this.proxyToOrder);

  // ===== ROUTES ADMIN PROXY =====

  adminListOrders = this.wrapHandler(this.proxyToOrder);
  adminGetOrder = this.wrapHandler(this.proxyToOrder);
  adminUpdateOrder = this.wrapHandler(this.proxyToOrder);
  adminListOrderItems = this.wrapHandler(this.proxyToOrder);
  adminGetOrderItem = this.wrapHandler(this.proxyToOrder);
  adminUpdateOrderItem = this.wrapHandler(this.proxyToOrder);
  adminListCreditNotes = this.wrapHandler(this.proxyToOrder);
  adminGetCreditNote = this.wrapHandler(this.proxyToOrder);
  adminUpdateCreditNote = this.wrapHandler(this.proxyToOrder);
  adminListCreditNoteItems = this.wrapHandler(this.proxyToOrder);
  adminGetCreditNoteItem = this.wrapHandler(this.proxyToOrder);
  adminUpdateCreditNoteItem = this.wrapHandler(this.proxyToOrder);
  adminListOrderAddresses = this.wrapHandler(this.proxyToOrder);
  adminGetOrderAddress = this.wrapHandler(this.proxyToOrder);
  adminUpdateOrderAddress = this.wrapHandler(this.proxyToOrder);
  updateDeliveryStatus = this.wrapHandler(this.proxyToOrder);
  updateCreditNoteStatus = this.wrapHandler(this.proxyToOrder);
  getCreditNoteItems = this.wrapHandler(this.proxyToOrder);
  adminGetOrderStatistics = this.wrapHandler(this.proxyToOrder);
  exportOrdersYear = this.wrapHandler(this.proxyToOrder);
}
