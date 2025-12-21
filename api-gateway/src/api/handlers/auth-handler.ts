/**
 * Handlers pour l'authentification
 * Fait des appels directs aux services Auth et Email
 * Les services restent indépendants
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";
import { clearAuthTokenCookie } from "../middleware/auth-session";

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
    // Le DTO attend { token, newPassword } et non { token, password }
    const authResponse = await fetch(
      `${SERVICES.auth}/api/auth/reset-password/confirm`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Request": "api-gateway",
        },
        body: JSON.stringify({ token, newPassword }),
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
 * Handler pour la connexion
 * Le service auth définit déjà le cookie, on transmet juste la réponse
 */
export const handleLogin = async (req: Request, res: Response) => {
  try {
    const authServiceUrl = `${SERVICES.auth}/api/auth/login`;
    // Appel direct au Auth Service
    const authResponse = await fetch(authServiceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Service-Request": "api-gateway",
      },
      body: JSON.stringify(req.body),
      // Ajouter un timeout pour éviter les attentes infinies
      signal: AbortSignal.timeout(10000), // 10 secondes
    });

    const authData = (await authResponse.json()) as any;

    if (!authResponse.ok) {
      return res.status(authResponse.status).json(authData);
    }

    // Le service auth a déjà défini le cookie, on transmet juste la réponse
    // Copier les cookies Set-Cookie depuis la réponse du service
    const setCookieHeader = authResponse.headers.get("set-cookie");

    let token: string | null = null;

    if (setCookieHeader) {
      // Extraire le token depuis le cookie Set-Cookie
      const cookieMatch = setCookieHeader.match(/auth_token=([^;]+)/);
      if (cookieMatch && cookieMatch[1]) {
        token = cookieMatch[1];
        // Redéfinir le cookie côté API Gateway pour que le domaine soit correct
        const { setAuthTokenCookie } = await import(
          "../middleware/auth-session"
        );
        setAuthTokenCookie(res, token);
      } else {
        // Fallback: copier le cookie tel quel si on ne peut pas extraire le token
        res.setHeader("Set-Cookie", setCookieHeader);
      }
    }

    // Retourner le token dans la réponse pour que le frontend puisse le stocker
    // Cela permet de fonctionner même si les cookies third-party sont bloqués
    const responseData = {
      ...authData,
      ...(token && { token }), // Ajouter le token à la réponse si disponible
    };

    return res.status(200).json(responseData);
  } catch (error: any) {
    console.error("❌ Login error:", error);

    // Gérer les erreurs de timeout/connexion
    if (
      error.code === "UND_ERR_CONNECT_TIMEOUT" ||
      error.message?.includes("fetch failed")
    ) {
      return res.status(503).json({
        error: "Service d'authentification indisponible",
        message: `Impossible de se connecter au service auth (${SERVICES.auth}). Vérifiez que le service est démarré et que l'URL est correcte.`,
        timestamp: new Date().toISOString(),
        serviceUrl: SERVICES.auth,
      });
    }

    return res.status(500).json({
      error: "Erreur interne du serveur",
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

    // Le service auth a déjà défini le cookie, on transmet juste la réponse
    // Copier les cookies Set-Cookie depuis la réponse du service
    const setCookieHeader = authResponse.headers.get("set-cookie");
    if (setCookieHeader) {
      res.setHeader("Set-Cookie", setCookieHeader);
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

/**
 * Handler pour vérifier l'authentification
 * Vérifie la présence et validité du token depuis le cookie
 * Utilise le middleware requireAuth pour vérifier le token, puis récupère les infos utilisateur
 */
export const handleVerifyAuth = async (req: Request, res: Response) => {
  try {
    // Extraire le token depuis le cookie
    const { extractAuthToken } = await import("../middleware/auth-session");
    const { verifyToken } = await import("../middleware/auth");

    // Log pour déboguer en production
    const cookies = req.cookies || {};
    const hasAuthCookie = !!cookies["auth_token"];

    if (process.env["NODE_ENV"] === "production") {
      console.log(
        `[VerifyAuth] Cookies reçus: ${Object.keys(cookies).join(", ")}`
      );
      console.log(`[VerifyAuth] Cookie auth_token présent: ${hasAuthCookie}`);
      console.log(`[VerifyAuth] Origin: ${req.headers.origin}`);
    }

    const token = extractAuthToken(req);

    if (!token) {
      if (process.env["NODE_ENV"] === "production") {
        console.warn(
          `[VerifyAuth] Aucun token trouvé. Cookies disponibles: ${Object.keys(
            cookies
          ).join(", ")}`
        );
      }
      return res.json({
        success: false,
        isAuthenticated: false,
      });
    }

    // Vérifier le token
    const user = verifyToken(token);

    if (!user) {
      return res.json({
        success: false,
        isAuthenticated: false,
      });
    }

    // Vérifier que l'utilisateur existe encore dans la base de données
    const authResponse = await fetch(
      `${SERVICES.auth}/api/admin/users/${user.userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Request": "api-gateway",
          "x-user-id": String(user.userId),
          "x-user-email": user.email,
        },
      }
    );

    if (!authResponse.ok) {
      return res.json({
        success: false,
        isAuthenticated: false,
      });
    }

    const authData = (await authResponse.json()) as any;
    return res.json({
      success: true,
      isAuthenticated: true,
      user: authData.data?.user || user,
    });
  } catch (error) {
    console.error("❌ Verify auth error:", error);
    return res.json({
      success: false,
      isAuthenticated: false,
    });
  }
};

/**
 * Handler pour la déconnexion
 * Supprime le cookie d'authentification
 */
export const handleLogout = async (req: Request, res: Response) => {
  try {
    // Supprimer le cookie côté API Gateway immédiatement (même si l'appel au service échoue)
    clearAuthTokenCookie(res);

    // Appel au Auth Service pour logout avec timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 5000); // Timeout de 5 secondes

    try {
      const authResponse = await fetch(`${SERVICES.auth}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Request": "api-gateway",
          Cookie: req.headers.cookie || "",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!authResponse.ok) {
        // Même en cas d'erreur, supprimer le cookie localement
        console.warn(
          `[Logout] Auth service returned ${authResponse.status}, but cookie already cleared`
        );
        return res.status(200).json({
          success: true,
          message: "Déconnexion réussie",
        });
      }

      const authData = (await authResponse.json()) as any;
      return res.json(authData);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === "AbortError") {
        console.warn(
          "[Logout] Timeout lors de l'appel au service auth (5s), mais cookie déjà supprimé"
        );
      } else {
        console.warn(
          `[Logout] Erreur lors de l'appel au service auth: ${fetchError.message}, mais cookie déjà supprimé`
        );
      }

      // Même en cas d'erreur réseau/timeout, retourner un succès car le cookie est déjà supprimé
      return res.status(200).json({
        success: true,
        message: "Déconnexion réussie",
      });
    }
  } catch (error) {
    console.error("❌ Logout error:", error);
    // Même en cas d'erreur, supprimer le cookie localement
    clearAuthTokenCookie(res);
    return res.status(200).json({
      success: true,
      message: "Déconnexion réussie",
    });
  }
};
