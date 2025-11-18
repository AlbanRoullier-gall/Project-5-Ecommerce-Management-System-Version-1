/**
 * CheckoutSnapshotRepository
 * Repository pour la gestion des snapshots checkout avec Redis
 *
 * Architecture : Repository pattern
 * - Abstraction de la persistance
 * - Gestion Redis
 * - TTL et sessions
 */

import Redis from "ioredis";

export class CheckoutSnapshotRepository {
  private redis: Redis;
  private ttl: number;

  constructor() {
    const redisConfig: any = {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      db: parseInt(process.env.REDIS_DB || "0"),
      maxRetriesPerRequest: 3,
    };

    if (process.env.REDIS_PASSWORD) {
      redisConfig.password = process.env.REDIS_PASSWORD;
    }

    this.redis = new Redis(redisConfig);

    // TTL fixe : 1 jour (86400 secondes) - même que les paniers
    this.ttl = parseInt(process.env.CHECKOUT_SNAPSHOT_TTL || "86400");

    console.log("✅ Redis CheckoutSnapshotRepository initialized");
  }

  /**
   * Sauvegarder un snapshot checkout
   */
  async saveSnapshot(cartSessionId: string, snapshot: any): Promise<void> {
    const key = this.getSnapshotKey(cartSessionId);
    await this.redis.setex(key, this.ttl, JSON.stringify(snapshot));
  }

  /**
   * Récupérer un snapshot checkout
   */
  async getSnapshot(cartSessionId: string): Promise<any | null> {
    const key = this.getSnapshotKey(cartSessionId);
    const data = await this.redis.get(key);

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error("Error parsing snapshot data:", error);
      return null;
    }
  }

  /**
   * Supprimer un snapshot checkout
   */
  async deleteSnapshot(cartSessionId: string): Promise<void> {
    const key = this.getSnapshotKey(cartSessionId);
    await this.redis.del(key);
  }

  /**
   * Vérifier si un snapshot existe
   */
  async snapshotExists(cartSessionId: string): Promise<boolean> {
    const key = this.getSnapshotKey(cartSessionId);
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  /**
   * Obtenir la clé Redis pour un snapshot
   */
  private getSnapshotKey(cartSessionId: string): string {
    return `checkout:snapshot:${cartSessionId}`;
  }
}
