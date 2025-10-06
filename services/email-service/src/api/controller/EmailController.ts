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
      console.log("📧 EmailController: Starting sendClientEmail");
      console.log("📧 Request body:", req.body);

      const emailData = EmailMapper.emailSendDTOToServiceData(
        req.body as EmailSendDTO
      );
      console.log("📧 Mapped email data:", emailData);

      const result = await this.emailService.sendClientEmail(emailData);
      console.log("📧 Service result:", result);

      const publicDTO = EmailMapper.emailServiceResultToPublicDTO(result);
      console.log("📧 Public DTO:", publicDTO);

      const response = ResponseMapper.emailSent(publicDTO);
      console.log("📧 Final response:", response);

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Send client email error:", error);
      console.error("Error stack:", error.stack);
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
