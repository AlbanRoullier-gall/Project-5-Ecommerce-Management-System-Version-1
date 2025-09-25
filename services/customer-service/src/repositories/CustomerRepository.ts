/**
 * CustomerRepository
 * Handles database operations for Customer entities
 */
import { Pool } from "pg";
import Customer from "../models/Customer";

export interface CustomerListOptions {
  page?: number;
  limit?: number;
  search?: string;
  activeOnly?: boolean;
}

export interface CustomerListResult {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class CustomerRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Get customer by ID
   * @param {number} id Customer ID
   * @returns {Promise<Customer|null>} Customer or null if not found
   */
  async getById(id: number): Promise<Customer | null> {
    try {
      const result = await this.pool.query(
        `SELECT customer_id, civility_id, first_name, last_name, email, password_hash, 
                socio_professional_category_id, phone_number, birthday, is_active, 
                created_at, updated_at
         FROM customers 
         WHERE customer_id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return Customer.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting customer by ID:", error);
      throw new Error("Failed to retrieve customer");
    }
  }

  /**
   * Get customer by ID with joins
   * @param {number} id Customer ID
   * @returns {Promise<Customer|null>} Customer with joined data or null if not found
   */
  async getByIdWithJoins(id: number): Promise<Customer | null> {
    try {
      const result = await this.pool.query(
        `SELECT c.customer_id, c.civility_id, c.first_name, c.last_name, c.email, 
                c.socio_professional_category_id, c.phone_number, c.birthday, c.is_active,
                c.created_at, c.updated_at,
                civ.abbreviation as civility,
                spc.category_name as socio_professional_category
         FROM customers c
         LEFT JOIN civilities civ ON c.civility_id = civ.civility_id
         LEFT JOIN socio_professional_categories spc ON c.socio_professional_category_id = spc.category_id
         WHERE c.customer_id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return Customer.fromDbRowWithJoins(result.rows[0]);
    } catch (error) {
      console.error("Error getting customer by ID with joins:", error);
      throw new Error("Failed to retrieve customer");
    }
  }

  /**
   * Get customer by email
   * @param {string} email Customer email
   * @returns {Promise<Customer|null>} Customer or null if not found
   */
  async getByEmail(email: string): Promise<Customer | null> {
    try {
      const result = await this.pool.query(
        `SELECT customer_id, civility_id, first_name, last_name, email, password_hash, 
                socio_professional_category_id, phone_number, birthday, is_active, 
                created_at, updated_at
         FROM customers 
         WHERE email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return Customer.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting customer by email:", error);
      throw new Error("Failed to retrieve customer");
    }
  }

  /**
   * List all active customers
   * @returns {Promise<Customer[]>} Array of active customers
   */
  async listAllActive(): Promise<Customer[]> {
    try {
      const result = await this.pool.query(
        `SELECT customer_id, civility_id, first_name, last_name, email, 
                socio_professional_category_id, phone_number, birthday, is_active, 
                created_at, updated_at
         FROM customers 
         WHERE is_active = true
         ORDER BY created_at DESC`
      );

      return result.rows.map((row) => Customer.fromDbRow(row));
    } catch (error) {
      console.error("Error listing active customers:", error);
      throw new Error("Failed to retrieve customers");
    }
  }

  /**
   * List customers with pagination and search
   * @param {Object} options Pagination and search options
   * @returns {Promise<Object>} Customers and pagination info
   */
  async listAll(
    options: CustomerListOptions = {}
  ): Promise<CustomerListResult> {
    try {
      const { page = 1, limit = 10, search = "", activeOnly = false } = options;
      const offset = (page - 1) * limit;

      let query = `
        SELECT c.customer_id, c.civility_id, c.first_name, c.last_name, c.email, 
               c.socio_professional_category_id, c.phone_number, c.birthday, c.is_active, 
               c.created_at, c.updated_at,
               civ.abbreviation as civility,
               spc.category_name as socio_professional_category
        FROM customers c
        LEFT JOIN civilities civ ON c.civility_id = civ.civility_id
        LEFT JOIN socio_professional_categories spc ON c.socio_professional_category_id = spc.category_id
      `;

      const params: any[] = [];
      let paramCount = 0;
      const conditions: string[] = [];

      if (activeOnly) {
        conditions.push(`c.is_active = true`);
      }

      if (search) {
        conditions.push(
          `(c.first_name ILIKE $${++paramCount} OR c.last_name ILIKE $${paramCount} OR c.email ILIKE $${paramCount})`
        );
        params.push(`%${search}%`);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      query += ` ORDER BY c.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      params.push(limit, offset);

      const result = await this.pool.query(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) 
        FROM customers c
        LEFT JOIN civilities civ ON c.civility_id = civ.civility_id
        LEFT JOIN socio_professional_categories spc ON c.socio_professional_category_id = spc.category_id
      `;

      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(" AND ")}`;
      }

      const countResult = await this.pool.query(
        countQuery,
        params.slice(0, -2)
      );

      return {
        customers: result.rows.map((row) => Customer.fromDbRowWithJoins(row)),
        pagination: {
          page: parseInt(page.toString()),
          limit: parseInt(limit.toString()),
          total: parseInt(countResult.rows[0].count),
          pages: Math.ceil(countResult.rows[0].count / limit),
        },
      };
    } catch (error) {
      console.error("Error listing customers:", error);
      throw new Error("Failed to list customers");
    }
  }

  /**
   * Save new customer
   * @param {Customer} customer Customer entity to save
   * @returns {Promise<Customer>} Saved customer with ID
   */
  async save(customer: Customer): Promise<Customer> {
    try {
      const validation = customer.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `INSERT INTO customers (civility_id, first_name, last_name, email, password_hash, 
                               socio_professional_category_id, phone_number, birthday, is_active, 
                               created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         RETURNING customer_id, civility_id, first_name, last_name, email, 
                   socio_professional_category_id, phone_number, birthday, is_active, 
                   created_at, updated_at`,
        [
          customer.civilityId,
          customer.firstName,
          customer.lastName,
          customer.email,
          customer.passwordHash,
          customer.socioProfessionalCategoryId,
          customer.phoneNumber,
          customer.birthday,
          customer.isActive,
        ]
      );

      return Customer.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error saving customer:", error);
      throw new Error("Failed to save customer");
    }
  }

