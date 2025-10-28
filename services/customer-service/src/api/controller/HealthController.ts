/**
 * Contrôleur de Santé
 * Points de terminaison de vérification de santé pour la surveillance du service
 *
 * Architecture : Pattern Contrôleur
 * - Points de terminaison de surveillance de santé
 * - Rapport de statut du service
 * - Diagnostics système
 */

import { Request, Response } from "express";
import { Pool } from "pg";
import { ResponseMapper } from "../mapper";

export class HealthController {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Vérification de santé basique
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.json(ResponseMapper.success("Customer service is healthy"));
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Vérification de santé détaillée avec connectivité base de données
   */
  async detailedHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      const healthData = {
        service: "customer-service",
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "1.0.0",
        environment: process.env.NODE_ENV || "development",
        database: await this.checkDatabaseConnection(),
      };

      res.json({
        message: "Detailed health check completed",
        ...healthData,
      });
    } catch (error) {
      console.error("Detailed health check error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Vérifier la connexion à la base de données
   */
  private async checkDatabaseConnection(): Promise<any> {
    try {
      const client = await this.pool.connect();
      const result = await client.query("SELECT NOW() as current_time");
      client.release();

      return {
        status: "connected",
        currentTime: result.rows[0].current_time,
      };
    } catch (error) {
      return {
        status: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
