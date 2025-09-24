/**
 * Service Email - Gestion des emails de contact
 *
 * Ce service gère l'envoi d'emails de contact depuis le site web
 * et l'envoi d'emails de confirmation aux clients.
 */

// ===== IMPORTS ET CONFIGURATION =====
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const nodemailer = require("nodemailer");
const Joi = require("joi");
require("dotenv").config();

// Configuration du serveur Express
const app = express();
const PORT = process.env.PORT || 3007;

/**
 * Configuration du transporteur email avec Gmail
 * Utilise les identifiants Gmail pour l'envoi d'emails
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "u4999410740@gmail.com",
    pass: "vyli fdmp hrww jvlz",
  },
});

// ===== MIDDLEWARES =====
/**
 * Configuration des middlewares de sécurité et de logging
 */
app.use(helmet()); // Sécurité HTTP
app.use(cors()); // Gestion CORS
app.use(express.json()); // Parsing JSON
app.use(morgan("combined")); // Logging des requêtes

// Note: Pas de schéma de validation Joi global - validation manuelle dans les routes

// ===== ROUTES =====

/**
 * Route de santé du service
 * Permet de vérifier que le service email fonctionne correctement
 */
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "email-service" });
});

/**
 * Route principale pour l'envoi d'emails de contact
 *
 * Traite les demandes de contact depuis le site web :
 * 1. Valide l'email du client
 * 2. Envoie un email à l'entreprise
 * 3. Envoie un email de confirmation au client
 *
 * @param {Object} req.body - Données du formulaire de contact
 * @param {string} req.body.email - Email du client (obligatoire)
 * @param {string} [req.body.name] - Nom du client (optionnel)
 * @param {string} [req.body.subject] - Sujet du message (optionnel)
 * @param {string} [req.body.message] - Message du client (optionnel)
 */
app.post("/api/contact", async (req, res) => {
  try {
    // ===== VALIDATION DES DONNÉES =====
    /**
     * Validation de l'email (seul champ obligatoire)
     * Les autres champs sont optionnels avec des valeurs par défaut
     */
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        error: "Validation error",
        details: "Email is required",
      });
    }

    // Validation du format email avec Joi
    const emailValidation = Joi.string().email().validate(email);
    if (emailValidation.error) {
      return res.status(400).json({
        error: "Validation error",
        details: "Email must be valid",
      });
    }

    // ===== EXTRACTION ET PRÉPARATION DES DONNÉES =====
    /**
     * Extraction des autres champs avec valeurs par défaut
     * Permet de gérer les formulaires partiellement remplis
     */
    const name = req.body.name || "";
    const subject = req.body.subject || "";
    const message = req.body.message || "";

    // Préparation du contenu d'affichage avec fallbacks
    const displayName = name || "Non renseigné";
    const displaySubject = subject || "Sans objet";
    const displayMessage = message || "Aucun message";

    // ===== PRÉPARATION DU CONTENU EMAIL POUR L'ENTREPRISE =====
    /**
     * Template HTML pour l'email envoyé à l'entreprise
     * Utilise les couleurs de la marque Nature de Pierre
     */
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #13686a;">Nouveau message de contact</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nom:</strong> ${displayName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Sujet:</strong> ${displaySubject}</p>
        </div>
        <div style="background-color: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h3 style="color: #13686a; margin-top: 0;">Message:</h3>
          <p style="line-height: 1.6; white-space: pre-wrap;">${displayMessage}</p>
        </div>
        <div style="margin-top: 20px; padding: 15px; background-color: #d9b970; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #333;">
            <strong>Répondre à:</strong> ${email}
          </p>
        </div>
      </div>
    `;

    /**
     * Version texte brut de l'email pour les clients qui ne supportent pas HTML
     */
    const textContent = `
Nouveau message de contact

Nom: ${displayName}
Email: ${email}
Sujet: ${displaySubject}

Message:
${displayMessage}

