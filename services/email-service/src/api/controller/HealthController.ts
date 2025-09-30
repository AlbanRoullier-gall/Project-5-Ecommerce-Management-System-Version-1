/**
 * Health Controller - Version simplifiée
 * Health check endpoints pour email-service
 */

import { Request, Response } from "express";
import { ResponseMapper } from "../mapper";
import EmailService from "../../services/EmailService";

export class HealthController {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Basic health check
   */
  healthCheck(req: Request, res: Response): void {
    res.json(ResponseMapper.healthSuccess());
  }

  /**
   * Detailed health check with Gmail configuration status
   */
  async detailedHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      const configStatus = this.emailService.getConfigurationStatus();

      res.json({
        ...ResponseMapper.healthSuccess(),
        gmailConfig: configStatus,
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json(ResponseMapper.healthError());
    }
  }
}
