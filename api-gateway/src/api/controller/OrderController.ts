/**
 * OrderController
 * Gère les routes des commandes
 */

import { Request, Response } from "express";
import { proxyRequest } from "../proxy";

export class OrderController {
  /**
   * Proxy vers le service order
   */
  private async proxyToOrder(req: Request, res: Response): Promise<void> {
    await proxyRequest(req, res, "order");
  }

  // ===== ROUTES PUBLIQUES PROXY =====

  listOrders = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  getOrder = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  createOrder = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  getOrderItems = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  createOrderItem = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  getOrderAddresses = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  createOrderAddress = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  getCustomerCreditNotes = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  getOrderStatistics = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  // ===== ROUTES ADMIN PROXY =====

  adminListOrders = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  adminGetOrder = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  adminUpdateOrder = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  adminListOrderItems = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  adminGetOrderItem = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  adminUpdateOrderItem = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  adminListCreditNotes = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  adminGetCreditNote = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  adminUpdateCreditNote = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  adminListCreditNoteItems = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  adminGetCreditNoteItem = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  adminUpdateCreditNoteItem = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  adminListOrderAddresses = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  adminGetOrderAddress = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  adminUpdateOrderAddress = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  updateDeliveryStatus = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  updateCreditNoteStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  getCreditNoteItems = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  adminGetOrderStatistics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.proxyToOrder(req, res);
  };

  exportOrdersYear = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToOrder(req, res);
  };
}
