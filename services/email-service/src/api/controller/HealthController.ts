/**
 * Health Controller - Version simplifiée
 * Health check endpoints pour email-service
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
   * Vérification de santé détaillée avec l'état de la configuration Gmail
   */
  async detailedHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        ...ResponseMapper.healthSuccess(),
        gmailConfig: {
          adminEmail: process.env.ADMIN_EMAIL || "not configured",
          gmailUser: process.env.GMAIL_USER ? "configured" : "not configured",
        },
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json(ResponseMapper.healthError());
    }
  }
}
