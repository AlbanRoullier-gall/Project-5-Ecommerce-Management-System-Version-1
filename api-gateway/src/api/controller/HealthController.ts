/**
 * HealthController
 * Gère les routes de santé du service
 */

import { Request, Response } from "express";
import { ResponseMapper } from "../mapper/ResponseMapper";

export class HealthController {
  /**
   * Vérification de santé basique
   */
  healthCheck(_req: Request, res: Response): void {
    res.json(ResponseMapper.healthSuccess("API Gateway"));
  }

  /**
   * Vérification de santé détaillée
   */
  detailedHealthCheck(_req: Request, res: Response): void {
    res.json({
      ...ResponseMapper.healthSuccess("API Gateway"),
      services: {
        status: "checking",
        timestamp: new Date().toISOString(),
      },
    });
  }
}
