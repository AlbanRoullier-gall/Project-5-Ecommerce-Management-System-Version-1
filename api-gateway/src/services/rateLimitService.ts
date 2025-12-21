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
  private redisAvailable: boolean = false;
  // Nouvelles configurations par type de requête
  private getProductsConfig: RateLimitConfig;
  private getStaticConfig: RateLimitConfig;
  private postPutConfig: RateLimitConfig;
  private deleteConfig: RateLimitConfig;
  private authLoginConfig: RateLimitConfig;
  private authRegisterConfig: RateLimitConfig;
  private authPasswordResetConfig: RateLimitConfig;
  private paymentConfig: RateLimitConfig;

  constructor() {
    // Configuration Redis avec gestion d'erreurs robuste
    let redisConfig: any;

    if (process.env["REDIS_URL"]) {
      redisConfig = process.env["REDIS_URL"];
    } else {
      redisConfig = {
        host: process.env["REDIS_HOST"] || "localhost",
        port: parseInt(process.env["REDIS_PORT"] || "6379"),
        db: parseInt(process.env["REDIS_DB"] || "0"),
        // Configuration de reconnexion et timeout
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          // Stratégie de reconnexion avec backoff exponentiel
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError: (err: Error) => {
          // Reconnexion automatique sur certaines erreurs
          const targetError = "READONLY";
          if (err.message.includes(targetError)) {
            return true; // Reconnexion
          }
          return false; // Pas de reconnexion
        },
        connectTimeout: 10000, // 10 secondes
        commandTimeout: 5000, // 5 secondes par commande
        family: 4, // Forcer IPv4
        lazyConnect: false, // Connexion immédiate
        enableOfflineQueue: false, // Désactiver la queue offline pour éviter l'accumulation
      };

      if (process.env["REDIS_PASSWORD"]) {
        redisConfig.password = process.env["REDIS_PASSWORD"];
      }
    }

    this.redis = new Redis(redisConfig);

    // Gestionnaires d'événements Redis pour éviter les "Unhandled error event"
    this.redis.on("connect", () => {
      console.log("✅ Redis: Connexion établie");
      // Ne pas mettre à jour redisAvailable ici, attendre "ready"
    });

    this.redis.on("ready", () => {
      console.log("✅ Redis: Prêt à recevoir des commandes");
      this.redisAvailable = true;
    });

    this.redis.on("error", (err: Error) => {
      // Gérer les erreurs sans les propager pour éviter les "Unhandled error event"
      const errorMessage = err.message.toLowerCase();

      // Ignorer certaines erreurs qui sont normales lors de la reconnexion
      if (
        errorMessage.includes("connect etimedout") ||
        errorMessage.includes("connect econnrefused") ||
        errorMessage.includes("maxretriesperrequesterror")
      ) {
        console.warn(
          `⚠️ Redis: Erreur de connexion (${err.message}), Redis sera réessayé automatiquement`
        );
        this.redisAvailable = false;
      } else {
        console.error("❌ Redis: Erreur:", err.message);
        this.redisAvailable = false;
      }
      // Ne pas propager l'erreur pour éviter les "Unhandled error event"
    });

    this.redis.on("close", () => {
      console.warn("⚠️ Redis: Connexion fermée");
      this.redisAvailable = false;
    });

    this.redis.on("reconnecting", (delay: number) => {
      console.log(`🔄 Redis: Reconnexion dans ${delay}ms`);
      this.redisAvailable = false; // Pas encore disponible pendant la reconnexion
    });

    this.redis.on("end", () => {
      console.warn("⚠️ Redis: Connexion terminée");
      this.redisAvailable = false;
    });

    // Configuration des limites depuis les variables d'environnement
    // Requêtes GET (lecture) - limites élevées
    this.getProductsConfig = {
      enabled: process.env["RATE_LIMIT_GET_PRODUCTS_ENABLED"] !== "false",
      windowMs: parseInt(
        process.env["RATE_LIMIT_GET_PRODUCTS_WINDOW_MS"] || "60000"
      ), // 1 minute
      maxRequests: parseInt(
        process.env["RATE_LIMIT_GET_PRODUCTS_MAX_REQUESTS"] || "1000"
      ), // 1000 req/min par IP
    };

    this.getStaticConfig = {
      enabled: process.env["RATE_LIMIT_GET_STATIC_ENABLED"] !== "false",
      windowMs: parseInt(
        process.env["RATE_LIMIT_GET_STATIC_WINDOW_MS"] || "60000"
      ), // 1 minute
      maxRequests: parseInt(
        process.env["RATE_LIMIT_GET_STATIC_MAX_REQUESTS"] || "500"
      ), // 500 req/min par IP
    };

    // Requêtes POST/PUT (écriture) - limites strictes par utilisateur
    this.postPutConfig = {
      enabled: process.env["RATE_LIMIT_POST_PUT_ENABLED"] !== "false",
      windowMs: parseInt(
        process.env["RATE_LIMIT_POST_PUT_WINDOW_MS"] || "60000"
      ), // 1 minute
      maxRequests: parseInt(
        process.env["RATE_LIMIT_POST_PUT_MAX_REQUESTS"] || "100"
      ), // 100 req/min par utilisateur authentifié
    };

    // Requêtes DELETE (suppression) - limites très strictes
    this.deleteConfig = {
      enabled: process.env["RATE_LIMIT_DELETE_ENABLED"] !== "false",
      windowMs: parseInt(process.env["RATE_LIMIT_DELETE_WINDOW_MS"] || "60000"), // 1 minute
      maxRequests: parseInt(
        process.env["RATE_LIMIT_DELETE_MAX_REQUESTS"] || "20"
      ), // 20 req/min par utilisateur authentifié
    };

    // Requêtes authentification - très strictes
    this.authLoginConfig = {
      enabled: process.env["RATE_LIMIT_AUTH_LOGIN_ENABLED"] !== "false",
      windowMs: parseInt(
        process.env["RATE_LIMIT_AUTH_LOGIN_WINDOW_MS"] || "900000"
      ), // 15 minutes
      maxRequests: parseInt(
        process.env["RATE_LIMIT_AUTH_LOGIN_MAX_REQUESTS"] || "5"
      ), // 5 tentatives / 15 min par IP
    };

    this.authRegisterConfig = {
      enabled: process.env["RATE_LIMIT_AUTH_REGISTER_ENABLED"] !== "false",
      windowMs: parseInt(
        process.env["RATE_LIMIT_AUTH_REGISTER_WINDOW_MS"] || "3600000"
      ), // 1 heure
      maxRequests: parseInt(
        process.env["RATE_LIMIT_AUTH_REGISTER_MAX_REQUESTS"] || "3"
      ), // 3 tentatives / heure par IP
    };

    this.authPasswordResetConfig = {
      enabled:
        process.env["RATE_LIMIT_AUTH_PASSWORD_RESET_ENABLED"] !== "false",
      windowMs: parseInt(
        process.env["RATE_LIMIT_AUTH_PASSWORD_RESET_WINDOW_MS"] || "3600000"
      ), // 1 heure
      maxRequests: parseInt(
        process.env["RATE_LIMIT_AUTH_PASSWORD_RESET_MAX_REQUESTS"] || "3"
      ), // 3 tentatives / heure par IP
    };

    // Requêtes paiement - très strictes
    this.paymentConfig = {
      enabled: process.env["RATE_LIMIT_PAYMENT_ENABLED"] !== "false",
      windowMs: parseInt(
        process.env["RATE_LIMIT_PAYMENT_WINDOW_MS"] || "300000"
      ), // 5 minutes
      maxRequests: parseInt(
        process.env["RATE_LIMIT_PAYMENT_MAX_REQUESTS"] || "5"
      ), // 5 requêtes / 5 min par utilisateur
    };

    // Vérifier la connexion Redis après un court délai
    setTimeout(() => {
      this.checkRedisConnection();
    }, 1000);

    console.log("✅ RateLimitService initialized");
  }

  /**
   * Vérifier la connexion Redis et mettre à jour l'état de disponibilité
   */
  private async checkRedisConnection(): Promise<void> {
    try {
      await this.redis.ping();
      this.redisAvailable = true;
      console.log("✅ Redis: Connexion vérifiée et opérationnelle");
    } catch (error: any) {
      console.error("❌ Redis: Connexion non disponible:", error.message);
      this.redisAvailable = false;
    }
  }

  /**
   * Obtenir l'état de disponibilité de Redis
   */
  isRedisAvailable(): boolean {
    return this.redisAvailable;
  }

  /**
   * Méthode générique pour vérifier le rate limiting
   * Factorise la logique commune de toutes les méthodes check*Limit
   * Gère gracieusement les erreurs Redis en permettant les requêtes si Redis n'est pas disponible
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

    // Si Redis n'est pas disponible, permettre la requête (fallback gracieux)
    if (!this.redisAvailable) {
      console.warn(
        `⚠️ Redis non disponible, rate limiting désactivé pour ${keyPrefix}:${identifier}`
      );
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
      };
    }

    const key = `rate_limit:${keyPrefix}:${identifier}`;
    const windowSeconds = Math.floor(config.windowMs / 1000);

    try {
      const current = await this.redis.incr(key);

      if (current === 1) {
        // Première requête, définir le TTL
        try {
          await this.redis.expire(key, windowSeconds);
        } catch (expireError) {
          console.error(
            `❌ Redis: Erreur lors de la définition du TTL pour ${key}:`,
            expireError
          );
          // Continuer même si expire échoue
        }
      }

      const remaining = Math.max(0, config.maxRequests - current);
      let ttl = windowSeconds;
      try {
        ttl = await this.redis.ttl(key);
        if (ttl < 0) {
          ttl = windowSeconds; // Fallback si TTL invalide
        }
      } catch (ttlError) {
        console.error(
          `❌ Redis: Erreur lors de la récupération du TTL pour ${key}:`,
          ttlError
        );
        // Utiliser windowSeconds comme fallback
      }

      const resetTime = Date.now() + ttl * 1000;

      return {
        allowed: current <= config.maxRequests,
        remaining,
        resetTime,
      };
    } catch (error: any) {
      // En cas d'erreur Redis, permettre la requête (fallback gracieux)
      console.error(
        `❌ Redis: Erreur lors de la vérification du rate limit pour ${key}:`,
        error.message
      );
      this.redisAvailable = false;

      // Permettre la requête si Redis est indisponible
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
      };
    }
  }

  /**
   * Vérifier le rate limiting pour GET /api/products/* (par IP)
   */
  async checkGetProductsLimit(
    ip: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    return this.checkLimit("get_products", ip, this.getProductsConfig);
  }

  /**
   * Vérifier le rate limiting pour GET pages statiques (par IP)
   */
  async checkGetStaticLimit(
    ip: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    return this.checkLimit("get_static", ip, this.getStaticConfig);
  }

  /**
   * Vérifier le rate limiting pour POST/PUT (par utilisateur authentifié)
   */
  async checkPostPutLimit(
    userId: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    return this.checkLimit("post_put", userId, this.postPutConfig);
  }

  /**
   * Vérifier le rate limiting pour DELETE (par utilisateur authentifié)
   */
  async checkDeleteLimit(
    userId: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    return this.checkLimit("delete", userId, this.deleteConfig);
  }

  /**
   * Vérifier le rate limiting pour /api/auth/login (par IP)
   */
  async checkAuthLoginLimit(
    ip: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    return this.checkLimit("auth_login", ip, this.authLoginConfig);
  }

  /**
   * Vérifier le rate limiting pour /api/auth/register (par IP)
   */
  async checkAuthRegisterLimit(
    ip: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    return this.checkLimit("auth_register", ip, this.authRegisterConfig);
  }

  /**
   * Vérifier le rate limiting pour /api/auth/reset-password (par IP)
   */
  async checkAuthPasswordResetLimit(
    ip: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    return this.checkLimit(
      "auth_password_reset",
      ip,
      this.authPasswordResetConfig
    );
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
