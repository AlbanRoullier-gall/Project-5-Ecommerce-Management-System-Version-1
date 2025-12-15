/**
 * Module d'authentification pour l'API Gateway
 * Gère la vérification JWT et la protection des routes
 * Utilise des cookies httpOnly pour la sécurité
 */

const jwt = require("jsonwebtoken");
import { Request, Response, NextFunction } from "express";
import { JWT_SECRET, SERVICES } from "../../config";
import { extractAuthToken } from "./auth-session";

// ===== TYPES =====

export interface AuthenticatedUser {
  userId: string;
  email: string;
  [key: string]: any;
}

// ===== GESTION DES TOKENS JWT =====

/**
 * Vérifie et décode un token JWT
 * Retourne l'utilisateur authentifié ou null si invalide
 */
export const verifyToken = (token: string): AuthenticatedUser | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
  } catch (error) {
    return null;
  }
};

/**
 * Extrait le token d'authentification depuis le cookie httpOnly
 * Plus de fallback sur le header Authorization
 */
export const extractToken = (req: Request): string | null => {
  return extractAuthToken(req);
};

/**
 * Middleware Express pour vérifier l'authentification JWT
 * Vérifie :
 * 1. La présence et validité du token JWT
 * 2. L'existence de l'utilisateur dans la base de données (sécurité : empêche l'accès si l'utilisateur a été supprimé)
 *
 * Ajoute req.user si tout est valide, sinon retourne 401
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Debug: afficher les cookies reçus
  const cookies = req.cookies || {};
  const cookieNames = Object.keys(cookies);
  console.log(`[Auth] Requête ${req.method} ${req.path}`);
  console.log(`[Auth] Cookies reçus: ${cookieNames.length > 0 ? cookieNames.join(", ") : "aucun"}`);
  console.log(`[Auth] auth_token présent: ${!!cookies.auth_token}`);
  
  const token = extractToken(req);

  if (!token) {
    console.log(`[Auth] ❌ Token non trouvé - Headers:`, {
      origin: req.headers.origin,
      cookie: req.headers.cookie ? "présent" : "absent",
      cookies: cookieNames,
    });
    res.status(401).json({
      error: "Token d'accès requis",
      message: "Vous devez être authentifié pour accéder à cette ressource",
      code: "MISSING_TOKEN",
    });
    return;
  }
  
  console.log(`[Auth] ✅ Token trouvé (longueur: ${token.length})`);

  const user = verifyToken(token);
  if (!user) {
    res.status(401).json({
      error: "Token invalide",
      message: "Le token d'authentification est invalide ou expiré",
      code: "INVALID_TOKEN",
    });
    return;
  }

  // Vérifier que l'utilisateur existe encore dans la base de données
  // Cela empêche l'accès si l'utilisateur a été supprimé entre-temps
  try {
    const response = await fetch(
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

    if (!response.ok) {
      if (response.status === 404) {
        // L'utilisateur n'existe plus (a été supprimé)
        res.status(401).json({
          error: "Utilisateur introuvable",
          message:
            "Votre compte n'existe plus ou a été supprimé. Veuillez vous reconnecter.",
          code: "USER_NOT_FOUND",
        });
        return;
      }
      // Autre erreur du service auth
      console.error(
        `Error verifying user existence: ${response.status} ${response.statusText}`
      );
      res.status(500).json({
        error: "Erreur de vérification",
        message: "Impossible de vérifier votre authentification",
        code: "VERIFICATION_ERROR",
      });
      return;
    }

    // L'utilisateur existe, continuer
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Error in requireAuth middleware:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      message:
        "Une erreur est survenue lors de la vérification de l'authentification",
      code: "INTERNAL_ERROR",
    });
  }
};
