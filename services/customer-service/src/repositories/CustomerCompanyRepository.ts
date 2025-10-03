/**
 * CustomerCompanyRepository
 * Handles database operations for CustomerCompany entities
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
   * Get company by ID
   * @param {number} id Company ID
   * @returns {Promise<CustomerCompany|null>} CustomerCompany or null if not found
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
   * List companies by customer
   * @param {number} customerId Customer ID
   * @returns {Promise<CustomerCompany[]>} Array of companies
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
   * Save new company
   * @param {CustomerCompany} company CustomerCompany entity to save
   * @returns {Promise<CustomerCompany>} Saved company with ID
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
   * Update existing company
   * @param {CustomerCompany} company CustomerCompany entity to update
   * @returns {Promise<CustomerCompany>} Updated company
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
   * Delete company
   * @param {CustomerCompany} company CustomerCompany entity to delete
   * @returns {Promise<boolean>} True if deleted successfully
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
   * Check if SIRET exists
   * @param {string} siret SIRET number
   * @param {number|null} excludeId Company ID to exclude from check
   * @returns {Promise<boolean>} True if SIRET exists
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
   * Check if VAT number exists
   * @param {string} vat VAT number
   * @param {number|null} excludeId Company ID to exclude from check
   * @returns {Promise<boolean>} True if VAT number exists
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
