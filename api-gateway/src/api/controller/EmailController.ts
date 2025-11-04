/**
 * EmailController
 * Gère les routes d'email
 */

import { Request, Response } from "express";
import { proxyRequest } from "../../core/proxy";

export class EmailController {
  /**
   * Proxy vers le service email
   */
  private async proxyToEmail(req: Request, res: Response): Promise<void> {
    await proxyRequest(req, res, "email");
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

  sendEmail = this.wrapHandler(this.proxyToEmail);
  sendResetEmail = this.wrapHandler(this.proxyToEmail);
  sendConfirmation = this.wrapHandler(this.proxyToEmail);
  sendBackofficeApprovalRequest = this.wrapHandler(this.proxyToEmail);
  sendBackofficeApprovalConfirmation = this.wrapHandler(this.proxyToEmail);
  sendBackofficeRejectionNotification = this.wrapHandler(this.proxyToEmail);
  sendOrderConfirmation = this.wrapHandler(this.proxyToEmail);
}
