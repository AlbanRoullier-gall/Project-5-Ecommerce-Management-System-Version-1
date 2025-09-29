/**
 * Health Controller
 * Health check endpoints for service monitoring
 *
 * Architecture : Controller pattern
 * - Health monitoring endpoints
 * - Service status reporting
 * - System diagnostics
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
   * Basic health check
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
   * Detailed health check with database connectivity
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

      res.json(
        ResponseMapper.success("Detailed health check completed", healthData)
      );
    } catch (error) {
      console.error("Detailed health check error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Check database connection
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
