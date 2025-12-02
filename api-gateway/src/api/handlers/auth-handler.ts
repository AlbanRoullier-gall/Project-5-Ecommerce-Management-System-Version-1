/**
 * Handlers pour l'authentification
 * Fait des appels directs aux services Auth et Email
 * Les services restent indépendants
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";

/**
 * Helper pour créer une réponse d'erreur standardisée
 */
const createErrorResponse = (error: string, message: string) => ({
  error,
  message,
  timestamp: new Date().toISOString(),
});

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

    // 1. Appel direct au Auth Service
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

    if (!authResponse.ok) {
      const authData = (await authResponse.json()) as any;
      return res.status(authResponse.status).json(authData);
    }

    const authData = (await authResponse.json()) as any;

    // 2. Appel au Email Service (non-bloquant)
    try {
      await fetch(`${SERVICES.email}/api/email/send-reset-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Request": "api-gateway",
        },
        body: JSON.stringify({
          email,
          token: authData.token,
          userName: authData.userName || "Utilisateur",
          resetUrl: `${
            process.env["FRONTEND_URL"] || "http://localhost:3009"
          }/auth/reset-password`,
        }),
      });
    } catch (error) {
      console.warn("⚠️ Erreur lors de l'envoi de l'email:", error);
      // Ne pas faire échouer la requête si l'email échoue
    }

    return res.json({
      success: true,
      message: "Email de réinitialisation envoyé",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Password reset error:", error);
    return res
      .status(500)
      .json(
        createErrorResponse(
          "Erreur interne du serveur",
          "Veuillez réessayer plus tard"
        )
      );
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

    // Appel direct au Auth Service (la validation du mot de passe est gérée par le service)
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
      console.error(`❌ Auth Service error: ${authData.message}`);
      return res.status(400).json({
        error: "Erreur de réinitialisation",
        message: authData.message || "Token invalide ou expiré",
      });
    }

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

/**
 * Handler pour l'inscription avec envoi d'email d'approbation
 * Orchestre l'appel entre Auth Service et Email Service
 */
export const handleRegister = async (req: Request, res: Response) => {
  try {
    // 1. Appel direct au Auth Service
    const authResponse = await fetch(`${SERVICES.auth}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Service-Request": "api-gateway",
      },
      body: JSON.stringify(req.body),
    });

    const authData = (await authResponse.json()) as any;

    if (!authResponse.ok) {
      return res.status(authResponse.status).json(authData);
    }

    // 2. Retourner la réponse au client
    return res.status(201).json(authData);
  } catch (error) {
    console.error("❌ Registration error:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
      message: "Veuillez réessayer plus tard",
      timestamp: new Date().toISOString(),
    });
  }
};
