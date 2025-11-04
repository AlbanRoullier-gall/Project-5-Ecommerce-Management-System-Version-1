/**
 * CustomerController
 * Gère les routes des clients
 */

import { Request, Response } from "express";
import { proxyRequest } from "../../core/proxy";

export class CustomerController {
  /**
   * Proxy vers le service customer
   */
  private async proxyToCustomer(req: Request, res: Response): Promise<void> {
    await proxyRequest(req, res, "customer");
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

  createCustomer = this.wrapHandler(this.proxyToCustomer);
  getCustomerByEmail = this.wrapHandler(this.proxyToCustomer);
  getCountries = this.wrapHandler(this.proxyToCustomer);
  getCustomer = this.wrapHandler(this.proxyToCustomer);
  createAddress = this.wrapHandler(this.proxyToCustomer);

  // ===== ROUTES ADMIN PROXY =====

  adminListCustomers = this.wrapHandler(this.proxyToCustomer);
  adminGetCustomer = this.wrapHandler(this.proxyToCustomer);
  adminUpdateCustomer = this.wrapHandler(this.proxyToCustomer);
  adminDeleteCustomer = this.wrapHandler(this.proxyToCustomer);
  adminSearchCustomers = this.wrapHandler(this.proxyToCustomer);
  adminGetCountries = this.wrapHandler(this.proxyToCustomer);
  adminListAddresses = this.wrapHandler(this.proxyToCustomer);
  adminGetAddress = this.wrapHandler(this.proxyToCustomer);
  adminUpdateAddress = this.wrapHandler(this.proxyToCustomer);
  adminDeleteAddress = this.wrapHandler(this.proxyToCustomer);
}
