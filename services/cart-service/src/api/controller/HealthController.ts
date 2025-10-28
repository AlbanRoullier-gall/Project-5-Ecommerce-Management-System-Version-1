/**
 * Contrôleur de Santé - Version simplifiée pour Cart
 * Endpoints de vérification de santé pour cart-service
 */

import { Request, Response } from "express";
import { ResponseMapper } from "../mapper";
import CartService from "../../services/CartService";

export class HealthController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

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
      const configStatus = this.cartService.getConfigurationStatus();

      res.json({
        ...ResponseMapper.healthSuccess(),
        redisConfig: configStatus,
      });
    } catch (error) {
      console.error("Erreur de vérification de santé:", error);
      res.status(500).json(ResponseMapper.healthError());
    }
  }
}
