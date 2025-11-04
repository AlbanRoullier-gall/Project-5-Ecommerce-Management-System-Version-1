/**
 * EmailController
 * Gère les routes d'email
 */

import { Request, Response } from "express";
import { proxyRequest } from "../proxy";

export class EmailController {
  /**
   * Proxy vers le service email
   */
  private async proxyToEmail(req: Request, res: Response): Promise<void> {
    await proxyRequest(req, res, "email");
  }

  // ===== ROUTES PUBLIQUES PROXY =====

  sendEmail = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToEmail(req, res);
  };

  sendResetEmail = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToEmail(req, res);
  };

  sendConfirmation = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToEmail(req, res);
  };

  sendBackofficeApprovalRequest = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.proxyToEmail(req, res);
  };

  sendBackofficeApprovalConfirmation = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.proxyToEmail(req, res);
  };

  sendBackofficeRejectionNotification = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.proxyToEmail(req, res);
  };

  sendOrderConfirmation = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.proxyToEmail(req, res);
  };
}
