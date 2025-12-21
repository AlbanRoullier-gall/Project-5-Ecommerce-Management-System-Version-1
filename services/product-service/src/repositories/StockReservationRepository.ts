/**
 * Repository pour les réservations de stock
 * Gère les réservations temporaires de stock pour les paniers
 *
 * Architecture : Pattern Repository
 * - Abstraction d'accès aux données
 * - Opérations de base de données atomiques
 * - Gestion des réservations avec verrous
 */

import { Pool } from "pg";

export interface StockReservationData {
  id: number;
  product_id: number;
  session_id: string;
  quantity: number;
  status: "reserved" | "confirmed" | "expired" | "released";
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export class StockReservationRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Réserver du stock de manière atomique avec verrou
   * Utilise SELECT ... FOR UPDATE pour éviter les race conditions
   * @param productId ID du produit
   * @param quantity Quantité à réserver
   * @param sessionId ID de session du panier
   * @param ttlMinutes Durée de vie de la réservation en minutes (défaut: 30)
   * @returns Promise<StockReservationData> Réservation créée
   * @throws Error si stock insuffisant
   */
  async reserveStock(
    productId: number,
    quantity: number,
    sessionId: string,
    ttlMinutes: number = 30
  ): Promise<StockReservationData> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // Verrouiller la ligne produit pour éviter les race conditions
      const productResult = await client.query(
        `SELECT id, stock, is_active 
         FROM products 
         WHERE id = $1 
         FOR UPDATE`,
        [productId]
      );

      if (productResult.rows.length === 0) {
        await client.query("ROLLBACK");
        throw new Error(`Produit ${productId} non trouvé`);
      }

      const product = productResult.rows[0];
      if (!product.is_active) {
        await client.query("ROLLBACK");
        throw new Error("Ce produit n'est plus disponible");
      }

      // Calculer le stock disponible (stock réel - réservations actives)
      const reservedResult = await client.query(
        `SELECT COALESCE(SUM(quantity), 0) as total_reserved
         FROM stock_reservations
         WHERE product_id = $1 
         AND status = 'reserved'
         AND expires_at > NOW()`,
        [productId]
      );

      const totalReserved =
        parseInt(reservedResult.rows[0].total_reserved) || 0;
      const availableStock = product.stock - totalReserved;

      if (availableStock < quantity) {
        await client.query("ROLLBACK");
        throw new Error(
          `Stock insuffisant. Disponible: ${availableStock}, Demandé: ${quantity}`
        );
      }

      // Créer la réservation
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

      const insertResult = await client.query(
        `INSERT INTO stock_reservations 
         (product_id, session_id, quantity, status, expires_at, created_at, updated_at)
         VALUES ($1, $2, $3, 'reserved', $4, NOW(), NOW())
         RETURNING id, product_id, session_id, quantity, status, expires_at, created_at, updated_at`,
        [productId, sessionId, quantity, expiresAt]
      );

      await client.query("COMMIT");

      return insertResult.rows[0] as StockReservationData;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Libérer une réservation (lors de la suppression du panier ou expiration)
   * @param sessionId ID de session du panier
   * @param productId ID du produit (optionnel, si null libère toutes les réservations de la session)
   * @returns Promise<number> Nombre de réservations libérées
   */
  async releaseReservation(
    sessionId: string,
    productId?: number
  ): Promise<number> {
    try {
      let query: string;
      let params: any[];

      if (productId) {
        query = `UPDATE stock_reservations 
                 SET status = 'released', updated_at = NOW()
                 WHERE session_id = $1 
                 AND product_id = $2 
                 AND status = 'reserved'`;
        params = [sessionId, productId];
      } else {
        query = `UPDATE stock_reservations 
                 SET status = 'released', updated_at = NOW()
                 WHERE session_id = $1 
                 AND status = 'reserved'`;
        params = [sessionId];
      }

      const result = await this.pool.query(query, params);
      return result.rowCount || 0;
    } catch (error) {
      console.error("Erreur lors de la libération de la réservation:", error);
      throw error;
    }
  }