---
Répondre à: ${email}
    `;

    // ===== CONFIGURATION ET ENVOI DE L'EMAIL À L'ENTREPRISE =====
    /**
     * Options pour l'email envoyé à l'entreprise
     * Le replyTo permet de répondre directement au client
     */
    const mailOptions = {
      from: "u4999410740@gmail.com",
      to: "u4999410740@gmail.com", // Adresse email de l'entreprise
      replyTo: email, // Permet de répondre directement au client
      subject: `[Contact] ${displaySubject} - ${displayName}`,
      html: htmlContent,
      text: textContent,
    };

    // Envoi de l'email à l'entreprise
    const info = await transporter.sendMail(mailOptions);

    // ===== ENVOI DE L'EMAIL DE CONFIRMATION AU CLIENT =====
    /**
     * Envoi d'un email de confirmation au client
     * Cette étape est optionnelle - si elle échoue, la requête principale reste valide
     */
    try {
      /**
       * Template HTML pour l'email de confirmation client
       * Design professionnel avec les couleurs de la marque
       */
      const confirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #13686a; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Nature de Pierre</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Confirmation de réception</p>
          </div>
          
          <div style="padding: 30px 20px; background-color: #f8f9fa;">
            <h2 style="color: #13686a; margin-top: 0;">Bonjour ${displayName},</h2>
            
            <p>Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d9b970;">
              <h3 style="color: #13686a; margin-top: 0;">Récapitulatif de votre message :</h3>
              <p><strong>Sujet :</strong> ${displaySubject}</p>
              <p><strong>Message :</strong></p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 10px;">
                <p style="margin: 0; white-space: pre-wrap;">${displayMessage}</p>
              </div>
            </div>
            
            <p>Notre équipe examinera votre demande et vous répondra dans les plus brefs délais.</p>
            
            <p style="color: #666; font-size: 14px;">
              Cordialement,<br>
              L'équipe Nature de Pierre
            </p>
          </div>
          
          <div style="background-color: #13686a; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 Nature de Pierre - Tous droits réservés</p>
          </div>
        </div>
      `;

      /**
       * Version texte brut de l'email de confirmation
       */
      const confirmationText = `
Nature de Pierre - Confirmation de réception

Bonjour ${displayName},

Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.

Récapitulatif de votre message :
Sujet : ${displaySubject}
Message : ${displayMessage}

Notre équipe examinera votre demande et vous répondra dans les plus brefs délais.

Cordialement,
L'équipe Nature de Pierre
      `;

      /**
       * Configuration de l'email de confirmation
       */
      const confirmationMailOptions = {
        from: "u4999410740@gmail.com",
        to: email, // Email du client
        subject: `Confirmation de réception - ${displaySubject}`,
        html: confirmationHtml,
        text: confirmationText,
      };

      // Envoi de l'email de confirmation
      await transporter.sendMail(confirmationMailOptions);
      console.log("Email de confirmation envoyé à:", email);
    } catch (confirmationError) {
      /**
       * Gestion des erreurs de confirmation
       * L'erreur de confirmation n'affecte pas la requête principale
       */
      console.error(
        "Erreur lors de l'envoi de la confirmation:",
        confirmationError
      );
      // On ne fait pas échouer la requête principale si la confirmation échoue
    }

    // ===== RÉPONSE DE SUCCÈS =====
    /**
     * Retour de la réponse de succès avec l'ID du message
     */
    res.status(200).json({
      message: "Email de contact envoyé avec succès",
      messageId: info.messageId,
    });
  } catch (error) {
    /**
     * Gestion des erreurs principales
     * Log l'erreur et retourne une réponse d'erreur appropriée
     */
    console.error("Erreur lors de l'envoi de l'email:", error);
    res.status(500).json({
      error: "Erreur lors de l'envoi de l'email de contact",
    });
  }
});

// ===== GESTION DES ERREURS GLOBALES =====
/**
 * Middleware de gestion des erreurs globales
 * Capture toutes les erreurs non gérées dans l'application
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

/**
 * Handler pour les routes non trouvées (404)
 * Doit être placé en dernier pour capturer toutes les routes non définies
 */
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// ===== DÉMARRAGE DU SERVEUR =====
/**
 * Démarrage du serveur sur le port configuré
 */
app.listen(PORT, () => {
  console.log(`Service Email de contact démarré sur le port ${PORT}`);
});
