/**
 * CustomerController
 * Gère les routes des clients
 */

import { Request, Response } from "express";
import { proxyRequest } from "../proxy";

export class CustomerController {
  /**
   * Proxy vers le service customer
   */
  private async proxyToCustomer(req: Request, res: Response): Promise<void> {
    await proxyRequest(req, res, "customer");
  }

  // ===== ROUTES PUBLIQUES PROXY =====

  createCustomer = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCustomer(req, res);
  };

  getCustomerByEmail = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCustomer(req, res);
  };

  getCustomer = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCustomer(req, res);
  };

  createAddress = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCustomer(req, res);
  };

  // ===== ROUTES ADMIN PROXY =====

  adminListCustomers = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCustomer(req, res);
  };

  adminGetCustomer = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCustomer(req, res);
  };

  adminUpdateCustomer = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCustomer(req, res);
  };

  adminDeleteCustomer = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCustomer(req, res);
  };

  adminSearchCustomers = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCustomer(req, res);
  };

  adminListAddresses = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCustomer(req, res);
  };

  adminGetAddress = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCustomer(req, res);
  };

  adminUpdateAddress = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCustomer(req, res);
  };

  adminDeleteAddress = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToCustomer(req, res);
  };
}
