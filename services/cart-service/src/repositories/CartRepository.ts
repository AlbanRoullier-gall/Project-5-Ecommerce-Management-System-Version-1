/**
 * CartRepository
 * Repository pour la gestion des paniers avec Redis
 *
 * Architecture : Repository pattern
 * - Abstraction de la persistance
 * - Gestion Redis
 * - TTL et sessions
 */

import Redis from "ioredis";
import { Cart, CartData } from "../models/Cart";

export class CartRepository {
  private redis: Redis;
  private ttl: number;

  constructor() {
    // Configuration Redis avec gestion d'erreurs robuste
    // Options communes pour tous les modes de connexion (URL ou host/port)
    const redisOptions = {
      maxRetriesPerRequest: 3, // Limiter à 3 au lieu de 20 par défaut
      retryStrategy: (times: number) => {
        // Stratégie de reconnexion avec backoff exponentiel
        // Arrêter après 10 tentatives pour éviter les boucles infinies
        if (times > 10) {
          console.warn(
            `⚠️ Redis CartRepository: Arrêt de la reconnexion après ${times} tentatives`
          );
          return null; // Arrêter la reconnexion
        }
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
      lazyConnect: true, // Connexion différée pour attacher les listeners d'abord
      enableOfflineQueue: false, // Désactiver la queue offline pour éviter l'accumulation
      showFriendlyErrorStack: false,
      enableReadyCheck: true,
    };

    // Si REDIS_URL est fourni, parser l'URL et construire la config complète
    // pour garantir que toutes les options sont appliquées
    if (process.env.REDIS_URL) {
      try {
        // Parser l'URL Redis pour extraire les composants
        const redisUrl = process.env.REDIS_URL;
        const url = new URL(redisUrl);

        const redisConfig: {
          host: string;
          port: number;
          password?: string;
          db?: number;
          maxRetriesPerRequest: number;
          retryStrategy: (times: number) => number | null;
          reconnectOnError: (err: Error) => boolean;
          connectTimeout: number;
          commandTimeout: number;
          family: number;
          lazyConnect: boolean;
          enableOfflineQueue: boolean;
          showFriendlyErrorStack: boolean;
          enableReadyCheck: boolean;
          tls?: any; // Pour rediss:// (TLS)
        } = {
          host: url.hostname,
          port: parseInt(url.port || "6379"),
          ...redisOptions, // Appliquer TOUTES les options, y compris maxRetriesPerRequest: 3
        };

        // Extraire le mot de passe de l'URL si présent
        if (url.password) {
          redisConfig.password = decodeURIComponent(url.password);
        }

        // Extraire la base de données de l'URL si présente (format: redis://host:port/db)
        if (url.pathname && url.pathname.length > 1) {
          const db = parseInt(url.pathname.slice(1));
          if (!isNaN(db)) {
            redisConfig.db = db;
          }
        }

        // Gérer TLS pour rediss://
        if (url.protocol === "rediss:") {
          redisConfig.tls = {};
        }

        this.redis = new Redis(redisConfig);
        console.log(
          `✅ Redis CartRepository: Configuration depuis REDIS_URL (${url.hostname}:${redisConfig.port}) avec maxRetriesPerRequest=${redisConfig.maxRetriesPerRequest}`
        );
      } catch (urlError: any) {
        // Fallback: si le parsing échoue, créer un client avec l'URL et les options
        console.warn(
          `⚠️ Redis CartRepository: Erreur lors du parsing de REDIS_URL (${urlError.message}), utilisation directe avec options explicites`
        );
        this.redis = new Redis(process.env.REDIS_URL, {
          ...redisOptions,
          // Forcer les options critiques
          maxRetriesPerRequest: 3,
        });
        console.log(
          `✅ Redis CartRepository: Configuration fallback avec maxRetriesPerRequest=3 (forcé)`
        );
      }
    } else {
      // Configuration par host/port
      const redisConfig: {
        host: string;
        port: number;
        db: number;
        password?: string;
        maxRetriesPerRequest: number;
        retryStrategy: (times: number) => number | null;
        reconnectOnError: (err: Error) => boolean;
        connectTimeout: number;
        commandTimeout: number;
        family: number;
        lazyConnect: boolean;
        enableOfflineQueue: boolean;
        showFriendlyErrorStack: boolean;
        enableReadyCheck: boolean;
      } = {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        db: parseInt(process.env.REDIS_DB || "0"),
        ...redisOptions,
      };

      if (process.env.REDIS_PASSWORD) {
        redisConfig.password = process.env.REDIS_PASSWORD;
      }

      this.redis = new Redis(redisConfig);
      console.log(
        `✅ Redis CartRepository: Configuration depuis REDIS_HOST/REDIS_PORT avec maxRetriesPerRequest=${redisConfig.maxRetriesPerRequest}`
      );
    }

    // Gestionnaires d'événements Redis pour éviter les "Unhandled error event"
    // IMPORTANT: Attacher les listeners AVANT de connecter pour éviter les erreurs non gérées
    this.redis.on("connect", () => {
      console.log("✅ Redis CartRepository: Connexion établie");
    });

    this.redis.on("ready", () => {
      console.log("✅ Redis CartRepository: Prêt à recevoir des commandes");
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
          `⚠️ Redis CartRepository: Erreur de connexion (${err.message}), Redis sera réessayé automatiquement`
        );
      } else {
        console.error("❌ Redis CartRepository: Erreur:", err.message);
      }
      // Ne pas propager l'erreur pour éviter les "Unhandled error event"
    });

