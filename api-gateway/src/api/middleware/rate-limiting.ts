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

  // Ajouter les headers de rate limiting
  res.setHeader("X-RateLimit-Limit", "200");
  res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
  res.setHeader("X-RateLimit-Reset", new Date(result.resetTime).toISOString());

  if (!result.allowed) {
    res.status(429).json({
      error: "Too Many Requests",
      message:
        "Vous avez dépassé la limite de requêtes. Veuillez réessayer plus tard.",
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
    });
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

  res.setHeader("X-RateLimit-Limit", "5");
  res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
  res.setHeader("X-RateLimit-Reset", new Date(result.resetTime).toISOString());

  if (!result.allowed) {
    res.status(429).json({
      error: "Too Many Requests",
      message:
        "Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.",
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
    });
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
    const ip = rateLimitService.getClientIp(req);
    const result = await rateLimitService.checkGlobalLimit(ip);

    if (!result.allowed) {
      res.status(429).json({
        error: "Too Many Requests",
        message: "Limite de requêtes dépassée.",
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      });
      return;
    }
    return next();
  }

  const result = await rateLimitService.checkPaymentLimit(String(user.userId));

  res.setHeader("X-RateLimit-Limit", "10");
  res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
  res.setHeader("X-RateLimit-Reset", new Date(result.resetTime).toISOString());

  if (!result.allowed) {
    res.status(429).json({
      error: "Too Many Requests",
      message:
        "Trop de requêtes de paiement. Veuillez réessayer dans une minute.",
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
    });
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
    const ip = rateLimitService.getClientIp(req);
    const result = await rateLimitService.checkGlobalLimit(ip);

    if (!result.allowed) {
      res.status(429).json({
        error: "Too Many Requests",
        message: "Limite de requêtes dépassée.",
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      });
      return;
    }
    return next();
  }

  const result = await rateLimitService.checkAdminLimit(String(user.userId));

  res.setHeader("X-RateLimit-Limit", "50");
  res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
  res.setHeader("X-RateLimit-Reset", new Date(result.resetTime).toISOString());

  if (!result.allowed) {
    res.status(429).json({
      error: "Too Many Requests",
      message: "Trop de requêtes admin. Veuillez réessayer dans une minute.",
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
    });
    return;
  }

  next();
};

