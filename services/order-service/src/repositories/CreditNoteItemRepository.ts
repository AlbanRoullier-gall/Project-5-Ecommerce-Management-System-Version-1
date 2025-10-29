import { Pool } from "pg";
import CreditNoteItem, { CreditNoteItemData } from "../models/CreditNoteItem";

export default class CreditNoteItemRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Sauvegarder un article d'avoir en base de données
   * @param {CreditNoteItem} item Entité article d'avoir
   * @returns {Promise<CreditNoteItem>} Article d'avoir sauvegardé
   */
  async save(item: CreditNoteItem): Promise<CreditNoteItem> {
    const query = `
      INSERT INTO credit_note_items (credit_note_id, product_id, product_name, quantity, 
                                    unit_price_ht, unit_price_ttc, vat_rate, 
                                    total_price_ht, total_price_ttc, 
                                    created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id, credit_note_id, product_id, product_name, quantity, 
                unit_price_ht, unit_price_ttc, vat_rate, 
                total_price_ht, total_price_ttc, created_at, updated_at
    `;

    const values = [
      item.creditNoteId,
      item.productId,
      item.productName,
      item.quantity,
      item.unitPriceHT,
      item.unitPriceTTC,
      item.vatRate,
      item.totalPriceHT,
      item.totalPriceTTC,
    ];

    const result = await this.pool.query(query, values);
    return new CreditNoteItem(result.rows[0]);
  }

  /**
   * Mettre à jour un article d'avoir en base de données
   * @param {CreditNoteItem} item Entité article d'avoir
   * @returns {Promise<CreditNoteItem>} Article d'avoir mis à jour
   */
  async update(item: CreditNoteItem): Promise<CreditNoteItem> {
    const query = `
      UPDATE credit_note_items 
      SET credit_note_id = $1, product_id = $2, product_name = $3, quantity = $4, 
          unit_price_ht = $5, unit_price_ttc = $6, vat_rate = $7, 
          total_price_ht = $8, total_price_ttc = $9
      WHERE id = $10
      RETURNING id, credit_note_id, product_id, product_name, quantity, 
                unit_price_ht, unit_price_ttc, vat_rate, 
                total_price_ht, total_price_ttc, created_at, updated_at
    `;

    const values = [
      item.creditNoteId,
      item.productId,
      item.productName,
      item.quantity,
      item.unitPriceHT,
      item.unitPriceTTC,
      item.vatRate,
      item.totalPriceHT,
      item.totalPriceTTC,
      item.id,
    ];

    const result = await this.pool.query(query, values);
    return new CreditNoteItem(result.rows[0]);
  }

  /**
   * Supprimer un article d'avoir de la base de données
   * @param {CreditNoteItem} item Entité article d'avoir
   * @returns {Promise<boolean>} True si supprimé avec succès
   */
  async delete(item: CreditNoteItem): Promise<boolean> {
    const query = "DELETE FROM credit_note_items WHERE id = $1";
    const result = await this.pool.query(query, [item.id]);
    return result.rowCount! > 0;
  }

  /**
   * Obtenir un article d'avoir par ID
   * @param {number} id ID de l'article d'avoir
   * @returns {Promise<CreditNoteItem|null>} Article d'avoir ou null si non trouvé
   */
  async getById(id: number): Promise<CreditNoteItem | null> {
    const query = `
      SELECT id, credit_note_id, product_id, product_name, quantity, 
             unit_price_ht, unit_price_ttc, vat_rate, 
             total_price_ht, total_price_ttc, created_at, updated_at
      FROM credit_note_items 
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? new CreditNoteItem(result.rows[0]) : null;
  }

  /**
   * Lister les articles d'avoir par avoir
   * @param {number} creditNoteId ID de l'avoir
   * @returns {Promise<CreditNoteItem[]>} Tableau des articles d'avoir
   */
  async listByCreditNote(creditNoteId: number): Promise<CreditNoteItem[]> {
    const query = `
      SELECT id, credit_note_id, product_id, product_name, quantity, 
             unit_price_ht, unit_price_ttc, vat_rate, 
             total_price_ht, total_price_ttc, created_at, updated_at
      FROM credit_note_items 
      WHERE credit_note_id = $1
      ORDER BY created_at
    `;

    const result = await this.pool.query(query, [creditNoteId]);
    return result.rows.map((row) => new CreditNoteItem(row));
  }

  /**
   * Supprimer tous les articles d'avoir par avoir
   * @param {number} creditNoteId ID de l'avoir
   * @returns {Promise<boolean>} True si supprimés avec succès
   */
  async deleteAllByCreditNote(creditNoteId: number): Promise<boolean> {
    const query = "DELETE FROM credit_note_items WHERE credit_note_id = $1";
    const result = await this.pool.query(query, [creditNoteId]);
    return result.rowCount! > 0;
  }

  /**
   * Obtenir les totaux d'un avoir
   * @param {number} creditNoteId ID de l'avoir
   * @returns {Promise<Object>} Totaux de l'avoir
   */
  async getCreditNoteTotals(creditNoteId: number): Promise<any> {
    const query = `
      SELECT 
        COALESCE(SUM(total_price_ht), 0) as totalHT,
        COALESCE(SUM(total_price_ttc), 0) as totalTTC,
        COALESCE(SUM(total_price_ttc - total_price_ht), 0) as totalVAT
      FROM credit_note_items 
      WHERE credit_note_id = $1
    `;

    const result = await this.pool.query(query, [creditNoteId]);
    const row = result.rows[0];

    return {
      totalHT: parseFloat(row.totalht),
      totalTTC: parseFloat(row.totalttc),
      totalVAT: parseFloat(row.totalvat),
    };
  }

  /**
   * Créer un article d'avoir
   */
  async createCreditNoteItem(
    creditNoteItemData: CreditNoteItemData
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

    const result = await this.pool.query(query, values);
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
   * Mettre à jour un article d'avoir
   */
  async updateCreditNoteItem(
    id: number,
    creditNoteItemData: Partial<CreditNoteItemData>
  ): Promise<CreditNoteItem> {
    const fields = [];
    const values = [];
    let paramCount = 0;

    if (creditNoteItemData.credit_note_id !== undefined) {
      fields.push(`credit_note_id = $${++paramCount}`);
      values.push(creditNoteItemData.credit_note_id);
    }
    if (creditNoteItemData.product_id !== undefined) {
      fields.push(`product_id = $${++paramCount}`);
      values.push(creditNoteItemData.product_id);
    }
    if (creditNoteItemData.quantity !== undefined) {
      fields.push(`quantity = $${++paramCount}`);
      values.push(creditNoteItemData.quantity);
    }
    if (creditNoteItemData.unit_price_ht !== undefined) {
      fields.push(`unit_price_ht = $${++paramCount}`);
      values.push(creditNoteItemData.unit_price_ht);
    }
    if (creditNoteItemData.unit_price_ttc !== undefined) {
      fields.push(`unit_price_ttc = $${++paramCount}`);
      values.push(creditNoteItemData.unit_price_ttc);
    }
    if (creditNoteItemData.total_price_ht !== undefined) {
      fields.push(`total_price_ht = $${++paramCount}`);
      values.push(creditNoteItemData.total_price_ht);
    }
    if (creditNoteItemData.total_price_ttc !== undefined) {
      fields.push(`total_price_ttc = $${++paramCount}`);
      values.push(creditNoteItemData.total_price_ttc);
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(id);

    const query = `
      UPDATE credit_note_items 
      SET ${fields.join(", ")} 
      WHERE id = $${++paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error("Credit note item not found");
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
          cni.total_price_ht as "totalPriceHT", cni.total_price_ttc as "totalPriceTTC"
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
