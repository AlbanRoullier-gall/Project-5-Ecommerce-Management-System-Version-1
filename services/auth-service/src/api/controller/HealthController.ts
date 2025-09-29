/**
 * HealthController
 * Contrôleur pour la santé du service
 *
 * Architecture : Controller pattern
 * - Endpoint de monitoring
 * - Vérification de l'état du service
 */
import { Request, Response } from "express";
import { ResponseMapper } from "../mapper";

export class HealthController {
  /**
   * Vérifier la santé du service
   */
  async healthCheck(_req: Request, res: Response): Promise<void> {
    try {
      const response = ResponseMapper.healthSuccess();
      res.json(response);
    } catch (error: any) {
      console.error("Health check error:", error);
      res.status(500).json(ResponseMapper.healthError());
    }
  }
}