  /**
   * Confirmer une réservation (lors du checkout, convertir en commande)
   * @param sessionId ID de session du panier
   * @returns Promise<number> Nombre de réservations confirmées
   */
  async confirmReservations(sessionId: string): Promise<number> {
    try {
      const result = await this.pool.query(
        `UPDATE stock_reservations 
         SET status = 'confirmed', updated_at = NOW()
         WHERE session_id = $1 
         AND status = 'reserved'`,
        [sessionId]
      );
      return result.rowCount || 0;
    } catch (error) {
      console.error("Erreur lors de la confirmation de la réservation:", error);
      throw error;
    }
  }

  /**
   * Marquer les réservations expirées comme 'expired'
   * Appelé par un job de nettoyage périodique
   * @returns Promise<number> Nombre de réservations expirées
   */
  async expireOldReservations(): Promise<number> {
    try {
      const result = await this.pool.query(
        `UPDATE stock_reservations 
         SET status = 'expired', updated_at = NOW()
         WHERE status = 'reserved' 
         AND expires_at < NOW()`,
        []
      );
      return result.rowCount || 0;
    } catch (error) {
      console.error("Erreur lors de l'expiration des réservations:", error);
      throw error;
    }
  }

  /**
   * Obtenir le stock disponible (stock réel - réservations actives)
   * @param productId ID du produit
   * @returns Promise<number> Stock disponible
   */
  async getAvailableStock(productId: number): Promise<number> {
    try {
      // Récupérer le stock réel
      const productResult = await this.pool.query(
        `SELECT stock FROM products WHERE id = $1`,
        [productId]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Produit ${productId} non trouvé`);
      }

      const realStock = productResult.rows[0].stock || 0;

      // Calculer les réservations actives
      const reservedResult = await this.pool.query(
        `SELECT COALESCE(SUM(quantity), 0) as total_reserved
         FROM stock_reservations
         WHERE product_id = $1 
         AND status = 'reserved'
         AND expires_at > NOW()`,
        [productId]
      );

      const totalReserved =
        parseInt(reservedResult.rows[0].total_reserved) || 0;
      return Math.max(0, realStock - totalReserved);
    } catch (error) {
      console.error("Erreur lors du calcul du stock disponible:", error);
      throw error;
    }
  }

  /**
   * Mettre à jour la quantité d'une réservation existante
   * @param sessionId ID de session
   * @param productId ID du produit
   * @param newQuantity Nouvelle quantité
   * @returns Promise<StockReservationData | null> Réservation mise à jour ou null si non trouvée
   */
  async updateReservationQuantity(
    sessionId: string,
    productId: number,
    newQuantity: number
  ): Promise<StockReservationData | null> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // Vérifier si la réservation existe
      const existingResult = await client.query(
        `SELECT * FROM stock_reservations
         WHERE session_id = $1 
         AND product_id = $2 
         AND status = 'reserved'`,
        [sessionId, productId]
      );

      if (existingResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      const oldQuantity = existingResult.rows[0].quantity;
      const quantityDiff = newQuantity - oldQuantity;

      // Si la quantité augmente, vérifier le stock disponible
      if (quantityDiff > 0) {
        const availableStock = await this.getAvailableStock(productId);
        if (availableStock < quantityDiff) {
          await client.query("ROLLBACK");
          throw new Error(
            `Stock insuffisant pour augmenter la quantité. Disponible: ${availableStock}, Demandé: ${quantityDiff}`
          );
        }
      }

      // Mettre à jour la réservation
      const updateResult = await client.query(
        `UPDATE stock_reservations 
         SET quantity = $1, updated_at = NOW()
         WHERE session_id = $2 
         AND product_id = $3 
         AND status = 'reserved'
         RETURNING id, product_id, session_id, quantity, status, expires_at, created_at, updated_at`,
        [newQuantity, sessionId, productId]
      );

      await client.query("COMMIT");

      if (updateResult.rows.length === 0) {
        return null;
      }

      return updateResult.rows[0] as StockReservationData;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
