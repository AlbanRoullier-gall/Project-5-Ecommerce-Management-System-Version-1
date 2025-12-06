/**
 * EmailService - Version simplifiée pour Gmail
 * Business logic layer pour l'envoi d'emails via Gmail
 */

import nodemailer from "nodemailer";

export default class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private adminEmail: string;
  private adminName: string;

  constructor() {
    this.adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    this.adminName = process.env.ADMIN_NAME || "Nature de Pierre";
    this.initializeGmailTransporter();
  }

  /**
   * Initialiser le transporteur Gmail
   */
  private initializeGmailTransporter(): void {
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      // Essayer d'abord avec le mot de passe nettoyé
      const cleanPassword = process.env.GMAIL_APP_PASSWORD.replace(/\s/g, "");
      console.log(
        "🔧 Testing with cleaned password:",
        cleanPassword.substring(0, 10) + "..."
      );

      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: cleanPassword, // Mot de passe nettoyé
        },
      });
      console.log("✅ Gmail transporter initialized with cleaned password");
    } else {
      console.warn("⚠️ Gmail credentials not configured");
    }
  }

  /**
   * Envoyer un email au client (formulaire de contact)
   * Le destinataire est déterminé depuis ADMIN_EMAIL (configuré côté serveur)
   * @param {Object} emailData Données de l'e-mail (sans champ to)
   * @returns {Promise<Object>} Résultat d'envoi
   */
  async sendClientEmail(emailData: any): Promise<any> {
    if (!this.transporter) {
      console.error("Gmail transporter not configured");
      return {
        messageId: "mock-id",
        status: "failed",
        recipient: this.adminEmail,
        subject: emailData.subject,
        sentAt: null,
        error: "Gmail transporter not configured",
      };
    }

    try {
      // Le destinataire est toujours déterminé depuis ADMIN_EMAIL
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: this.adminEmail,
        subject: emailData.subject,
        html: `
          <h2>Message de ${emailData.clientName}</h2>
          <p><strong>Email:</strong> ${emailData.clientEmail}</p>
          <p><strong>Sujet:</strong> ${emailData.subject}</p>
          <hr>
          <p>${emailData.message}</p>
          <hr>
          <p><em>Ce message a été envoyé depuis votre site web.</em></p>
        `,
        text: `
          Message de ${emailData.clientName}
          Email: ${emailData.clientEmail}
          Sujet: ${emailData.subject}
          
          ${emailData.message}
          
          Ce message a été envoyé depuis votre site web.
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);

      return {
        messageId: result.messageId,
        status: "sent",
        recipient: this.adminEmail,
        subject: emailData.subject,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error("Error sending client email:", error);
      throw error;
    }
  }

  /**
   * Envoyer un email de demande d'approbation backoffice
   */
  /**
   * Construire userFullName à partir de user object ou userFullName
   */
  private buildUserFullName(data: {
    userFullName?: string;
    user?: { firstName?: string; lastName?: string };
  }): string {
    if (data.userFullName) {
      return data.userFullName;
    }
    if (data.user) {
      return `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim();
    }
    return "Utilisateur";
  }

  /**
   * Envoyer un email de notification de rejet backoffice
   */
  async sendBackofficeRejectionNotification(data: {
    userEmail?: string;
    userFullName?: string;
    user?: { firstName?: string; lastName?: string; email?: string };
  }): Promise<any> {
    if (!this.transporter) {
      console.error("Gmail transporter not configured");
      throw new Error("Gmail transporter not configured");
    }

    const userFullName = this.buildUserFullName(data);
    const userEmail = data.user?.email || data.userEmail;
    if (!userEmail) {
      throw new Error("userEmail est requis");
    }

    try {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: userEmail,
        subject: "Demande d'accès au backoffice rejetée - Nature de Pierre",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">Notification</h2>
            <p>Bonjour ${userFullName},</p>
            <p>Votre demande d'accès au backoffice a été rejetée.</p>
            <p>Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur.</p>
            <p>Cordialement,<br>L'équipe d'administration Nature de Pierre</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Nature de Pierre - Interface d'administration
            </p>
          </div>
        `,
        text: `
          Notification
          
          Bonjour ${userFullName},
          
          Votre demande d'accès au backoffice a été rejetée.
          Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur.
          
          Cordialement,
          L'équipe d'administration Nature de Pierre
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);

      return {
        messageId: result.messageId,
        status: "sent",
        recipient: userEmail,
        subject: mailOptions.subject,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error("Error sending backoffice rejection notification:", error);
      throw error;
    }
  }

  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  async sendResetPasswordEmail(data: {
    email: string;
    token: string;
    userName: string;
    resetUrl: string;
  }): Promise<any> {
    if (!this.transporter) {
      console.error("Gmail transporter not configured");
      throw new Error("Gmail transporter not configured");
    }

    try {
      const subject =
        "Réinitialisation de votre mot de passe - Nature de Pierre";
      const htmlMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #13686a;">Réinitialisation de votre mot de passe</h2>
          <p>Bonjour ${data.userName},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Nature de Pierre.</p>
          <p>Pour réinitialiser votre mot de passe, cliquez sur le lien ci-dessous :</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}?token=${data.token}" 
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

      const textMessage = `
Réinitialisation de votre mot de passe - Nature de Pierre

Bonjour ${data.userName},

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Nature de Pierre.

Pour réinitialiser votre mot de passe, cliquez sur le lien ci-dessous :
${data.resetUrl}?token=${data.token}

Ce lien est valide pendant 15 minutes.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

---
Nature de Pierre - Interface d'administration
Cet email a été envoyé automatiquement, merci de ne pas y répondre.
      `;

      // Envoyer directement à l'utilisateur (pas via sendClientEmail qui envoie à l'admin)
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: data.email, // Envoyer à l'adresse de l'utilisateur qui demande la réinitialisation
        subject: subject,
        html: htmlMessage,
        text: textMessage,
      };

      const result = await this.transporter.sendMail(mailOptions);

      return {
        messageId: result.messageId,
        status: "sent",
        recipient: data.email,
        subject: subject,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error("Error sending reset password email:", error);
      throw error;
    }
  }

  /**
   * Envoyer un email de confirmation de commande
   * Format simplifié : accepte directement les données brutes depuis l'API Gateway
   */
  async sendOrderConfirmationEmail(data: {
    orderId: number;
    cart: {
      items: Array<{
        productName: string;
        quantity: number;
        unitPriceTTC: number;
        totalPriceTTC: number;
        vatRate: number;
        [key: string]: any; // Accepter les champs supplémentaires
      }>;
      subtotal: number;
      tax: number;
      total: number;
    };
    customerData: {
      email: string;
      firstName?: string;
      lastName?: string;
    };
    addressData: {
      shipping?: {
        address?: string;
        postalCode?: string;
        city?: string;
        countryName?: string;
      };
    };
  }): Promise<any> {
    if (!this.transporter) {
      throw new Error("Gmail transporter not configured");
    }

    // Validation basique
    if (
      !data.customerData?.email ||
      !data.orderId ||
      !data.cart?.items?.length
    ) {
      console.error("❌ Validation failed - missing data:", {
        hasEmail: !!data.customerData?.email,
        hasOrderId: !!data.orderId,
        hasItems: !!data.cart?.items?.length,
        itemsCount: data.cart?.items?.length || 0,
      });
      throw new Error(
        "Données manquantes pour l'envoi de l'email de confirmation"
      );
    }

    try {
      // Construire les données formatées
      const customerName =
        `${data.customerData.firstName || ""} ${
          data.customerData.lastName || ""
        }`.trim() || "Client";
      const customerEmail = data.customerData.email;
      const shipping = data.addressData.shipping || {};

      // Générer les lignes HTML pour les articles
      const itemsHtml = data.cart.items
        .map((item, index) => {
          const vatRate = Number(item.vatRate) || 21;
          const multiplier = 1 + vatRate / 100;
          const unitPriceHT = Number(item.unitPriceTTC) / multiplier;
          const totalPriceHT = Number(item.totalPriceTTC) / multiplier;
          const isLast = index === data.cart.items.length - 1;

          return `
            <tr style="background-color: ${
              index % 2 === 0 ? "#ffffff" : "#fafafa"
            };">
              <td style="padding: 15px; border-bottom: ${
                isLast ? "none" : "1px solid #e0e0e0"
              }; border-right: 1px solid #e0e0e0; color: #333; font-size: 14px;">${
            item.productName
          }</td>
              <td style="padding: 15px; border-bottom: ${
                isLast ? "none" : "1px solid #e0e0e0"
              }; border-right: 1px solid #e0e0e0; text-align: center; color: #333; font-size: 14px;">${
            item.quantity
          }</td>
              <td style="padding: 15px; border-bottom: ${
                isLast ? "none" : "1px solid #e0e0e0"
              }; border-right: 1px solid #e0e0e0; text-align: right; color: #333; font-size: 14px;">${unitPriceHT.toFixed(
            2
          )} €</td>
              <td style="padding: 15px; border-bottom: ${
                isLast ? "none" : "1px solid #e0e0e0"
              }; border-right: 1px solid #e0e0e0; text-align: right; color: #333; font-size: 14px;">${vatRate.toFixed(
            0
          )}%</td>
              <td style="padding: 15px; border-bottom: ${
                isLast ? "none" : "1px solid #e0e0e0"
              }; border-right: 1px solid #e0e0e0; text-align: right; color: #333; font-size: 14px;">${totalPriceHT.toFixed(
            2
          )} €</td>
              <td style="padding: 15px; border-bottom: ${
                isLast ? "none" : "1px solid #e0e0e0"
              }; text-align: right; color: #333; font-size: 14px; font-weight: 600;">${Number(
            item.totalPriceTTC
          ).toFixed(2)} €</td>
            </tr>
          `;
        })
        .join("");

      const orderDate = new Date();
      const subtotal = Number(data.cart.subtotal);
      const tax = Number(data.cart.tax);
      const total = Number(data.cart.total);

      const formattedDate = orderDate.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: customerEmail,
        subject: `Facture #${data.orderId} - Confirmation de commande - Nature de Pierre`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background-color: #ffffff; padding: 0;">
            <!-- En-tête de facture -->
            <div style="background: linear-gradient(135deg, #13686a 0%, #0dd3d1 100%); color: white; padding: 40px 40px 30px 40px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
                <div>
                  <h1 style="margin: 0; font-size: 32px; font-weight: bold;">Nature de Pierre</h1>
                  <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Vente de pierres naturelles et minéraux</p>
                </div>
                <div style="text-align: right; background: rgba(255,255,255,0.2); padding: 15px 25px; border-radius: 8px;">
                  <div style="font-size: 12px; opacity: 0.9; margin-bottom: 5px;">FACTURE</div>
                  <div style="font-size: 24px; font-weight: bold;">#${
                    data.orderId
                  }</div>
                </div>
              </div>
            </div>

            <!-- Informations facture -->
            <div style="padding: 30px 40px; background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">
              <div style="display: flex; justify-content: space-between; gap: 40px;">
                <div style="flex: 1;">
                  <h3 style="color: #13686a; font-size: 14px; text-transform: uppercase; margin: 0 0 15px 0; letter-spacing: 1px;">Facturé à</h3>
                  <div style="color: #333; font-size: 14px; line-height: 1.8;">
                    <p style="margin: 0 0 5px 0; font-weight: bold;">${customerName}</p>
                    <p style="margin: 0 0 5px 0;">${customerEmail}</p>
                    ${
                      shipping.address
                        ? `
                        <p style="margin: 10px 0 0 0; padding-top: 10px; border-top: 1px solid #ddd;">
                          ${shipping.address}<br>
                          ${shipping.postalCode || ""} ${
                            shipping.city || ""
                          }<br>
                          ${shipping.countryName || ""}
                        </p>
                        `
                        : ""
                    }
                  </div>
                </div>
                <div style="flex: 1; text-align: right;">
                  <h3 style="color: #13686a; font-size: 14px; text-transform: uppercase; margin: 0 0 15px 0; letter-spacing: 1px;">Informations</h3>
                  <div style="color: #333; font-size: 14px; line-height: 1.8;">
                    <p style="margin: 0 0 5px 0;"><strong>Date d'émission:</strong><br>${formattedDate}</p>
                    <p style="margin: 10px 0 0 0;"><strong>Date de commande:</strong><br>${formattedDate}</p>
                    <p style="margin: 10px 0 0 0; padding-top: 10px; border-top: 1px solid #ddd;">
                      <strong>Statut:</strong><br>
                      <span style="color: #10b981; font-weight: bold;">✓ Paiement confirmé</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Corps de la facture -->
            <div style="padding: 40px; background: white;">
              <!-- Tableau des articles -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #e0e0e0;">
                <thead>
                  <tr style="background-color: #13686a; color: white;">
                    <th style="padding: 15px; text-align: left; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid rgba(255,255,255,0.2);">Désignation</th>
                    <th style="padding: 15px; text-align: center; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid rgba(255,255,255,0.2);">Qté</th>
                    <th style="padding: 15px; text-align: right; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid rgba(255,255,255,0.2);">Prix unit. HT</th>
                    <th style="padding: 15px; text-align: right; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid rgba(255,255,255,0.2);">TVA</th>
                    <th style="padding: 15px; text-align: right; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-right: 1px solid rgba(255,255,255,0.2);">Total HT</th>
                    <th style="padding: 15px; text-align: right; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total TTC</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Totaux -->
              <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
                <table style="width: 300px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 15px; text-align: right; color: #666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">Sous-total HT</td>
                    <td style="padding: 10px 15px; text-align: right; color: #333; font-size: 14px; font-weight: 500; border-bottom: 1px solid #e0e0e0;">${subtotal.toFixed(
                      2
                    )} €</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 15px; text-align: right; color: #666; font-size: 14px; border-bottom: 1px solid #e0e0e0;">TVA</td>
                    <td style="padding: 10px 15px; text-align: right; color: #333; font-size: 14px; font-weight: 500; border-bottom: 1px solid #e0e0e0;">${tax.toFixed(
                      2
                    )} €</td>
                  </tr>
                  <tr style="background-color: #f8f9fa;">
                    <td style="padding: 15px; text-align: right; color: #13686a; font-size: 18px; font-weight: bold; border: 2px solid #13686a; border-right: none;">TOTAL TTC</td>
                    <td style="padding: 15px; text-align: right; color: #13686a; font-size: 18px; font-weight: bold; border: 2px solid #13686a; border-left: none;">${total.toFixed(
                      2
                    )} €</td>
                  </tr>
                </table>
              </div>

              <!-- Message de confirmation -->
              <div style="background: #e8f5f5; border-left: 4px solid #13686a; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #13686a; font-size: 15px; font-weight: 600;">
                  ✓ Paiement reçu et confirmé
                </p>
                <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
                  Votre commande est en cours de préparation et sera expédiée dans les meilleurs délais. 
                </p>
              </div>

              <!-- Mentions légales -->
              <div style="border-top: 2px solid #e0e0e0; padding-top: 30px; margin-top: 40px;">
                <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0 0 10px 0;">
                  <strong>Nature de Pierre</strong><br>
                  Vente de pierres naturelles et minéraux<br>
                  Email: <a href="mailto:contact@naturedepierre.com" style="color: #13686a;">contact@naturedepierre.com</a>
                </p>
                <p style="color: #999; font-size: 11px; line-height: 1.6; margin: 15px 0 0 0; font-style: italic;">
                  Cette facture est générée automatiquement suite à votre commande en ligne. 
                  Elle fait office de confirmation de commande et de justificatif de paiement.
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
═══════════════════════════════════════════════════════════════
                    FACTURE #${data.orderId}
                    Nature de Pierre
═══════════════════════════════════════════════════════════════

Date d'émission: ${formattedDate}
Date de commande: ${formattedDate}
Statut: ✓ Paiement confirmé

───────────────────────────────────────────────────────────────
FACTURÉ À
───────────────────────────────────────────────────────────────
${customerName}
${customerEmail}
${
  shipping.address
    ? `
${shipping.address}
${shipping.postalCode || ""} ${shipping.city || ""}
${shipping.countryName || ""}
`
    : ""
}

───────────────────────────────────────────────────────────────
DÉTAILS DE LA FACTURE
───────────────────────────────────────────────────────────────

${data.cart.items
  .map((item, index) => {
    const vatRate = Number(item.vatRate) || 21;
    const multiplier = 1 + vatRate / 100;
    const unitPriceHT = Number(item.unitPriceTTC) / multiplier;
    const totalPriceHT = Number(item.totalPriceTTC) / multiplier;
    return `${index + 1}. ${item.productName}
   Quantité: ${item.quantity}
   Prix unitaire HT: ${unitPriceHT.toFixed(2)} €
   TVA: ${vatRate.toFixed(0)}%
   Total HT: ${totalPriceHT.toFixed(2)} €
   Total TTC: ${Number(item.totalPriceTTC).toFixed(2)} €`;
  })
  .join("\n\n")}

───────────────────────────────────────────────────────────────
TOTAUX
───────────────────────────────────────────────────────────────
Sous-total HT: ${subtotal.toFixed(2)} €
TVA: ${tax.toFixed(2)} €
───────────────────────────────────────────────────────────────
TOTAL TTC: ${total.toFixed(2)} €
───────────────────────────────────────────────────────────────

✓ Paiement reçu et confirmé
Votre commande est en cours de préparation et sera expédiée dans les meilleurs délais.

───────────────────────────────────────────────────────────────
Nature de Pierre
Vente de pierres naturelles et minéraux
Email: contact@naturedepierre.com

Cette facture est générée automatiquement suite à votre commande en ligne.
Elle fait office de confirmation de commande et de justificatif de paiement.
═══════════════════════════════════════════════════════════════
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);

      return {
        messageId: result.messageId,
        status: "sent",
        recipient: customerEmail,
        subject: mailOptions.subject,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      throw error;
    }
  }
}
