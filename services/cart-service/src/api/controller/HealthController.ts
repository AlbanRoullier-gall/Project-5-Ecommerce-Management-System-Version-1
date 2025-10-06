/**
 * Health Controller - Version simplifiée pour Cart
 * Health check endpoints pour cart-service
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
   * Basic health check
   */
  healthCheck(req: Request, res: Response): void {
    res.json(ResponseMapper.healthSuccess());
  }

  /**
   * Detailed health check with Redis configuration status
   */
  async detailedHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      const configStatus = this.cartService.getConfigurationStatus();

      res.json({
        ...ResponseMapper.healthSuccess(),
        redisConfig: configStatus,
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json(ResponseMapper.healthError());
    }
  }
}
