/**
 * Email Controller - Version simplifiée pour Gmail
 * HTTP request handling pour l'envoi d'emails via Gmail
 */

import { Request, Response } from "express";
import EmailService from "../../services/EmailService";
import { EmailMapper, ResponseMapper } from "../mapper";
import { EmailSendDTO } from "../dto";

export class EmailController {
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }

  /**
   * Envoyer un email au client
   */
  async sendClientEmail(req: Request, res: Response): Promise<void> {
    try {
      const emailData = EmailMapper.emailSendDTOToServiceData(
        req.body as EmailSendDTO
      );
      const result = await this.emailService.sendClientEmail(emailData);
      res
        .status(201)
        .json(
          ResponseMapper.emailSent(
            EmailMapper.emailServiceResultToPublicDTO(result)
          )
        );
    } catch (error: any) {
      console.error("Send client email error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Envoyer une confirmation d'envoi à l'admin
   */
  async sendConfirmationEmail(req: Request, res: Response): Promise<void> {
    try {
      const confirmationData = EmailMapper.emailConfirmationDTOToServiceData(
        req.body
      );
      const result = await this.emailService.sendConfirmationEmail(
        confirmationData
      );
      res
        .status(201)
        .json(
          ResponseMapper.confirmationSent(
            EmailMapper.emailServiceResultToPublicDTO(result)
          )
        );
    } catch (error: any) {
      console.error("Send confirmation email error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
