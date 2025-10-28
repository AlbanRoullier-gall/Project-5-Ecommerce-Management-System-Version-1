/**
 * Repository d'Entreprises Clients
 * Gère les opérations de base de données pour les entités CustomerCompany
 */
import { Pool } from "pg";
import CustomerCompany, {
  CustomerCompanyData,
} from "../models/CustomerCompany";

class CustomerCompanyRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Récupérer une entreprise par ID
   * @param {number} id ID de l'entreprise
   * @returns {Promise<CustomerCompany|null>} CustomerCompany ou null si non trouvée
   */
  async getById(id: number): Promise<CustomerCompany | null> {
    try {
      const result = await this.pool.query(
        `SELECT company_id, customer_id, company_name, siret_number, vat_number, 
                created_at, updated_at
         FROM customer_companies 
         WHERE company_id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const companyData: CustomerCompanyData = {
        companyId: row.company_id,
        customerId: row.customer_id,
        companyName: row.company_name,
        siretNumber: row.siret_number,
        vatNumber: row.vat_number,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      return new CustomerCompany(companyData);
    } catch (error) {
      console.error("Error getting company by ID:", error);
      throw new Error("Failed to retrieve company");
    }
  }

  /**
   * Lister les entreprises par client
   * @param {number} customerId ID du client
   * @returns {Promise<CustomerCompany[]>} Tableau d'entreprises
   */
  async listByCustomer(customerId: number): Promise<CustomerCompany[]> {
    try {
      const result = await this.pool.query(
        `SELECT company_id, customer_id, company_name, siret_number, vat_number, 
                created_at, updated_at
         FROM customer_companies 
         WHERE customer_id = $1
         ORDER BY created_at DESC`,
        [customerId]
      );

      return result.rows.map((row) => {
        const companyData: CustomerCompanyData = {
          companyId: row.company_id,
          customerId: row.customer_id,
          companyName: row.company_name,
          siretNumber: row.siret_number,
          vatNumber: row.vat_number,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
        return new CustomerCompany(companyData);
      });
    } catch (error) {
      console.error("Error listing companies by customer:", error);
      throw new Error("Failed to retrieve companies");
    }
  }

  /**
   * Sauvegarder une nouvelle entreprise
   * @param {CustomerCompany} company Entité CustomerCompany à sauvegarder
   * @returns {Promise<CustomerCompany>} Entreprise sauvegardée avec ID
   */
  async save(company: CustomerCompany): Promise<CustomerCompany> {
    try {
      const validation = company.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `INSERT INTO customer_companies (customer_id, company_name, siret_number, vat_number, 
                                        created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING company_id, customer_id, company_name, siret_number, vat_number, 
                   created_at, updated_at`,
        [
          company.customerId,
          company.companyName,
          company.siretNumber,
          company.vatNumber,
        ]
      );

      const row = result.rows[0];
      const companyData: CustomerCompanyData = {
        companyId: row.company_id,
        customerId: row.customer_id,
        companyName: row.company_name,
        siretNumber: row.siret_number,
        vatNumber: row.vat_number,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      return new CustomerCompany(companyData);
    } catch (error) {
      console.error("Error saving company:", error);
      throw new Error("Failed to save company");
    }
  }

  /**
   * Mettre à jour une entreprise existante
   * @param {CustomerCompany} company Entité CustomerCompany à mettre à jour
   * @returns {Promise<CustomerCompany>} Entreprise mise à jour
   */
  async update(company: CustomerCompany): Promise<CustomerCompany> {
    try {
      const validation = company.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `UPDATE customer_companies 
         SET customer_id = $1, company_name = $2, siret_number = $3, vat_number = $4
         WHERE company_id = $5
         RETURNING company_id, customer_id, company_name, siret_number, vat_number, 
                   created_at, updated_at`,
        [
          company.customerId,
          company.companyName,
          company.siretNumber,
          company.vatNumber,
          company.companyId,
        ]
      );

      if (result.rows.length === 0) {
        throw new Error("Company not found");
      }

      const row = result.rows[0];
      const companyData: CustomerCompanyData = {
        companyId: row.company_id,
        customerId: row.customer_id,
        companyName: row.company_name,
        siretNumber: row.siret_number,
        vatNumber: row.vat_number,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      return new CustomerCompany(companyData);
    } catch (error) {
      console.error("Error updating company:", error);
      throw new Error("Failed to update company");
    }
  }

  /**
   * Supprimer une entreprise
   * @param {CustomerCompany} company Entité CustomerCompany à supprimer
   * @returns {Promise<boolean>} True si supprimée avec succès
   */
  async delete(company: CustomerCompany): Promise<boolean> {
    try {
      const result = await this.pool.query(
        "DELETE FROM customer_companies WHERE company_id = $1 RETURNING company_id",
        [company.companyId]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting company:", error);
      throw new Error("Failed to delete company");
    }
  }

  /**
   * Vérifier si le SIRET existe
   * @param {string} siret Numéro SIRET
   * @param {number|null} excludeId ID de l'entreprise à exclure de la vérification
   * @returns {Promise<boolean>} True si le SIRET existe
   */
  async siretExists(
    siret: string,
    excludeId: number | null = null
  ): Promise<boolean> {
    try {
      let query =
        "SELECT company_id FROM customer_companies WHERE siret_number = $1";
      const params: any[] = [siret];

      if (excludeId) {
        query += " AND company_id != $2";
        params.push(excludeId);
      }

      const result = await this.pool.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking SIRET existence:", error);
      throw new Error("Failed to check SIRET existence");
    }
  }

  /**
   * Vérifier si le numéro de TVA existe
   * @param {string} vat Numéro de TVA
   * @param {number|null} excludeId ID de l'entreprise à exclure de la vérification
   * @returns {Promise<boolean>} True si le numéro de TVA existe
   */
  async vatExists(
    vat: string,
    excludeId: number | null = null
  ): Promise<boolean> {
    try {
      let query =
        "SELECT company_id FROM customer_companies WHERE vat_number = $1";
      const params: any[] = [vat];

      if (excludeId) {
        query += " AND company_id != $2";
        params.push(excludeId);
      }

      const result = await this.pool.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking VAT existence:", error);
      throw new Error("Failed to check VAT existence");
    }
  }
}

export default CustomerCompanyRepository;
