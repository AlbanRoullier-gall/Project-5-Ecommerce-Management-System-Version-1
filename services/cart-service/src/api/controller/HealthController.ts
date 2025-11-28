/**
 * Contrôleur de Santé - Version simplifiée pour Cart
 * Endpoints de vérification de santé pour cart-service
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
   * Vérification de santé détaillée avec statut de configuration Redis
   */
  async detailedHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        ...ResponseMapper.healthSuccess(),
        redisConfig: {
          redisHost: process.env.REDIS_HOST || "localhost",
          redisPort: process.env.REDIS_PORT || "6379",
        },
      });
    } catch (error) {
      console.error("Erreur de vérification de santé:", error);
      res.status(500).json(ResponseMapper.healthError());
    }
  }
}
