/**
 * Email Controller - Version simplifiée pour Gmail
 * HTTP request handling pour l'envoi d'emails via Gmail
 */

import { Request, Response } from "express";
import EmailService from "../../services/EmailService";
import { ResponseMapper } from "../mapper";

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

      const result = await this.emailService.sendClientEmail(req.body);
      console.log("📧 Service result:", result);

      const response = ResponseMapper.emailSent(result);
      console.log("📧 Final response:", response);

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Send client email error:", error);
      console.error("Error stack:", error.stack);
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

      const result = await this.emailService.sendResetPasswordEmail({
        email,
        token,
        userName,
        resetUrl,
      });

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

  /**
   * Envoyer un email de confirmation de commande
   */
  async sendOrderConfirmationEmail(req: Request, res: Response): Promise<void> {
    try {
      console.log("📧 EmailController: Starting sendOrderConfirmationEmail");
      console.log("📧 Request body:", req.body);

      const {
        customerEmail,
        customerName,
        orderId,
        orderDate,
        items,
        subtotal,
        tax,
        total,
        shippingAddress,
      } = req.body;

      const result = await this.emailService.sendOrderConfirmationEmail({
        customerEmail,
        customerName,
        orderId,
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        items,
        subtotal,
        tax,
        total,
        shippingAddress,
      });

      const response = {
        success: true,
        messageId: result.messageId,
        message: "Email de confirmation de commande envoyé avec succès",
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Send order confirmation email error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
