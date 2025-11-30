import { Pool } from "pg";
import CreditNoteItem, { CreditNoteItemData } from "../models/CreditNoteItem";

export default class CreditNoteItemRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Créer un article d'avoir
   * @param {CreditNoteItemData} creditNoteItemData Données de l'article d'avoir
   * @param {any} client Client de transaction optionnel (pour les transactions)
   */
  async createCreditNoteItem(
    creditNoteItemData: CreditNoteItemData,
    client?: any
  ): Promise<CreditNoteItem> {
    const query = `
      INSERT INTO credit_note_items (
        credit_note_id, product_id, product_name, quantity, unit_price_ht,
        unit_price_ttc, vat_rate, total_price_ht, total_price_ttc
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      creditNoteItemData.credit_note_id,
      creditNoteItemData.product_id,
      // product_name est optionnel dans le modèle ; par défaut null
      (creditNoteItemData as any).product_name ?? null,
      creditNoteItemData.quantity,
      creditNoteItemData.unit_price_ht,
      creditNoteItemData.unit_price_ttc,
      creditNoteItemData.vat_rate,
      creditNoteItemData.total_price_ht,
      creditNoteItemData.total_price_ttc,
    ];

    const executor = client || this.pool;
    const result = await executor.query(query, values);
    return new CreditNoteItem(result.rows[0]);
  }

  /**
   * Obtenir un article d'avoir par ID
   */
  async getCreditNoteItemById(id: number): Promise<CreditNoteItem | null> {
    const query = `SELECT * FROM credit_note_items WHERE id = $1`;
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return new CreditNoteItem(result.rows[0]);
  }

  /**
   * Supprimer un article d'avoir
   */
  async deleteCreditNoteItem(id: number): Promise<boolean> {
    const query = `DELETE FROM credit_note_items WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  /**
   * Obtenir les articles d'avoir par ID d'avoir
   */
  async getCreditNoteItemsByCreditNoteId(
    creditNoteId: number
  ): Promise<CreditNoteItem[]> {
    const query = `
      SELECT * FROM credit_note_items 
      WHERE credit_note_id = $1 
      ORDER BY created_at
    `;

    const result = await this.pool.query(query, [creditNoteId]);
    return result.rows.map((row) => new CreditNoteItem(row));
  }

  /**
   * Récupérer les articles d'un avoir
   * @param {number} creditNoteId ID de l'avoir
   * @returns {Promise<any[]>} Liste des articles
   */
  async getItemsByCreditNoteId(creditNoteId: number): Promise<any[]> {
    try {
      const query = `
        SELECT 
          cni.id, cni.product_id as "productId", cni.product_name as "productName",
          cni.quantity, cni.unit_price_ht as "unitPriceHT", cni.unit_price_ttc as "unitPriceTTC",
          cni.vat_rate as "vatRate", cni.total_price_ht as "totalPriceHT", cni.total_price_ttc as "totalPriceTTC"
        FROM credit_note_items cni
        WHERE cni.credit_note_id = $1
        ORDER BY cni.id
      `;

      const result = await this.pool.query(query, [creditNoteId]);
      return result.rows;
    } catch (error) {
      console.error(
        "Error getting credit note items by credit note ID:",
        error
      );
      throw error;
    }
  }
}
