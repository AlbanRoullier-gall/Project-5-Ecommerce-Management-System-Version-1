const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const nodemailer = require("nodemailer");
const Joi = require("joi");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3007;

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "u4999410740@gmail.com",
    pass: "vyli fdmp hrww jvlz",
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

// Validation schema for contact form
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  subject: Joi.string().min(5).max(200).required(),
  message: Joi.string().min(10).max(2000).required(),
});

// Routes

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "email-service" });
});

// Send contact email
app.post("/api/contact", async (req, res) => {
  try {
    // Validate input
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation error",
        details: error.details[0].message,
      });
    }

    const { name, email, subject, message } = value;

    // Prepare email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #13686a;">Nouveau message de contact</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Sujet:</strong> ${subject}</p>
        </div>
        <div style="background-color: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h3 style="color: #13686a; margin-top: 0;">Message:</h3>
          <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
        <div style="margin-top: 20px; padding: 15px; background-color: #d9b970; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #333;">
            <strong>Répondre à:</strong> ${email}
          </p>
        </div>
      </div>
    `;

    const textContent = `
Nouveau message de contact

Nom: ${name}
Email: ${email}
Sujet: ${subject}

Message:
${message}

---
Répondre à: ${email}
    `;

    // Email options
    const mailOptions = {
      from: "u4999410740@gmail.com",
      to: "u4999410740@gmail.com", // Votre adresse email
      replyTo: email, // Permet de répondre directement au client
      subject: `[Contact] ${subject} - ${name}`,
      html: htmlContent,
      text: textContent,
    };

    // Send email to business
    const info = await transporter.sendMail(mailOptions);

    // Send confirmation email to customer
    try {
      const confirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #13686a; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Nature de Pierre</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Confirmation de réception</p>
          </div>
          
          <div style="padding: 30px 20px; background-color: #f8f9fa;">
            <h2 style="color: #13686a; margin-top: 0;">Bonjour ${name},</h2>
            
            <p>Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d9b970;">
              <h3 style="color: #13686a; margin-top: 0;">Récapitulatif de votre message :</h3>
              <p><strong>Sujet :</strong> ${subject}</p>
              <p><strong>Message :</strong></p>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 10px;">
                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
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

      const confirmationText = `
Nature de Pierre - Confirmation de réception

Bonjour ${name},

Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.

Récapitulatif de votre message :
Sujet : ${subject}
Message : ${message}

Notre équipe examinera votre demande et vous répondra dans les plus brefs délais.

Cordialement,
L'équipe Nature de Pierre
      `;

      const confirmationMailOptions = {
        from: "u4999410740@gmail.com",
        to: email, // Email du client
        subject: `Confirmation de réception - ${subject}`,
        html: confirmationHtml,
        text: confirmationText,
      };

      await transporter.sendMail(confirmationMailOptions);
      console.log("Email de confirmation envoyé à:", email);
    } catch (confirmationError) {
      console.error(
        "Erreur lors de l'envoi de la confirmation:",
        confirmationError
      );
      // On ne fait pas échouer la requête principale si la confirmation échoue
    }

    res.status(200).json({
      message: "Email de contact envoyé avec succès",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    res.status(500).json({
      error: "Erreur lors de l'envoi de l'email de contact",
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

app.listen(PORT, () => {
  console.log(`Service Email de contact démarré sur le port ${PORT}`);
});
