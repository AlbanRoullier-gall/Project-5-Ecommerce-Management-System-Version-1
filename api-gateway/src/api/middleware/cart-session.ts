/**
 * Middleware de gestion de session pour le panier
 * Utilise un cookie httpOnly pour une sécurité maximale
 * Le sessionId n'est jamais accessible depuis JavaScript côté client
 */

import { Request, Response, NextFunction } from "express";
import * as crypto from "crypto";

/**
 * Nom du cookie pour la session du panier
 */
export const CART_SESSION_COOKIE = "cart_session_id";

/**
 * Durée de vie du cookie (30 jours, aligné avec l'expiration du panier Redis)
 */
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 jours en millisecondes

/**
 * Génère un nouveau sessionId pour le panier
 * Format: cart_session_<uuid>
 */
export function generateCartSessionId(): string {
  return `cart_session_${crypto.randomUUID()}`;
}

/**
 * Extrait le sessionId depuis le cookie
 * @param req - Requête Express
 * @returns Le sessionId ou null si absent
 */
export function extractCartSessionId(req: Request): string | null {
  // Essayer d'abord le cookie (méthode principale)
  const cookieSessionId = req.cookies?.[CART_SESSION_COOKIE];
  if (cookieSessionId) {
    return cookieSessionId;
  }

  // Fallback: vérifier aussi le header (pour compatibilité pendant migration)
  const headerSessionId = req.headers["x-cart-session-id"] as string;
  return headerSessionId || null;
}

/**
 * Définit le cookie de session dans la réponse
 * @param res - Réponse Express
 * @param sessionId - Le sessionId à stocker
 */
function setCartSessionCookie(res: Response, sessionId: string): void {
  const isProduction = process.env["NODE_ENV"] === "production";

  res.cookie(CART_SESSION_COOKIE, sessionId, {
    httpOnly: true, // Non accessible depuis JavaScript (sécurité XSS)
    secure: isProduction, // HTTPS uniquement en production (requis pour sameSite: "none")
    // En production, utiliser "none" pour permettre le partage cross-domain
    // (frontend et API Gateway sont sur des domaines différents Railway)
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax", // "none" nécessite secure: true
    maxAge: COOKIE_MAX_AGE,
    path: "/", // Disponible sur tout le site
    // Ne pas spécifier de domaine pour permettre le partage cross-domain
  });
}

/**
 * Middleware pour gérer la session du panier
 * - Extrait le sessionId du cookie httpOnly
 * - Si absent, génère un nouveau sessionId et le définit dans un cookie
 * - Ajoute le sessionId à req pour utilisation dans les handlers/proxy
 */
export function cartSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Extraire le sessionId du cookie (ou header en fallback)
  let sessionId = extractCartSessionId(req);

  // Si pas de sessionId, en générer un nouveau et le définir dans un cookie
  if (!sessionId) {
    sessionId = generateCartSessionId();
    setCartSessionCookie(res, sessionId);
  }

  // Ajouter le sessionId à la requête pour utilisation dans les handlers/proxy
  (req as any).cartSessionId = sessionId;

  next();
}

/**
 * Handler pour l'endpoint de génération de session
 * POST /api/cart/session
 * Génère un nouveau sessionId et le définit dans un cookie httpOnly
 * Plus besoin de retourner le sessionId au client (il est dans le cookie)
 */
export function handleCreateCartSession(_req: Request, res: Response): void {
  const sessionId = generateCartSessionId();

  // Définir le cookie httpOnly
  const isProduction = process.env["NODE_ENV"] === "production";
  res.cookie(CART_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: isProduction, // Requis pour sameSite: "none"
    sameSite: isProduction ? "none" : "lax", // "none" nécessite secure: true
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    // Ne pas spécifier de domaine pour permettre le partage cross-domain
  });

  res.status(200).json({
    success: true,
    message: "Session de panier créée avec succès",
    // Ne pas retourner le sessionId - il est dans le cookie httpOnly
  });
}
