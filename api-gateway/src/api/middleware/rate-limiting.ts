/**
 * Rate Limiting Middleware
 * Middleware de rate limiting métier pour l'API Gateway
 *
 * Applique le rate limiting en deux couches :
 * 1. Rate limiting global par IP (après les middlewares de base)
 * 2. Rate limiting spécifique par route (après l'authentification)
 */

import { Request, Response, NextFunction } from "express";
import { RateLimitService } from "../../services/rateLimitService";

const rateLimitService = new RateLimitService();

/**
 * Helper pour ajouter les headers de rate limiting
 */
function setRateLimitHeaders(
  res: Response,
  limit: number,
  remaining: number,
  resetTime: number
): void {
  res.setHeader("X-RateLimit-Limit", limit.toString());
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  res.setHeader("X-RateLimit-Reset", new Date(resetTime).toISOString());
}

/**
 * Helper pour retourner une erreur 429 Too Many Requests
 */
function sendTooManyRequests(
  res: Response,
  message: string,
  resetTime: number
): void {
  res.status(429).json({
    error: "Too Many Requests",
    message,
    retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
  });
}

/**
 * Helper pour le fallback vers rate limit global quand l'utilisateur n'est pas authentifié
 */
async function checkGlobalLimitFallback(
  req: Request,
  res: Response
): Promise<{ allowed: boolean; result: any }> {
  const ip = rateLimitService.getClientIp(req);
  const result = await rateLimitService.checkGlobalLimit(ip);

  if (!result.allowed) {
    sendTooManyRequests(res, "Limite de requêtes dépassée.", result.resetTime);
    return { allowed: false, result };
  }

  return { allowed: true, result };
}

/**
 * Rate limiting global par IP
 * Appliqué à toutes les routes /api/* (sauf /api/health)
 */
export const globalRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Exclure /api/health du rate limiting
  if (req.path === "/api/health" || req.path === "/api/health/services") {
    return next();
  }

  const ip = rateLimitService.getClientIp(req);
  const result = await rateLimitService.checkGlobalLimit(ip);

  setRateLimitHeaders(res, 200, result.remaining, result.resetTime);

  if (!result.allowed) {
    sendTooManyRequests(
      res,
      "Vous avez dépassé la limite de requêtes. Veuillez réessayer plus tard.",
      result.resetTime
    );
    return;
  }

  next();
};

/**
 * Rate limiting pour /api/auth/login
 * Appliqué avant l'authentification
 */
export const authLoginRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ip = rateLimitService.getClientIp(req);
  const result = await rateLimitService.checkAuthLoginLimit(ip);

  setRateLimitHeaders(res, 5, result.remaining, result.resetTime);

  if (!result.allowed) {
    sendTooManyRequests(
      res,
      "Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.",
      result.resetTime
    );
    return;
  }

  next();
};

/**
 * Rate limiting pour /api/payment/* (par utilisateur)
 * Nécessite que l'utilisateur soit authentifié
 */
export const paymentRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = (req as any).user;

  if (!user || !user.userId) {
    // Si pas d'utilisateur, utiliser l'IP comme fallback
    const { allowed } = await checkGlobalLimitFallback(req, res);
    if (!allowed) return;
    return next();
  }

  const result = await rateLimitService.checkPaymentLimit(String(user.userId));

  setRateLimitHeaders(res, 10, result.remaining, result.resetTime);

  if (!result.allowed) {
    sendTooManyRequests(
      res,
      "Trop de requêtes de paiement. Veuillez réessayer dans une minute.",
      result.resetTime
    );
    return;
  }

  next();
};

/**
 * Rate limiting pour /api/admin/* (par utilisateur)
 * Nécessite que l'utilisateur soit authentifié
 */
export const adminRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = (req as any).user;

  if (!user || !user.userId) {
    // Si pas d'utilisateur, utiliser l'IP comme fallback
    const { allowed } = await checkGlobalLimitFallback(req, res);
    if (!allowed) return;
    return next();
  }

  const result = await rateLimitService.checkAdminLimit(String(user.userId));

  setRateLimitHeaders(res, 50, result.remaining, result.resetTime);

  if (!result.allowed) {
    sendTooManyRequests(
      res,
      "Trop de requêtes admin. Veuillez réessayer dans une minute.",
      result.resetTime
    );
    return;
  }

  next();
};

