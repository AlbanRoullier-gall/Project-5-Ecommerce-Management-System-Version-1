/**
 * Middleware de gestion de session d'authentification
 * Utilise un cookie httpOnly pour une sécurité maximale
 * Le token JWT n'est jamais accessible depuis JavaScript côté client
 */

import { Request, Response } from "express";

/**
 * Nom du cookie pour le token d'authentification
 */
export const AUTH_TOKEN_COOKIE = "auth_token";

/**
 * Durée de vie du cookie (24 heures, aligné avec l'expiration du JWT)
 */
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

/**
 * Extrait le token d'authentification depuis le cookie ou le header Authorization
 * Fallback sur le header Authorization si le cookie n'est pas disponible (cross-domain)
 * @param req - Requête Express
 * @returns Le token ou null si absent
 */
export function extractAuthToken(req: Request): string | null {
  // Essayer d'abord depuis le cookie (méthode préférée)
  const cookieToken = req.cookies?.[AUTH_TOKEN_COOKIE];
  if (cookieToken) {
    return cookieToken;
  }

  // Fallback: essayer depuis le header Authorization (pour cross-domain)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7); // Enlever "Bearer "
    if (process.env["NODE_ENV"] === "production") {
      console.log(
        `[extractAuthToken] Token récupéré depuis le header Authorization (fallback cross-domain)`
      );
    }
    return token;
  }

  return null;
}

/**
 * Définit le cookie d'authentification dans la réponse
 * @param res - Réponse Express
 * @param token - Le token JWT à stocker
 */
export function setAuthTokenCookie(res: Response, token: string): void {
  const isProduction = process.env["NODE_ENV"] === "production";

  const cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "none" | "lax";
    maxAge: number;
    path: string;
    domain?: string;
  } = {
    httpOnly: true, // Non accessible depuis JavaScript (sécurité XSS)
    secure: isProduction, // HTTPS uniquement en production
    // En production, utiliser "none" pour permettre le partage cross-domain
    // (backoffice et API Gateway sont sur des domaines différents)
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax", // "none" nécessite secure: true
    maxAge: COOKIE_MAX_AGE,
    path: "/", // Disponible sur tout le site
    // Ne pas spécifier de domaine pour permettre le partage cross-domain
    // Le cookie sera défini pour le domaine de l'API Gateway
  };

  // En production, essayer d'extraire le domaine depuis l'URL de l'API Gateway
  // pour s'assurer que le cookie est défini sur le bon domaine
  if (isProduction) {
    // Ne pas spécifier de domaine - le cookie sera défini pour le domaine exact de l'API Gateway
    // Cela permet au navigateur de l'envoyer lors des requêtes cross-domain avec sameSite: "none"
  }

  res.cookie(AUTH_TOKEN_COOKIE, token, cookieOptions);

  // Log pour déboguer en production
  if (isProduction) {
    const setCookieHeader = res.getHeader("Set-Cookie");
    console.log(`[setAuthTokenCookie] Cookie défini:`, {
      name: AUTH_TOKEN_COOKIE,
      hasToken: !!token,
      tokenLength: token?.length,
      options: cookieOptions,
      setCookieHeader: Array.isArray(setCookieHeader)
        ? setCookieHeader.join(", ")
        : setCookieHeader,
      // Vérifier que le header Set-Cookie contient bien sameSite=None; Secure
      hasSameSiteNone: setCookieHeader
        ? String(setCookieHeader).includes("SameSite=None")
        : false,
      hasSecure: setCookieHeader
        ? String(setCookieHeader).includes("Secure")
        : false,
    });
  }
}

/**
 * Supprime le cookie d'authentification
 * @param res - Réponse Express
 */
export function clearAuthTokenCookie(res: Response): void {
  const isProduction = process.env["NODE_ENV"] === "production";
  res.clearCookie(AUTH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax", // "none" nécessite secure: true
    path: "/",
  });
}
