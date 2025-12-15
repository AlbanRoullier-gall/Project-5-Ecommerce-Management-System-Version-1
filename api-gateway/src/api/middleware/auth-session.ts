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
 * Extrait le token d'authentification depuis le cookie
 * @param req - Requête Express
 * @returns Le token ou null si absent
 */
export function extractAuthToken(req: Request): string | null {
  const cookieToken = req.cookies?.[AUTH_TOKEN_COOKIE];
  return cookieToken || null;
}

/**
 * Définit le cookie d'authentification dans la réponse
 * @param res - Réponse Express
 * @param token - Le token JWT à stocker
 */
export function setAuthTokenCookie(res: Response, token: string): void {
  const isProduction = process.env["NODE_ENV"] === "production";

  const cookieOptions = {
    httpOnly: true, // Non accessible depuis JavaScript (sécurité XSS)
    secure: isProduction, // HTTPS uniquement en production
    // En production, utiliser "none" pour permettre le partage cross-domain
    // (backoffice et API Gateway sont sur des domaines différents)
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax", // "none" nécessite secure: true
    maxAge: COOKIE_MAX_AGE,
    path: "/", // Disponible sur tout le site
    // Ne pas spécifier de domaine pour permettre le partage cross-domain
  };

  console.log(`[AuthSession] Définition du cookie auth_token:`, {
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    httpOnly: cookieOptions.httpOnly,
    path: cookieOptions.path,
    tokenLength: token.length,
  });

  res.cookie(AUTH_TOKEN_COOKIE, token, cookieOptions);
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
