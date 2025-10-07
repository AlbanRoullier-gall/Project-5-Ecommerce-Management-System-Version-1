/**
 * Handlers spécialisés pour l'authentification
 * Gère les flux complexes nécessitant plusieurs services
 */

import { Request, Response } from "express";
import { SERVICES } from "../config";

/**
 * Handler pour la réinitialisation de mot de passe
 * Orchestre l'appel entre Auth Service et Email Service
 */
export const handlePasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email requis",
        message: "L'adresse email est obligatoire",
      });
    }

    console.log(`🔄 Demande de réinitialisation pour: ${email}`);

    // 1. Appel au Auth Service pour générer le token
    console.log("📞 Appel au Auth Service...");
    let authData: any;

    try {
      const authResponse = await fetch(
        `${SERVICES.auth}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Service-Request": "api-gateway",
          },
          body: JSON.stringify({ email }),
        }
      );

      authData = (await authResponse.json()) as any;

      if (!authResponse.ok) {
        console.log(`❌ Auth Service error: ${authData.message}`);
        throw new Error(`Auth Service error: ${authData.message}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'appel à l'Auth Service:`, error);
      return res.status(500).json({
        error: "Service d'authentification indisponible",
        message: "Veuillez réessayer plus tard",
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`✅ Token généré: ${authData.token ? "Oui" : "Non"}`);

    // 2. Appel au Email Service pour envoyer l'email
    console.log("📧 Appel au Email Service...");
    let emailData: any;

    try {
      const emailResponse = await fetch(
        `${SERVICES.email}/api/email/send-reset-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Service-Request": "api-gateway",
          },
          body: JSON.stringify({
            email: email,
            token: authData.token,
            userName: authData.userName || "Utilisateur",
            resetUrl: `${
              process.env["FRONTEND_URL"] || "http://localhost:3009"
            }/reset-password`,
          }),
        }
      );

      emailData = (await emailResponse.json()) as any;

      if (!emailResponse.ok) {
        throw new Error(`Email Service error: ${emailData.message}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'appel à l'Email Service:`, error);
      return res.status(500).json({
        error: "Service d'email indisponible",
        message: "Veuillez réessayer plus tard",
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`✅ Email envoyé avec succès: ${emailData.messageId || "N/A"}`);

    // 3. Retourner succès au back-office
    return res.json({
      success: true,
      message: "Email de réinitialisation envoyé",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Password reset error:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
      message: "Veuillez réessayer plus tard",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Handler pour la confirmation de réinitialisation de mot de passe
 * Utilise le DTO PasswordResetDTO et appelle directement le Auth Service
 */
export const handlePasswordResetConfirm = async (
  req: Request,
  res: Response
) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: "Token et nouveau mot de passe requis",
        message: "Le token et le nouveau mot de passe sont obligatoires",
      });
    }

    console.log(
      `🔄 Confirmation de réinitialisation pour token: ${token.substring(
        0,
        8
      )}...`
    );

    // Validation du mot de passe côté client
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Mot de passe invalide",
        message: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    // Appel direct au Auth Service avec le DTO PasswordResetDTO
    const authResponse = await fetch(
      `${SERVICES.auth}/api/auth/reset-password/confirm`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Request": "api-gateway",
        },
        body: JSON.stringify({ token, password: newPassword }),
      }
    );

    const authData = (await authResponse.json()) as any;

    if (!authResponse.ok) {
      console.log(`❌ Auth Service error: ${authData.message}`);
      return res.status(400).json({
        error: "Erreur de réinitialisation",
        message: authData.message || "Token invalide ou expiré",
      });
    }

    console.log(`✅ Mot de passe réinitialisé avec succès`);

    return res.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`❌ Erreur lors de l'appel à l'Auth Service:`, error);
    return res.status(500).json({
      error: "Service d'authentification indisponible",
      message: "Veuillez réessayer plus tard",
      timestamp: new Date().toISOString(),
    });
  }
};
