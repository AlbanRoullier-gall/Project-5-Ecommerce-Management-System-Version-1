/**
 * HealthController
 * Gère les routes de santé du service
 */

import { Request, Response } from "express";

export class HealthController {
  /**
   * Vérification de santé basique
   */
  healthCheck(_req: Request, res: Response): void {
    res.json({
      status: "OK",
      service: "API Gateway",
      timestamp: new Date().toISOString(),
      version: "3.0.0",
    });
  }

  /**
   * Vérification de santé détaillée
   */
  detailedHealthCheck(_req: Request, res: Response): void {
    res.json({
      status: "OK",
      service: "API Gateway",
      timestamp: new Date().toISOString(),
      version: "3.0.0",
      services: {
        status: "checking",
        timestamp: new Date().toISOString(),
      },
    });
  }
}
