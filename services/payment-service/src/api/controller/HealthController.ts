/**
 * Contrôleur de Santé - Version simplifiée pour Stripe
 * Points de terminaison de vérification de santé pour payment-service
 */

import { Request, Response } from "express";
import { ResponseMapper } from "../mapper";

export class HealthController {
  /**
   * Vérification de santé basique
   */
  healthCheck(req: Request, res: Response): void {
    res.json(ResponseMapper.healthSuccess());
  }

  /**
   * Vérification de santé détaillée avec l'état de configuration Stripe
   */
  async detailedHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        ...ResponseMapper.healthSuccess(),
        stripeConfig: {
          publicKey: process.env.STRIPE_PUBLIC_KEY
            ? "configured"
            : "not configured",
          secretKey: process.env.STRIPE_SECRET_KEY
            ? "configured"
            : "not configured",
        },
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json(ResponseMapper.healthError());
    }
  }
}
