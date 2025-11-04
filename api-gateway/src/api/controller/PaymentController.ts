/**
 * PaymentController
 * Gère les routes de paiement
 */

import { Request, Response } from "express";
import {
  handleCreatePayment,
  handleStripeWebhook,
  handleFinalizePayment,
} from "../handlers/payment-handler";

export class PaymentController {
  // ===== ROUTES ORCHESTRÉES =====

  createPayment = async (req: Request, res: Response): Promise<void> => {
    await handleCreatePayment(req, res);
  };

  stripeWebhook = async (req: Request, res: Response): Promise<void> => {
    await handleStripeWebhook(req, res);
  };

  finalizePayment = async (req: Request, res: Response): Promise<void> => {
    await handleFinalizePayment(req, res);
  };
}
