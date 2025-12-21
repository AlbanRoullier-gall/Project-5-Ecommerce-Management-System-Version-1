/**
 * Email Controller - Version simplifiée pour Gmail
 * HTTP request handling pour l'envoi d'emails via Gmail
 */

import { Request, Response } from "express";
import EmailService from "../../services/EmailService";
import { ResponseMapper } from "../mapper";
import type {
  EmailClientSendDTO,
  EmailResetPasswordDTO,
  EmailBackofficeRejectionDTO,
} from "../dto";

export class EmailController {
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }

  /**
   * Envoyer un email au client (formulaire de contact)
   * Le destinataire est déterminé côté serveur depuis ADMIN_EMAIL
   */
  async sendClientEmail(req: Request, res: Response): Promise<void> {
    try {
      console.log("📧 EmailController: Starting sendClientEmail");
      console.log("📧 Request body:", req.body);

      const emailClientSendDTO: EmailClientSendDTO = req.body;
      const result = await this.emailService.sendClientEmail(
        emailClientSendDTO
      );
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

      const emailResetPasswordDTO: EmailResetPasswordDTO = req.body;

      const result = await this.emailService.sendResetPasswordEmail(
        emailResetPasswordDTO
      );

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

      const emailBackofficeRejectionDTO: EmailBackofficeRejectionDTO = req.body;

      const result =
        await this.emailService.sendBackofficeRejectionNotification(
          emailBackofficeRejectionDTO
        );

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
   * Format simplifié : orderId, cart, customerData, addressData
   */
  async sendOrderConfirmationEmail(req: Request, res: Response): Promise<void> {
    try {
      console.log("📧 EmailController: Starting sendOrderConfirmationEmail");
      console.log("📧 Request body keys:", Object.keys(req.body || {}));
      
      // Log des données essentielles
      const body = req.body || {};
      console.log("📧 Order ID:", body.orderId);
      console.log("📧 Customer Email:", body.customerData?.email || "MANQUANT");
      console.log("📧 Customer Name:", `${body.customerData?.firstName || ""} ${body.customerData?.lastName || ""}`.trim() || "MANQUANT");
      console.log("📧 Cart items count:", body.cart?.items?.length || 0);
      console.log("📧 Cart total:", body.cart?.total || "MANQUANT");
      console.log("📧 Has address data:", !!body.addressData);

      const result = await this.emailService.sendOrderConfirmationEmail(
        req.body
      );

      console.log("📧 Order confirmation email sent successfully");
      console.log("📧 MessageId:", result.messageId);
      console.log("📧 Result:", JSON.stringify(result, null, 2));

      res.status(201).json({
        success: true,
        messageId: result.messageId,
        message: "Email de confirmation de commande envoyé avec succès",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Send order confirmation email error:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
      console.error("❌ Error name:", error.name);
      
      // Log plus de détails sur l'erreur
      if (error.message?.includes("transporter")) {
        console.error("❌ PROBLÈME: Le transporter Gmail n'est pas configuré!");
        console.error("❌ Vérifiez les variables d'environnement: GMAIL_USER, GMAIL_APP_PASSWORD");
      }
      if (error.message?.includes("Données manquantes")) {
        console.error("❌ PROBLÈME: Données manquantes dans la requête!");
        console.error("❌ Vérifiez que customerData.email, orderId et cart.items sont présents");
      }
      
      res.status(500).json({
        error: "Erreur interne du serveur",
        message: error.message || "Une erreur est survenue lors de l'envoi de l'email",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
