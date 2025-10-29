/**
 * Contrôleur de Santé - Service PDF Export
 * Points de terminaison de vérification de santé pour pdf-export-service
 */

import { Request, Response } from "express";
import { ResponseMapper } from "../mapper/index";

export class HealthController {
  /**
   * Vérification de santé basique
   */
  healthCheck(req: Request, res: Response): void {
    res.json(ResponseMapper.healthSuccess());
  }

  /**
   * Vérification de santé détaillée avec l'état du service
   */
  async detailedHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        ...ResponseMapper.healthSuccess(),
        serviceInfo: {
          name: "pdf-export-service",
          version: "1.0.0",
          description: "Service de génération d'exports PDF/HTML",
          capabilities: ["orders-year-export"],
        },
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json(ResponseMapper.healthError());
    }
  }
}
