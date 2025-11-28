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

      const { userFullName, userEmail, user, approvalUrl, rejectionUrl } =
        req.body;

      const result = await this.emailService.sendBackofficeApprovalRequest({
        userFullName,
        userEmail,
        user,
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

      const { userEmail, userFullName, user, backofficeUrl } = req.body;

      const result = await this.emailService.sendBackofficeApprovalConfirmation(
        {
          userEmail,
          userFullName,
          user,
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

      const { userEmail, userFullName, user } = req.body;

      const result =
        await this.emailService.sendBackofficeRejectionNotification({
          userEmail,
          userFullName,
          user,
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
   * Accepte soit le format formaté (compatibilité), soit le format brut (orderId, cart, customerData, addressData)
   */
  async sendOrderConfirmationEmail(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;

      // Détecter le format : si cart est présent, utiliser le nouveau format
      let result;
      if (body.cart && body.customerData && body.addressData) {
        // Nouveau format : données brutes, le service construit tout
        result = await this.emailService.sendOrderConfirmationEmailFromData({
          orderId: body.orderId,
          cart: body.cart,
          customerData: body.customerData,
          addressData: body.addressData,
        });
      } else {
        // Ancien format : données déjà formatées (compatibilité)
        const {
          orderId,
          customerEmail,
          customerName,
          items,
          subtotal,
          tax,
          total,
          shippingAddress,
        } = body;

        result = await this.emailService.sendOrderConfirmationEmail({
          customerEmail,
          customerName: customerName || "Client",
          orderId,
          orderDate: new Date(),
          items,
          subtotal,
          tax,
          total,
          shippingAddress,
        });
      }

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
