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

  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  async sendResetPasswordEmail(req: Request, res: Response): Promise<void> {
    try {
      console.log("📧 EmailController: Starting sendResetPasswordEmail");
      console.log("📧 Request body:", req.body);

      const { email, token, userName, resetUrl } = req.body;

      // Créer le contenu de l'email de réinitialisation
      const subject =
        "Réinitialisation de votre mot de passe - Nature de Pierre";
      const message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #13686a;">Réinitialisation de votre mot de passe</h2>
          <p>Bonjour ${userName},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Nature de Pierre.</p>
          <p>Pour réinitialiser votre mot de passe, cliquez sur le lien ci-dessous :</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}?token=${token}" 
               style="background-color: #13686a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p><strong>Ce lien est valide pendant 15 minutes.</strong></p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Nature de Pierre - Interface d'administration<br>
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
          </p>
        </div>
      `;

      const emailData = {
        to: { email, name: userName },
        subject,
        message,
        clientName: "Nature de Pierre",
        clientEmail: "admin@naturedepierre.com",
      };

      const result = await this.emailService.sendClientEmail(emailData);
      console.log("📧 Reset password email sent:", result);

      const response = {
        success: true,
        messageId: result.messageId,
        message: "Email de réinitialisation envoyé avec succès",
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Send reset password email error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Envoyer un email de demande d'approbation backoffice
   */
  async sendBackofficeApprovalRequest(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log("📧 EmailController: Starting sendBackofficeApprovalRequest");
      console.log("📧 Request body:", req.body);

      const { userFullName, userEmail, approvalUrl, rejectionUrl } = req.body;

      const result = await this.emailService.sendBackofficeApprovalRequest({
        userFullName,
        userEmail,
        approvalUrl,
        rejectionUrl,
      });

      const response = {
        success: true,
        messageId: result.messageId,
        message: "Email de demande d'approbation envoyé avec succès",
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Send backoffice approval request error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Envoyer un email de confirmation d'approbation backoffice
   */
  async sendBackofficeApprovalConfirmation(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "📧 EmailController: Starting sendBackofficeApprovalConfirmation"
      );
      console.log("📧 Request body:", req.body);

      const { userEmail, userFullName, backofficeUrl } = req.body;

      const result = await this.emailService.sendBackofficeApprovalConfirmation(
        {
          userEmail,
          userFullName,
          backofficeUrl,
        }
      );

      const response = {
        success: true,
        messageId: result.messageId,
        message: "Email de confirmation d'approbation envoyé avec succès",
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Send backoffice approval confirmation error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Envoyer un email de notification de rejet backoffice
   */
  async sendBackofficeRejectionNotification(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "📧 EmailController: Starting sendBackofficeRejectionNotification"
      );
      console.log("📧 Request body:", req.body);

      const { userEmail, userFullName } = req.body;

      const result =
        await this.emailService.sendBackofficeRejectionNotification({
          userEmail,
          userFullName,
        });

      const response = {
        success: true,
        messageId: result.messageId,
        message: "Email de notification de rejet envoyé avec succès",
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Send backoffice rejection notification error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
