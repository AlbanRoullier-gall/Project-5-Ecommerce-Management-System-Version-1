/**
 * Repository de Clients
 * Gère les opérations de base de données pour les entités Customer
 */
import { Pool } from "pg";
import Customer, { CustomerData } from "../models/Customer";

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
  public pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Récupérer un client par ID
   * @param {number} id ID du client
   * @returns {Promise<Customer|null>} Client ou null si non trouvé
   */
  async getById(id: number): Promise<Customer | null> {
    try {
      const result = await this.pool.query(
        `SELECT customer_id, civility_id, first_name, last_name, email, 
                socio_professional_category_id, phone_number, birthday, is_active, 
                created_at, updated_at
         FROM customers 
         WHERE customer_id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const customerData: CustomerData = {
        customerId: row.customer_id,
        civilityId: row.civility_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        socioProfessionalCategoryId: row.socio_professional_category_id,
        phoneNumber: row.phone_number,
        birthday: row.birthday,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      return new Customer(customerData);
    } catch (error) {
      console.error("Error getting customer by ID:", error);
      throw new Error("Failed to retrieve customer");
    }
  }

  /**
   * Récupérer un client par ID avec jointures
   * @param {number} id ID du client
   * @returns {Promise<Customer|null>} Client avec données jointes ou null si non trouvé
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

      const row = result.rows[0];
      const customerData: CustomerData = {
        customerId: row.customer_id,
        civilityId: row.civility_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        socioProfessionalCategoryId: row.socio_professional_category_id,
        phoneNumber: row.phone_number,
        birthday: row.birthday,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      return new Customer(customerData);
    } catch (error) {
      console.error("Error getting customer by ID with joins:", error);
      throw new Error("Failed to retrieve customer");
    }
  }

  /**
   * Récupérer un client par email
   * @param {string} email Email du client
   * @returns {Promise<Customer|null>} Client ou null si non trouvé
   */
  async getByEmail(email: string): Promise<Customer | null> {
    try {
      const result = await this.pool.query(
        `SELECT customer_id, civility_id, first_name, last_name, email, 
                socio_professional_category_id, phone_number, birthday, is_active, 
                created_at, updated_at
         FROM customers 
         WHERE email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const customerData: CustomerData = {
        customerId: row.customer_id,
        civilityId: row.civility_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        socioProfessionalCategoryId: row.socio_professional_category_id,
        phoneNumber: row.phone_number,
        birthday: row.birthday,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      return new Customer(customerData);
    } catch (error) {
      console.error("Error getting customer by email:", error);
      throw new Error("Failed to retrieve customer");
    }
  }

  /**
   * Lister tous les clients actifs
   * @returns {Promise<Customer[]>} Tableau des clients actifs
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

      return result.rows.map((row) => new Customer(row as CustomerData));
    } catch (error) {
      console.error("Error listing active customers:", error);
      throw new Error("Failed to retrieve customers");
    }
  }

  /**
   * Lister les clients avec pagination et recherche
   * @param {Object} options Options de pagination et de recherche
   * @returns {Promise<Object>} Clients et informations de pagination
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

      // Obtenir le nombre total
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
        customers: result.rows.map((row) => {
          const customerData: CustomerData = {
            customerId: row.customer_id,
            civilityId: row.civility_id,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            socioProfessionalCategoryId: row.socio_professional_category_id,
            phoneNumber: row.phone_number,
            birthday: row.birthday,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          };
          return new Customer(customerData);
        }),
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
   * Sauvegarder un nouveau client
   * @param {Customer} customer Entité Customer à sauvegarder
   * @returns {Promise<Customer>} Client sauvegardé avec ID
   */
  async save(customer: Customer): Promise<Customer> {
    try {
      const validation = customer.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `INSERT INTO customers (civility_id, first_name, last_name, email, 
                               socio_professional_category_id, phone_number, birthday, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
        ]
      );

      const row = result.rows[0];
      const customerData: CustomerData = {
        customerId: row.customer_id,
        civilityId: row.civility_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        socioProfessionalCategoryId: row.socio_professional_category_id,
        phoneNumber: row.phone_number,
        birthday: row.birthday,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      return new Customer(customerData);
    } catch (error) {
      console.error("Error saving customer:", error);
      throw new Error("Failed to save customer");
    }
  }

  /**
   * Mettre à jour un client existant
   * @param {Customer} customer Entité Customer à mettre à jour
   * @returns {Promise<Customer>} Client mis à jour
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
             is_active = $8
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

      const row = result.rows[0];
      const customerData: CustomerData = {
        customerId: row.customer_id,
        civilityId: row.civility_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        socioProfessionalCategoryId: row.socio_professional_category_id,
        phoneNumber: row.phone_number,
        birthday: row.birthday,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      return new Customer(customerData);
    } catch (error) {
      console.error("Error updating customer:", error);
      throw new Error("Failed to update customer");
    }
  }

  /**
   * Supprimer un client
   * @param {Customer} customer Entité Customer à supprimer
   * @returns {Promise<boolean>} True si supprimé avec succès
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
   * Vérifier si l'email existe
   * @param {string} email Email à vérifier
   * @param {number|null} excludeId ID du client à exclure de la vérification (pour les mises à jour)
   * @returns {Promise<boolean>} True si l'email existe
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
   * Créer un client avec fusion des données (comme auth-service)
   */
  createCustomerWithMerge(
    existingCustomer: Customer,
    updateData: Partial<CustomerData>
  ): Customer {
    return new Customer({
      customerId: existingCustomer.customerId,
      civilityId: updateData.civilityId ?? existingCustomer.civilityId,
      firstName: updateData.firstName ?? existingCustomer.firstName,
      lastName: updateData.lastName ?? existingCustomer.lastName,
      email: updateData.email ?? existingCustomer.email,
      socioProfessionalCategoryId:
        updateData.socioProfessionalCategoryId ??
        existingCustomer.socioProfessionalCategoryId,
      phoneNumber: updateData.phoneNumber ?? existingCustomer.phoneNumber,
      birthday: updateData.birthday ?? existingCustomer.birthday,
      isActive: updateData.isActive ?? existingCustomer.isActive,
      createdAt: existingCustomer.createdAt,
      updatedAt: new Date(),
    });
  }
}

export default CustomerRepository;
