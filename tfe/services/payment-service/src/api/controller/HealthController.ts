/**
 * Health Controller - Version simplifiée pour Stripe
 * Health check endpoints pour payment-service
 */

import { Request, Response } from "express";
import { ResponseMapper } from "../mapper";
import PaymentService from "../../services/PaymentService";

export class HealthController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * Basic health check
   */
  healthCheck(req: Request, res: Response): void {
    res.json(ResponseMapper.healthSuccess());
  }

  /**
   * Detailed health check with Stripe configuration status
   */
  async detailedHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      const configStatus = this.paymentService.getConfigurationStatus();

      res.json({
        ...ResponseMapper.healthSuccess(),
        stripeConfig: configStatus,
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json(ResponseMapper.healthError());
    }
  }
}
