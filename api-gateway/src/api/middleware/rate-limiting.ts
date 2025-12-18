/**
 * Rate Limiting Middleware
 * Middleware de rate limiting métier pour l'API Gateway
 *
 * Stratégie par type de requête :
 * - GET (lecture) : limites élevées par IP
 * - POST/PUT (écriture) : limites strictes par utilisateur authentifié
 * - DELETE (suppression) : limites très strictes par utilisateur authentifié
 * - Auth : limites très strictes par IP
 * - Payment : limites très strictes par utilisateur
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
 * Rate limiting pour GET /api/products/* et catalogue
 * 1000 req/min par IP
 */
export const getProductsRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ip = rateLimitService.getClientIp(req);
  const result = await rateLimitService.checkGetProductsLimit(ip);

  setRateLimitHeaders(res, 1000, result.remaining, result.resetTime);

  if (!result.allowed) {
    sendTooManyRequests(
      res,
      "Trop de requêtes pour le catalogue. Veuillez réessayer dans une minute.",
      result.resetTime
    );
    return;
  }

  next();
};

/**
 * Rate limiting pour GET pages statiques
 * 500 req/min par IP
 */
export const getStaticRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ip = rateLimitService.getClientIp(req);
  const result = await rateLimitService.checkGetStaticLimit(ip);

  setRateLimitHeaders(res, 500, result.remaining, result.resetTime);

  if (!result.allowed) {
    sendTooManyRequests(
      res,
      "Trop de requêtes pour les pages statiques. Veuillez réessayer dans une minute.",
      result.resetTime
    );
    return;
  }

  next();
};

/**
 * Rate limiting pour POST/PUT (création/modification)
 * 100 req/min par utilisateur authentifié
 */
export const postPutRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = (req as any).user;

  if (!user || !user.userId) {
    // Si pas d'utilisateur, utiliser l'IP comme fallback avec limite plus stricte
    const ip = rateLimitService.getClientIp(req);
    const result = await rateLimitService.checkGetStaticLimit(ip); // Utiliser limite statique comme fallback

    setRateLimitHeaders(res, 500, result.remaining, result.resetTime);

    if (!result.allowed) {
      sendTooManyRequests(
        res,
        "Limite de requêtes dépassée. Veuillez vous authentifier.",
        result.resetTime
      );
      return;
    }
    return next();
  }

  const result = await rateLimitService.checkPostPutLimit(String(user.userId));

  setRateLimitHeaders(res, 100, result.remaining, result.resetTime);

  if (!result.allowed) {
    sendTooManyRequests(
      res,
      "Trop de requêtes de création/modification. Veuillez réessayer dans une minute.",
      result.resetTime
    );
    return;
  }

  next();
};

/**
 * Rate limiting pour DELETE (suppression)
 * 20 req/min par utilisateur authentifié
 */
export const deleteRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = (req as any).user;

  if (!user || !user.userId) {
    sendTooManyRequests(
      res,
      "Authentification requise pour les opérations de suppression.",
      Date.now() + 60000
    );
    return;
  }

  const result = await rateLimitService.checkDeleteLimit(String(user.userId));

  setRateLimitHeaders(res, 20, result.remaining, result.resetTime);

  if (!result.allowed) {
    sendTooManyRequests(
      res,
      "Trop de requêtes de suppression. Veuillez réessayer dans une minute.",
      result.resetTime
    );
    return;
  }

  next();
};

/**
 * Rate limiting pour /api/auth/login
 * 5 tentatives / 15 min par IP
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
 * Rate limiting pour /api/auth/register
 * 3 tentatives / heure par IP
 */
export const authRegisterRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ip = rateLimitService.getClientIp(req);
  const result = await rateLimitService.checkAuthRegisterLimit(ip);

  setRateLimitHeaders(res, 3, result.remaining, result.resetTime);

  if (!result.allowed) {
    sendTooManyRequests(
      res,
      "Trop de tentatives d'inscription. Veuillez réessayer dans une heure.",
      result.resetTime
    );
    return;
  }

  next();
};

/**
 * Rate limiting pour /api/auth/reset-password
 * 3 tentatives / heure par IP
 */
export const authPasswordResetRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const ip = rateLimitService.getClientIp(req);
  const result = await rateLimitService.checkAuthPasswordResetLimit(ip);

  setRateLimitHeaders(res, 3, result.remaining, result.resetTime);

  if (!result.allowed) {
    sendTooManyRequests(
      res,
      "Trop de tentatives de réinitialisation. Veuillez réessayer dans une heure.",
      result.resetTime
    );
    return;
  }

  next();
};

/**
 * Rate limiting pour /api/payment/* (par utilisateur)
 * 5 requêtes / 5 min par utilisateur authentifié
 */
export const paymentRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = (req as any).user;

  if (!user || !user.userId) {
    sendTooManyRequests(
      res,
      "Authentification requise pour les opérations de paiement.",
      Date.now() + 300000
    );
    return;
  }

  const result = await rateLimitService.checkPaymentLimit(String(user.userId));

  setRateLimitHeaders(res, 5, result.remaining, result.resetTime);

  if (!result.allowed) {
    sendTooManyRequests(
      res,
      "Trop de requêtes de paiement. Veuillez réessayer dans 5 minutes.",
      result.resetTime
    );
    return;
  }

  next();
};
