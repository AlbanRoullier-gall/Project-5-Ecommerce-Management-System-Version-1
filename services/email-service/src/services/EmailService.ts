/**
 * EmailService - Version simplifiée pour Gmail
 * Business logic layer pour l'envoi d'emails via Gmail
 */

import nodemailer from "nodemailer";

export default class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private adminEmail: string;

  constructor() {
    this.adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    this.initializeGmailTransporter();
  }

  /**
   * Initialize Gmail transporter
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
   * Envoyer un email au client
   * @param {Object} emailData Email data
   * @returns {Promise<Object>} Send result
   */
  async sendClientEmail(emailData: any): Promise<any> {
    if (!this.transporter) {
      console.error("Gmail transporter not configured");
      return {
        messageId: "mock-id",
        status: "failed",
        recipient: emailData.to.email,
        subject: emailData.subject,
        sentAt: null,
        error: "Gmail transporter not configured",
      };
    }

    try {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: emailData.to.email,
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

      // Envoyer automatiquement la confirmation à l'admin (sans faire échouer l'envoi principal)
      try {
        await this.sendConfirmationEmail({
          clientName: emailData.clientName,
          clientEmail: emailData.clientEmail,
          subject: emailData.subject,
          message: emailData.message,
          sentAt: new Date(),
        });
      } catch (confirmationError) {
        console.warn("Failed to send confirmation email:", confirmationError);
        // Ne pas faire échouer l'envoi principal si la confirmation échoue
      }

      return {
        messageId: result.messageId,
        status: "sent",
        recipient: emailData.to.email,
        subject: emailData.subject,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error("Error sending client email:", error);
      throw error;
    }
  }

  /**
   * Envoyer une confirmation d'envoi à l'admin
   * @param {Object} confirmationData Confirmation data
   * @returns {Promise<Object>} Send result
   */
  async sendConfirmationEmail(confirmationData: any): Promise<any> {
    if (!this.transporter) {
      console.error("Gmail transporter not configured for confirmation");
      return {
        messageId: "mock-confirmation-id",
        status: "failed",
        recipient: this.adminEmail,
        subject: "Confirmation failed",
        sentAt: null,
        error: "Gmail transporter not configured",
      };
    }

    try {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: this.adminEmail,
        subject: `[CONFIRMATION] Email envoyé à ${confirmationData.clientName}`,
        html: `
          <h2>✅ Confirmation d'envoi d'email</h2>
          <p>Un email a été envoyé avec succès au client suivant :</p>
          <ul>
            <li><strong>Nom:</strong> ${confirmationData.clientName}</li>
            <li><strong>Email:</strong> ${confirmationData.clientEmail}</li>
            <li><strong>Sujet:</strong> ${confirmationData.subject}</li>
            <li><strong>Envoyé le:</strong> ${confirmationData.sentAt.toLocaleString()}</li>
          </ul>
          <hr>
          <h3>Contenu du message envoyé :</h3>
          <p>${confirmationData.message}</p>
        `,
        text: `
          CONFIRMATION D'ENVOI D'EMAIL
          
          Un email a été envoyé avec succès au client suivant :
          - Nom: ${confirmationData.clientName}
          - Email: ${confirmationData.clientEmail}
          - Sujet: ${confirmationData.subject}
          - Envoyé le: ${confirmationData.sentAt.toLocaleString()}
          
          Contenu du message envoyé :
          ${confirmationData.message}
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);

      return {
        messageId: result.messageId,
        status: "sent",
        recipient: this.adminEmail,
        subject: mailOptions.subject,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      throw error;
    }
  }

  /**
   * Envoyer un email de demande d'approbation backoffice
   */
  async sendBackofficeApprovalRequest(data: {
    userFullName: string;
    userEmail: string;
    approvalUrl: string;
    rejectionUrl: string;
  }): Promise<any> {
    if (!this.transporter) {
      console.error("Gmail transporter not configured");
      throw new Error("Gmail transporter not configured");
    }

    try {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: this.adminEmail,
        subject: `[BACKOFFICE] Nouvelle demande d'accès - ${data.userFullName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #13686a;">Nouvelle demande d'accès au backoffice</h2>
            <p><strong>Nom:</strong> ${data.userFullName}</p>
            <p><strong>Email:</strong> ${data.userEmail}</p>
            <p><strong>Date de demande:</strong> ${new Date().toLocaleString(
              "fr-FR"
            )}</p>
            
            <h3>Actions disponibles:</h3>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${data.approvalUrl}" 
                 style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px; display: inline-block;">
                ✅ APPROUVER
              </a>
              <a href="${data.rejectionUrl}" 
                 style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                ❌ REJETER
              </a>
            </p>
            
            <p><em>Ces liens sont valides pendant 24 heures.</em></p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Nature de Pierre - Interface d'administration
            </p>
          </div>
        `,
        text: `
          Nouvelle demande d'accès au backoffice
          
          Nom: ${data.userFullName}
          Email: ${data.userEmail}
          Date de demande: ${new Date().toLocaleString("fr-FR")}
          
          Pour approuver: ${data.approvalUrl}
          Pour rejeter: ${data.rejectionUrl}
          
          Ces liens sont valides pendant 24 heures.
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);

      return {
        messageId: result.messageId,
        status: "sent",
        recipient: this.adminEmail,
        subject: mailOptions.subject,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error("Error sending backoffice approval request:", error);
      throw error;
    }
  }

  /**
   * Envoyer un email de confirmation d'approbation backoffice
   */
  async sendBackofficeApprovalConfirmation(data: {
    userEmail: string;
    userFullName: string;
    backofficeUrl: string;
  }): Promise<any> {
    if (!this.transporter) {
      console.error("Gmail transporter not configured");
      throw new Error("Gmail transporter not configured");
    }

    try {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: data.userEmail,
        subject: "Accès au backoffice approuvé - Nature de Pierre",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Félicitations !</h2>
            <p>Bonjour ${data.userFullName},</p>
            <p>Votre demande d'accès au backoffice a été approuvée.</p>
            <p>Vous pouvez maintenant vous connecter à l'interface d'administration :</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${data.backofficeUrl}" 
                 style="background-color: #13686a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Accéder au backoffice
              </a>
            </p>
            <p>Cordialement,<br>L'équipe d'administration Nature de Pierre</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Nature de Pierre - Interface d'administration
            </p>
          </div>
        `,
        text: `
          Félicitations !
          
          Bonjour ${data.userFullName},
          
          Votre demande d'accès au backoffice a été approuvée.
          
          Vous pouvez maintenant vous connecter : ${data.backofficeUrl}
          
          Cordialement,
          L'équipe d'administration Nature de Pierre
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);

      return {
        messageId: result.messageId,
        status: "sent",
        recipient: data.userEmail,
        subject: mailOptions.subject,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error("Error sending backoffice approval confirmation:", error);
      throw error;
    }
  }

  /**
   * Envoyer un email de notification de rejet backoffice
   */
  async sendBackofficeRejectionNotification(data: {
    userEmail: string;
    userFullName: string;
  }): Promise<any> {
    if (!this.transporter) {
      console.error("Gmail transporter not configured");
      throw new Error("Gmail transporter not configured");
    }

    try {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: data.userEmail,
        subject: "Demande d'accès au backoffice rejetée - Nature de Pierre",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">Notification</h2>
            <p>Bonjour ${data.userFullName},</p>
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
          
          Bonjour ${data.userFullName},
          
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
        recipient: data.userEmail,
        subject: mailOptions.subject,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error("Error sending backoffice rejection notification:", error);
      throw error;
    }
  }

  /**
   * Vérifier la configuration Gmail
   * @returns {Object} Configuration status
   */
  getConfigurationStatus(): any {
    return {
      gmailConfigured: !!this.transporter,
      adminEmail: this.adminEmail,
      gmailUser: process.env.GMAIL_USER ? "configured" : "not configured",
    };
  }
}
