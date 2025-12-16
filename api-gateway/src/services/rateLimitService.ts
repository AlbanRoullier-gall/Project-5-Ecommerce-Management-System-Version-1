/**
 * Rate Limit Service
 * Service de rate limiting métier utilisant Redis
 *
 * Architecture : Service pattern
 * - Rate limiting par IP (global)
 * - Rate limiting par utilisateur (routes authentifiées)
 * - Rate limiting par route (routes sensibles)
 * - Utilise Redis pour le stockage distribué
 */

import Redis from "ioredis";

interface RateLimitConfig {
  enabled: boolean;
  windowMs: number;
  maxRequests: number;
}

export class RateLimitService {
  private redis: Redis;
  private globalConfig: RateLimitConfig;
  private authLoginConfig: RateLimitConfig;
  private paymentConfig: RateLimitConfig;
  private adminConfig: RateLimitConfig;

  constructor() {
    // Configuration Redis
    let redisConfig: any;

    if (process.env["REDIS_URL"]) {
      redisConfig = process.env["REDIS_URL"];
    } else {
      redisConfig = {
        host: process.env["REDIS_HOST"] || "localhost",
        port: parseInt(process.env["REDIS_PORT"] || "6379"),
        db: parseInt(process.env["REDIS_DB"] || "0"),
        maxRetriesPerRequest: 3,
        family: 4, // Forcer IPv4
      };

      if (process.env["REDIS_PASSWORD"]) {
        redisConfig.password = process.env["REDIS_PASSWORD"];
      }
    }

    this.redis = new Redis(redisConfig);

    // Configuration des limites depuis les variables d'environnement
    this.globalConfig = {
      enabled: process.env["RATE_LIMIT_GLOBAL_ENABLED"] === "true",
      windowMs: parseInt(
        process.env["RATE_LIMIT_GLOBAL_WINDOW_MS"] || "900000"
      ), // 15 minutes
      maxRequests: parseInt(
        process.env["RATE_LIMIT_GLOBAL_MAX_REQUESTS"] || "200"
      ), // 200 requêtes / 15 min (aligné avec l'ancienne config nginx)
    };

    this.authLoginConfig = {
      enabled: process.env["RATE_LIMIT_AUTH_LOGIN_ENABLED"] === "true",
      windowMs: parseInt(
        process.env["RATE_LIMIT_AUTH_LOGIN_WINDOW_MS"] || "900000"
      ), // 15 minutes
      maxRequests: parseInt(
        process.env["RATE_LIMIT_AUTH_LOGIN_MAX_REQUESTS"] || "5"
      ),
    };

    this.paymentConfig = {
      enabled: process.env["RATE_LIMIT_PAYMENT_ENABLED"] === "true",
      windowMs: parseInt(
        process.env["RATE_LIMIT_PAYMENT_WINDOW_MS"] || "60000"
      ), // 1 minute
      maxRequests: parseInt(
        process.env["RATE_LIMIT_PAYMENT_MAX_REQUESTS"] || "10"
      ),
    };

    this.adminConfig = {
      enabled: process.env["RATE_LIMIT_ADMIN_ENABLED"] === "true",
      windowMs: parseInt(process.env["RATE_LIMIT_ADMIN_WINDOW_MS"] || "60000"), // 1 minute
      maxRequests: parseInt(
        process.env["RATE_LIMIT_ADMIN_MAX_REQUESTS"] || "50"
      ),
    };

    console.log("✅ RateLimitService initialized");
  }

  /**
   * Méthode générique pour vérifier le rate limiting
   * Factorise la logique commune de toutes les méthodes check*Limit
   */
  private async checkLimit(
    keyPrefix: string,
    identifier: string,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    if (!config.enabled) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now() + config.windowMs,
      };
    }

    const key = `rate_limit:${keyPrefix}:${identifier}`;
    const windowSeconds = Math.floor(config.windowMs / 1000);

    const current = await this.redis.incr(key);

    if (current === 1) {
      // Première requête, définir le TTL
      await this.redis.expire(key, windowSeconds);
    }

    const remaining = Math.max(0, config.maxRequests - current);
    const ttl = await this.redis.ttl(key);
    const resetTime = Date.now() + ttl * 1000;

    return {
      allowed: current <= config.maxRequests,
      remaining,
      resetTime,
    };
  }

  /**
   * Vérifier le rate limiting par IP (global)
   */
  async checkGlobalLimit(
    ip: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    return this.checkLimit("global", ip, this.globalConfig);
  }

  /**
   * Vérifier le rate limiting pour /api/auth/login
   */
  async checkAuthLoginLimit(
    ip: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    return this.checkLimit("auth_login", ip, this.authLoginConfig);
  }

  /**
   * Vérifier le rate limiting pour /api/payment/* (par utilisateur)
   */
  async checkPaymentLimit(
    userId: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    return this.checkLimit("payment", userId, this.paymentConfig);
  }

  /**
   * Vérifier le rate limiting pour /api/admin/* (par utilisateur)
   */
  async checkAdminLimit(
    userId: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    return this.checkLimit("admin", userId, this.adminConfig);
  }

  /**
   * Obtenir l'IP réelle depuis la requête
   */
  getClientIp(req: any): string {
    return (
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.headers["x-real-ip"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      "unknown"
    );
  }
}