    this.redis.on("close", () => {
      console.warn("⚠️ Redis CartRepository: Connexion fermée");
    });

    this.redis.on("reconnecting", (delay: number) => {
      console.log(
        `🔄 Redis CartRepository: Reconnexion dans ${delay}ms...`
      );
    });

    this.redis.on("end", () => {
      console.warn("⚠️ Redis CartRepository: Connexion terminée");
    });

    // Connecter manuellement après avoir attaché tous les listeners
    this.redis.connect().catch((err) => {
      console.warn(
        `⚠️ Redis CartRepository: Erreur lors de la connexion initiale (${err.message}), reconnexion automatique en cours...`
      );
    });

    // TTL fixe : 1 jour (86400 secondes)
    this.ttl = parseInt(process.env.CART_TTL || "86400");

    console.log("✅ Redis CartRepository initialized");
  }

  /**
   * Créer un panier
   */
  async createCart(cart: Cart): Promise<void> {
    const key = this.getCartKey(cart.sessionId);
    await this.redis.setex(
      key,
      this.ttl,
      JSON.stringify({
        id: cart.id,
        session_id: cart.sessionId,
        items: cart.items.map((item) => ({
          id: item.id,
          product_id: item.productId,
          product_name: item.productName,
          description: item.description,
          image_url: item.imageUrl,
          quantity: item.quantity,
          vat_rate: item.vatRate,
          unit_price_ht: item.unitPriceHT,
          unit_price_ttc: item.unitPriceTTC,
          total_price_ht: item.totalPriceHT,
          total_price_ttc: item.totalPriceTTC,
          added_at: item.addedAt,
        })),
        subtotal: cart.subtotal,
        tax: cart.tax,
        total: cart.total,
        checkout_data: cart.checkoutData || null,
        created_at: cart.createdAt,
        updated_at: cart.updatedAt,
        expires_at: cart.expiresAt,
      })
    );
  }

  /**
   * Récupérer un panier
   */
  async getCart(sessionId: string): Promise<Cart | null> {
    const key = this.getCartKey(sessionId);
    const data = await this.redis.get(key);

    if (!data) {
      return null;
    }

    try {
      const cartData = JSON.parse(data) as CartData;
      return new Cart(cartData);
    } catch (error) {
      console.error("Error parsing cart data:", error);
      return null;
    }
  }

  /**
   * Mettre à jour un panier
   */
  async updateCart(cart: Cart): Promise<void> {
    const key = this.getCartKey(cart.sessionId);
    const itemsToStore = cart.items.map((item) => ({
      id: item.id,
      product_id: item.productId,
      product_name: item.productName,
      description: item.description,
      image_url: item.imageUrl,
      quantity: item.quantity,
      vat_rate: item.vatRate,
      unit_price_ht: item.unitPriceHT,
      unit_price_ttc: item.unitPriceTTC,
      total_price_ht: item.totalPriceHT,
      total_price_ttc: item.totalPriceTTC,
      added_at: item.addedAt,
    }));
    await this.redis.setex(
      key,
      this.ttl,
      JSON.stringify({
        id: cart.id,
        session_id: cart.sessionId,
        items: itemsToStore,
        subtotal: cart.subtotal,
        tax: cart.tax,
        total: cart.total,
        checkout_data: cart.checkoutData || null,
        created_at: cart.createdAt,
        updated_at: cart.updatedAt,
        expires_at: cart.expiresAt,
      })
    );
  }

  /**
   * Supprimer un panier
   */
  async deleteCart(sessionId: string): Promise<void> {
    const key = this.getCartKey(sessionId);
    await this.redis.del(key);
  }

  /**
   * Vérifier si un panier existe
   */
  async cartExists(sessionId: string): Promise<boolean> {
    const key = this.getCartKey(sessionId);
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  /**
   * Obtenir les statistiques des paniers
   */
  async getCartStats(): Promise<any> {
    const sessionKeys = await this.redis.keys("cart:session:*");
    const userKeys = await this.redis.keys("cart:user:*");

    let totalCarts = 0;
    let totalValue = 0;
    let totalItems = 0;

    // Analyser les paniers de session
    for (const key of sessionKeys) {
      const data = await this.redis.get(key);
      if (data) {
        const cart = new Cart(JSON.parse(data));
        totalCarts++;
        totalValue += cart.total;
        totalItems += cart.itemCount; // Utiliser itemCount calculé côté serveur
      }
    }

    // Analyser les paniers utilisateur
    for (const key of userKeys) {
      const data = await this.redis.get(key);
      if (data) {
        const cart = new Cart(JSON.parse(data));
        totalCarts++;
        totalValue += cart.total;
        totalItems += cart.itemCount; // Utiliser itemCount calculé côté serveur
      }
    }

    return {
      totalCarts,
      activeCarts: sessionKeys.length + userKeys.length,
      averageCartValue: totalCarts > 0 ? totalValue / totalCarts : 0,
      totalItems,
      period: "current",
    };
  }

  /**
   * Nettoyer les paniers expirés
   */
  async cleanupExpiredCarts(): Promise<number> {
    const allKeys = await this.redis.keys("cart:*");
    let cleanedCount = 0;

    for (const key of allKeys) {
      const ttl = await this.redis.ttl(key);
      if (ttl === -1) {
        // Pas de TTL définie
        await this.redis.del(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Obtenir la clé Redis pour un panier
   */
  private getCartKey(sessionId: string): string {
    return `cart:session:${sessionId}`;
  }
}
