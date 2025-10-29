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
   * Envoyer un email au client
   * @param {Object} emailData Données de l'e-mail
   * @returns {Promise<Object>} Résultat d'envoi
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
   * @param {Object} confirmationData Données de confirmation
   * @returns {Promise<Object>} Résultat d'envoi
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
      const message = `
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

      const emailData = {
        to: { email: data.email, name: data.userName },
        subject,
        message,
        clientName: "Nature de Pierre",
        clientEmail: "admin@naturedepierre.com",
      };

      const result = await this.sendClientEmail(emailData);

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
   * Valider les données de confirmation de commande
   */
  private validateOrderConfirmationData(data: any): void {
    if (
      !data.customerEmail ||
      !data.customerName ||
      !data.orderId ||
      !data.items ||
      !data.shippingAddress
    ) {
      throw new Error(
        "Données manquantes pour l'envoi de l'email de confirmation"
      );
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("La liste des articles ne peut pas être vide");
    }

    if (
      !data.shippingAddress.firstName ||
      !data.shippingAddress.lastName ||
      !data.shippingAddress.address ||
      !data.shippingAddress.city ||
      !data.shippingAddress.postalCode ||
      !data.shippingAddress.country
    ) {
      throw new Error("L'adresse de livraison est incomplète");
    }
  }

  /**
   * Envoyer un email de confirmation de commande
   */
  async sendOrderConfirmationEmail(data: {
    customerEmail: string;
    customerName: string;
    orderId: number;
    orderDate: Date;
    items: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      vatRate?: number; // taux de TVA (%) optionnel
    }>;
    subtotal: number;
    tax: number;
    total: number;
    shippingAddress: {
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
    };
  }): Promise<any> {
    if (!this.transporter) {
      console.error("Gmail transporter not configured");
      throw new Error("Gmail transporter not configured");
    }

    // Valider les données
    this.validateOrderConfirmationData(data);

    try {
      // Générer les lignes HTML pour les articles (affichage HT/TVA/TTC)
      const itemsHtml = data.items
        .map((item) => {
          const rawVatAny: any = (item as any).vatRate;
          const parsedVat = Number(rawVatAny);
          const vatRate =
            Number.isFinite(parsedVat) && parsedVat >= 0 ? parsedVat : 21;
          const multiplier = 1 + vatRate / 100;
          const unitPriceHT = Number(item.unitPrice) / multiplier;
          const totalPriceHT = Number(item.totalPrice) / multiplier;

          return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${
              item.name
            }</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${
              item.quantity
            }</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${unitPriceHT.toFixed(
              2
            )} €</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${vatRate.toFixed(
              0
            )}%</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${totalPriceHT.toFixed(
              2
            )} €</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${Number(
              item.totalPrice
            ).toFixed(2)} €</td>
          </tr>
        `;
        })
        .join("");

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: data.customerEmail,
        subject: `Confirmation de commande #${data.orderId} - Nature de Pierre`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
            <!-- En-tête -->
            <div style="background: linear-gradient(135deg, #13686a 0%, #0dd3d1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">Merci pour votre commande !</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Commande #${
                data.orderId
              }</p>
            </div>
            
            <!-- Contenu -->
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
              <!-- Message de bienvenue -->
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Bonjour <strong>${data.customerName}</strong>,
              </p>
              <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 30px;">
                Nous avons bien reçu votre commande et nous vous remercions de votre confiance. 
                Votre paiement a été confirmé et votre commande est en cours de préparation.
              </p>

              <!-- Informations de commande -->
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h2 style="color: #13686a; font-size: 18px; margin: 0 0 15px 0;">📋 Détails de la commande</h2>
                <p style="margin: 5px 0; color: #666;"><strong>Numéro de commande:</strong> #${
                  data.orderId
                }</p>
                <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${new Date(
                  data.orderDate
                ).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</p>
              </div>

              <!-- Articles commandés -->
              <h2 style="color: #13686a; font-size: 18px; margin: 0 0 15px 0;">🛍️ Articles commandés</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; color: #13686a; font-size: 14px;">PRODUIT</th>
                    <th style="padding: 12px; text-align: center; color: #13686a; font-size: 14px;">QTÉ</th>
                    <th style="padding: 12px; text-align: right; color: #13686a; font-size: 14px;">PRIX UNIT. HT</th>
                    <th style="padding: 12px; text-align: right; color: #13686a; font-size: 14px;">TVA</th>
                    <th style="padding: 12px; text-align: right; color: #13686a; font-size: 14px;">TOTAL HT</th>
                    <th style="padding: 12px; text-align: right; color: #13686a; font-size: 14px;">TOTAL TTC</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Totaux -->
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Sous-total HT:</td>
                    <td style="padding: 8px 0; text-align: right; color: #666; font-size: 14px;">${Number(
                      data.subtotal
                    ).toFixed(2)} €</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">TVA:</td>
                    <td style="padding: 8px 0; text-align: right; color: #666; font-size: 14px;">${Number(
                      Number(data.total) - Number(data.subtotal)
                    ).toFixed(2)} €</td>
                  </tr>
                  <tr style="border-top: 2px solid #13686a;">
                    <td style="padding: 12px 0; color: #13686a; font-size: 18px; font-weight: bold;">Total TTC:</td>
                    <td style="padding: 12px 0; text-align: right; color: #13686a; font-size: 18px; font-weight: bold;">${Number(
                      data.total
                    ).toFixed(2)} €</td>
                  </tr>
                </table>
              </div>

              <!-- Adresse de livraison -->
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h2 style="color: #13686a; font-size: 18px; margin: 0 0 15px 0;">🚚 Adresse de livraison</h2>
                <p style="margin: 5px 0; color: #666;">${
                  data.shippingAddress.firstName
                } ${data.shippingAddress.lastName}</p>
                <p style="margin: 5px 0; color: #666;">${
                  data.shippingAddress.address
                }</p>
                <p style="margin: 5px 0; color: #666;">${
                  data.shippingAddress.postalCode
                } ${data.shippingAddress.city}</p>
                <p style="margin: 5px 0; color: #666;">${
                  data.shippingAddress.country
                }</p>
              </div>

              <!-- Prochaines étapes -->
              <div style="background: #e8f5f5; border-left: 4px solid #13686a; padding: 20px; margin-bottom: 30px;">
                <h3 style="color: #13686a; font-size: 16px; margin: 0 0 10px 0;">📦 Que se passe-t-il maintenant ?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666; line-height: 1.8;">
                  <li>Nous préparons votre commande avec soin</li>
                  <li>Votre commande sera expédiée dans les meilleurs délais</li>
                  <li>Nous vous contacterons si nous avons besoin d'informations complémentaires</li>
                  <li>Notre équipe reste à votre disposition pour toute question</li>
                </ul>
              </div>

              <!-- Contact -->
              <div style="text-align: center; padding: 20px; border-top: 2px solid #eee;">
                <p style="color: #666; font-size: 14px; margin: 10px 0;">
                  Une question ? Contactez-nous à <a href="mailto:contact@naturedepierre.com" style="color: #13686a;">contact@naturedepierre.com</a>
                </p>
                <p style="color: #999; font-size: 12px; margin: 10px 0;">
                  Nature de Pierre - Vente de pierres naturelles et minéraux
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
          Confirmation de commande #${data.orderId} - Nature de Pierre
          
          Bonjour ${data.customerName},
          
          Nous avons bien reçu votre commande et nous vous remercions de votre confiance.
          Votre paiement a été confirmé et votre commande est en cours de préparation.
          
          DÉTAILS DE LA COMMANDE
          Numéro: #${data.orderId}
          Date: ${new Date(data.orderDate).toLocaleDateString("fr-FR")}
          
          ARTICLES COMMANDÉS
          ${data.items
            .map(
              (item) =>
                `- ${item.name} x${item.quantity} : ${Number(
                  item.totalPrice
                ).toFixed(2)} €`
            )
            .join("\n")}
          
          TOTAUX
          Sous-total HT: ${Number(data.subtotal).toFixed(2)} €
          TVA : ${Number(Number(data.total) - Number(data.subtotal)).toFixed(
            2
          )} €
          Total TTC: ${Number(data.total).toFixed(2)} €
          
          ADRESSE DE LIVRAISON
          ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}
          ${data.shippingAddress.address}
          ${data.shippingAddress.postalCode} ${data.shippingAddress.city}
          ${data.shippingAddress.country}
          
          PROCHAINES ÉTAPES
          - Nous préparons votre commande avec soin
          - Votre commande sera expédiée dans les meilleurs délais
          - Notre équipe reste à votre disposition pour toute question
          
          Une question ? Contactez-nous à contact@naturedepierre.com
          
          Nature de Pierre - Vente de pierres naturelles et minéraux
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);

      return {
        messageId: result.messageId,
        status: "sent",
        recipient: data.customerEmail,
        subject: mailOptions.subject,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      throw error;
    }
  }

  /**
   * Vérifier la configuration Gmail
   * @returns {Object} État de la configuration
   */
  getConfigurationStatus(): any {
    return {
      gmailConfigured: !!this.transporter,
      adminEmail: this.adminEmail,
      gmailUser: process.env.GMAIL_USER ? "configured" : "not configured",
    };
  }
}