  /**
   * Update existing customer
   * @param {Customer} customer Customer entity to update
   * @returns {Promise<Customer>} Updated customer
   */
  async update(customer: Customer): Promise<Customer> {
    try {
      const validation = customer.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `UPDATE customers 
         SET civility_id = $1, first_name = $2, last_name = $3, email = $4, 
             socio_professional_category_id = $5, phone_number = $6, birthday = $7, 
             is_active = $8, updated_at = NOW()
         WHERE customer_id = $9
         RETURNING customer_id, civility_id, first_name, last_name, email, 
                   socio_professional_category_id, phone_number, birthday, is_active, 
                   created_at, updated_at`,
        [
          customer.civilityId,
          customer.firstName,
          customer.lastName,
          customer.email,
          customer.socioProfessionalCategoryId,
          customer.phoneNumber,
          customer.birthday,
          customer.isActive,
          customer.customerId,
        ]
      );

      if (result.rows.length === 0) {
        throw new Error("Customer not found");
      }

      return Customer.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error updating customer:", error);
      throw new Error("Failed to update customer");
    }
  }

  /**
   * Delete customer
   * @param {Customer} customer Customer entity to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(customer: Customer): Promise<boolean> {
    try {
      const result = await this.pool.query(
        "DELETE FROM customers WHERE customer_id = $1 RETURNING customer_id",
        [customer.customerId]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw new Error("Failed to delete customer");
    }
  }

  /**
   * Check if email exists
   * @param {string} email Email to check
   * @param {number|null} excludeId Customer ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if email exists
   */
  async emailExists(
    email: string,
    excludeId: number | null = null
  ): Promise<boolean> {
    try {
      let query = "SELECT customer_id FROM customers WHERE email = $1";
      const params: any[] = [email];

      if (excludeId) {
        query += " AND customer_id != $2";
        params.push(excludeId);
      }

      const result = await this.pool.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking email existence:", error);
      throw new Error("Failed to check email existence");
    }
  }

  /**
   * Update customer password
   * @param {number} customerId Customer ID
   * @param {string} passwordHash New password hash
   * @returns {Promise<boolean>} True if updated successfully
   */
  async updatePassword(
    customerId: number,
    passwordHash: string
  ): Promise<boolean> {
    try {
      const result = await this.pool.query(
        "UPDATE customers SET password_hash = $1, updated_at = NOW() WHERE customer_id = $2 RETURNING customer_id",
        [passwordHash, customerId]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error updating customer password:", error);
      throw new Error("Failed to update password");
    }
  }
}

export default CustomerRepository;
