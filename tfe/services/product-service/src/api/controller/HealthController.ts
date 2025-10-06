/**
 * Health Controller
 * Health check endpoints
 *
 * Architecture : Controller pattern
 * - HTTP request handling
 * - Service orchestration
 * - Response formatting
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
  healthCheck(req: Request, res: Response): void {
    res.json(ResponseMapper.healthSuccess());
  }

  /**
   * Detailed health check with database connection
   */
  async detailedHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Test database connection
      await this.pool.query("SELECT 1");

      res.json(ResponseMapper.healthSuccess());
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json(ResponseMapper.healthError());
    }
  }
}
