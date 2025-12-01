/**
 * Module d'authentification pour l'API Gateway
 * Gère la vérification JWT et la protection des routes
 */

import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_SECRET, SERVICES } from "../../config";

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
 * Extrait le token d'authentification depuis les headers
 * Format attendu : "Bearer <token>"
 */
export const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  return parts.length === 2 && parts[0] === "Bearer" ? parts[1] || null : null;
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
  const token = extractToken(req.headers["authorization"]);

  if (!token) {
    res.status(401).json({
      error: "Token d'accès requis",
      message:
        "Vous devez fournir un token d'authentification pour accéder à cette ressource",
      code: "MISSING_TOKEN",
    });
    return;
  }

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
