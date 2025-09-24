/**
 * CustomerCompanyRepository
 * Handles database operations for CustomerCompany entities
 */
const CustomerCompany = require("../models/CustomerCompany");

class CustomerCompanyRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Get company by ID
   * @param {number} id Company ID
   * @returns {Promise<CustomerCompany|null>} CustomerCompany or null if not found
   */
  async getById(id) {
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

      return CustomerCompany.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting company by ID:", error);
      throw new Error("Failed to retrieve company");
    }
  }

  /**
   * List companies by customer ID
   * @param {number} customerId Customer ID
   * @returns {Promise<CustomerCompany[]>} Array of companies
   */
  async listByCustomer(customerId) {
    try {
      const result = await this.pool.query(
        `SELECT company_id, customer_id, company_name, siret_number, vat_number, 
                created_at, updated_at
         FROM customer_companies 
         WHERE customer_id = $1
         ORDER BY created_at DESC`,
        [customerId]
      );

      return result.rows.map((row) => CustomerCompany.fromDbRow(row));
    } catch (error) {
      console.error("Error listing companies by customer:", error);
      throw new Error("Failed to retrieve companies");
    }
  }

  /**
   * Save new company
   * @param {CustomerCompany} company Company entity to save
   * @returns {Promise<CustomerCompany>} Saved company with ID
   */
  async save(company) {
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

      return CustomerCompany.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error saving company:", error);
      throw new Error("Failed to save company");
    }
  }

  /**
   * Update existing company
   * @param {CustomerCompany} company Company entity to update
   * @returns {Promise<CustomerCompany>} Updated company
   */
  async update(company) {
    try {
      const validation = company.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `UPDATE customer_companies 
         SET customer_id = $1, company_name = $2, siret_number = $3, vat_number = $4, 
             updated_at = NOW()
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

      return CustomerCompany.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error updating company:", error);
      throw new Error("Failed to update company");
    }
  }

  /**
   * Delete company
   * @param {CustomerCompany} company Company entity to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(company) {
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
   * Check if SIRET number exists
   * @param {string} siret SIRET number to check
   * @param {number|null} excludeId Company ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if SIRET exists
   */
  async siretExists(siret, excludeId = null) {
    try {
      if (!siret) return false;

      let query =
        "SELECT company_id FROM customer_companies WHERE siret_number = $1";
      const params = [siret];

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
   * @param {string} vat VAT number to check
   * @param {number|null} excludeId Company ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if VAT exists
   */
  async vatExists(vat, excludeId = null) {
    try {
      if (!vat) return false;

      let query =
        "SELECT company_id FROM customer_companies WHERE vat_number = $1";
      const params = [vat];

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

  /**
   * Count companies for customer
   * @param {number} customerId Customer ID
   * @returns {Promise<number>} Number of companies
   */
  async countByCustomer(customerId) {
    try {
      const result = await this.pool.query(
        "SELECT COUNT(*) FROM customer_companies WHERE customer_id = $1",
        [customerId]
      );

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Error counting companies:", error);
      throw new Error("Failed to count companies");
    }
  }

  /**
   * Search companies by name
   * @param {string} searchTerm Search term
   * @param {Object} options Search options
   * @returns {Promise<Object>} Companies and pagination info
   */
  async searchByName(searchTerm, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      const result = await this.pool.query(
        `SELECT company_id, customer_id, company_name, siret_number, vat_number, 
                created_at, updated_at
         FROM customer_companies 
         WHERE company_name ILIKE $1
         ORDER BY company_name
         LIMIT $2 OFFSET $3`,
        [`%${searchTerm}%`, limit, offset]
      );

      // Get total count
      const countResult = await this.pool.query(
        "SELECT COUNT(*) FROM customer_companies WHERE company_name ILIKE $1",
        [`%${searchTerm}%`]
      );

      return {
        companies: result.rows.map((row) => CustomerCompany.fromDbRow(row)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].count),
          pages: Math.ceil(countResult.rows[0].count / limit),
        },
      };
    } catch (error) {
      console.error("Error searching companies:", error);
      throw new Error("Failed to search companies");
    }
  }
}

module.exports = CustomerCompanyRepository;
