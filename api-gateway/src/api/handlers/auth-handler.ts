/**
 * Handlers spécialisés pour l'authentification
 * Gère les flux complexes nécessitant plusieurs services
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";

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

    // 1. Appel au Auth Service pour générer le token
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
        console.error(`❌ Auth Service error: ${authData.message}`);
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

    // 2. Appel au Email Service pour envoyer l'email
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
            }/auth/reset-password`,
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
    // 1. Appel au Auth Service pour créer l'utilisateur
    let authData: any;

    try {
      const authResponse = await fetch(`${SERVICES.auth}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Request": "api-gateway",
        },
        body: JSON.stringify(req.body),
      });

      authData = (await authResponse.json()) as any;

      if (!authResponse.ok) {
        console.error(`❌ Auth Service error: ${authData.message}`);
        return res.status(authResponse.status).json(authData);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'appel à l'Auth Service:`, error);
      return res.status(500).json({
        error: "Service d'authentification indisponible",
        message: "Veuillez réessayer plus tard",
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Construire les URLs d'approbation/rejet
    // Les tokens ont été générés par l'auth-service
    const baseUrl = process.env["API_GATEWAY_URL"] || "http://localhost:3020";
    const approvalUrl = `${baseUrl}/api/auth/approve-backoffice?token=${authData.approvalToken}`;
    const rejectionUrl = `${baseUrl}/api/auth/reject-backoffice?token=${authData.rejectionToken}`;

    // 3. Appel au Email Service pour envoyer l'email d'approbation
    try {
      const emailResponse = await fetch(
        `${SERVICES.email}/api/email/backoffice-approval-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Service-Request": "api-gateway",
          },
          body: JSON.stringify({
            userFullName: `${authData.user.firstName} ${authData.user.lastName}`,
            userEmail: authData.user.email,
            approvalUrl,
            rejectionUrl,
          }),
        }
      );

      if (!emailResponse.ok) {
        console.error("⚠️ Email Service error - email non envoyé");
        // Ne pas faire échouer l'inscription si l'email échoue
      }
    } catch (error) {
      console.error("⚠️ Erreur lors de l'envoi de l'email:", error);
      // Ne pas faire échouer l'inscription si l'email échoue
    }

    // 4. Retourner la réponse au client
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

/**
 * Handler pour l'approbation backoffice avec envoi d'email
 * Orchestre l'appel entre Auth Service et Email Service
 */
export const handleApproveBackofficeAccess = async (
  req: Request,
  res: Response
) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        error: "Token manquant",
        message: "Le token d'approbation est obligatoire",
      });
    }

    // 1. Appel au Auth Service pour approuver
    let authData: any;

    try {
      const authResponse = await fetch(
        `${SERVICES.auth}/api/auth/approve-backoffice?token=${token}`,
        {
          method: "GET",
          headers: {
            "X-Service-Request": "api-gateway",
          },
        }
      );

      authData = (await authResponse.json()) as any;

      if (!authResponse.ok) {
        console.error(`❌ Auth Service error: ${authData.message}`);
        return res.status(authResponse.status).json(authData);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'appel à l'Auth Service:`, error);
      return res.status(500).json({
        error: "Service d'authentification indisponible",
        message: "Veuillez réessayer plus tard",
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Appel au Email Service pour envoyer la confirmation
    try {
      const backofficeUrl =
        process.env["BACKOFFICE_URL"] || "http://localhost:3011";

      const emailResponse = await fetch(
        `${SERVICES.email}/api/email/backoffice-approval-confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Service-Request": "api-gateway",
          },
          body: JSON.stringify({
            userEmail: authData.user.email,
            userFullName: `${authData.user.firstName} ${authData.user.lastName}`,
            backofficeUrl,
          }),
        }
      );

      if (!emailResponse.ok) {
        console.error("⚠️ Email Service error - email non envoyé");
      }
    } catch (error) {
      console.error("⚠️ Erreur lors de l'envoi de l'email:", error);
    }

    // 3. Retourner la réponse
    return res.json({
      success: true,
      message: "Accès au backoffice approuvé avec succès",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Approve backoffice error:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
      message: "Veuillez réessayer plus tard",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Handler pour le rejet backoffice avec envoi d'email
 * Orchestre l'appel entre Auth Service et Email Service
 */
export const handleRejectBackofficeAccess = async (
  req: Request,
  res: Response
) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        error: "Token manquant",
        message: "Le token de rejet est obligatoire",
      });
    }

    // 1. Appel au Auth Service pour rejeter
    let authData: any;

    try {
      const authResponse = await fetch(
        `${SERVICES.auth}/api/auth/reject-backoffice?token=${token}`,
        {
          method: "GET",
          headers: {
            "X-Service-Request": "api-gateway",
          },
        }
      );

      authData = (await authResponse.json()) as any;

      if (!authResponse.ok) {
        console.error(`❌ Auth Service error: ${authData.message}`);
        return res.status(authResponse.status).json(authData);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'appel à l'Auth Service:`, error);
      return res.status(500).json({
        error: "Service d'authentification indisponible",
        message: "Veuillez réessayer plus tard",
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Appel au Email Service pour envoyer la notification
    try {
      const emailResponse = await fetch(
        `${SERVICES.email}/api/email/backoffice-rejection-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Service-Request": "api-gateway",
          },
          body: JSON.stringify({
            userEmail: authData.user.email,
            userFullName: `${authData.user.firstName} ${authData.user.lastName}`,
          }),
        }
      );

      if (!emailResponse.ok) {
        console.error("⚠️ Email Service error - email non envoyé");
      }
    } catch (error) {
      console.error("⚠️ Erreur lors de l'envoi de l'email:", error);
    }

    // 3. Retourner la réponse
    return res.json({
      success: true,
      message: "Accès au backoffice rejeté",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Reject backoffice error:", error);
    return res.status(500).json({
      error: "Erreur interne du serveur",
      message: "Veuillez réessayer plus tard",
      timestamp: new Date().toISOString(),
    });
  }
};
