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

  /**
   * Vérification détaillée de la santé du service
   */
  async detailedHealthCheck(_req: Request, res: Response): Promise<void> {
    try {
      const healthDetails = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "auth-service",
        version: "v1",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env["NODE_ENV"] || "development",
        database: process.env["DATABASE_URL"] ? "connected" : "not configured",
        jwt: process.env["JWT_SECRET"] ? "configured" : "default",
      };

      res.json(healthDetails);
    } catch (error: any) {
      console.error("Detailed health check error:", error);
      res.status(500).json(ResponseMapper.healthError());
    }
  }
}
