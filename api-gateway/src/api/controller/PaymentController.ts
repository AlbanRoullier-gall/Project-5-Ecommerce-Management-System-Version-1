/**
 * PaymentController
 * Gère les routes de paiement
 */

import { Request, Response } from "express";
import {
  handleCreatePayment,
  handleStripeWebhook,
  handleFinalizePayment,
} from "../../handlers/payment-handler";

export class PaymentController {
  /**
   * Wrapper pour les handlers orchestrés
   */
  private wrapHandler(
    handler: (req: Request, res: Response) => Promise<any> | any
  ) {
    return async (req: Request, res: Response): Promise<void> => {
      await handler(req, res);
    };
  }

  // ===== ROUTES ORCHESTRÉES =====

  createPayment = this.wrapHandler(handleCreatePayment);
  stripeWebhook = this.wrapHandler(handleStripeWebhook);
  finalizePayment = this.wrapHandler(handleFinalizePayment);
}
