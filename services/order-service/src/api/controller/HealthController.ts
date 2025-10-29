/**
 * Contrôleur de Santé
 * Points de contrôle de santé pour le service de commandes
 *
 * Architecture : Pattern Contrôleur
 * - Surveillance de la santé
 * - Statut du service
 * - Connectivité à la base de données
 */

import { Request, Response } from "express";
import { Pool } from "pg";
import { ResponseMapper } from "../mapper/ResponseMapper";

export class HealthController {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Contrôle de santé basique
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.json(
        ResponseMapper.success({
          service: "order-service",
          status: "healthy",
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Contrôle de santé détaillé avec connectivité à la base de données
   */
  async detailedHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Tester la connexion à la base de données
      const dbResult = await this.pool.query("SELECT 1 as test");
      const dbHealthy = dbResult.rows.length > 0;

      const healthData = {
        service: "order-service",
        status: dbHealthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        database: {
          connected: dbHealthy,
          status: dbHealthy ? "healthy" : "unhealthy",
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };

      const statusCode = dbHealthy ? 200 : 503;
      res.status(statusCode).json(ResponseMapper.success(healthData));
    } catch (error) {
      console.error("Detailed health check error:", error);
      res.status(503).json(
        ResponseMapper.success({
          service: "order-service",
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          database: {
            connected: false,
            status: "unhealthy",
            error: "Database connection failed",
          },
        })
      );
    }
  }
}
