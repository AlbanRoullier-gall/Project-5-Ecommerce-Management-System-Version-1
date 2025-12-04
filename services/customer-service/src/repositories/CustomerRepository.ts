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
}

export interface CustomerListResult {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
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
        `SELECT customer_id, first_name, last_name, email, 
                phone_number, created_at, updated_at
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
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phoneNumber: row.phone_number,
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
   * Récupérer un client par email
   * @param {string} email Email du client
   * @returns {Promise<Customer|null>} Client ou null si non trouvé
   */
  async getByEmail(email: string): Promise<Customer | null> {
    try {
      const result = await this.pool.query(
        `SELECT customer_id, first_name, last_name, email, 
                phone_number, created_at, updated_at
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
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phoneNumber: row.phone_number,
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
   * Lister les clients avec recherche
   * @param {Object} options Options de recherche
   * @returns {Promise<Customer[]>} Liste des clients
   */
  async listAll(options: CustomerListOptions = {}): Promise<Customer[]> {
    try {
      const { search = "" } = options;

      let query = `
        SELECT c.customer_id, c.first_name, c.last_name, c.email, 
               c.phone_number, c.created_at, c.updated_at
        FROM customers c
      `;

      const params: any[] = [];
      let paramCount = 0;
      const conditions: string[] = [];

      if (search) {
        // Rechercher dans first_name, last_name, email, phone_number
        // et aussi dans la concaténation first_name || ' ' || last_name (pour fullName)
        const searchPattern = `%${search}%`;
        conditions.push(
          `(
            c.first_name ILIKE $${++paramCount} OR 
            c.last_name ILIKE $${++paramCount} OR 
            c.email ILIKE $${++paramCount} OR 
            c.phone_number ILIKE $${++paramCount} OR
            (c.first_name || ' ' || c.last_name) ILIKE $${++paramCount}
          )`
        );
        // Utiliser le même pattern pour tous les champs
        params.push(
          searchPattern,
          searchPattern,
          searchPattern,
          searchPattern,
          searchPattern
        );
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      query += ` ORDER BY c.created_at DESC`;

      const result = await this.pool.query(query, params);

      return result.rows.map((row) => {
        const customerData: CustomerData = {
          customerId: row.customer_id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          phoneNumber: row.phone_number,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
        return new Customer(customerData);
      });
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
        `INSERT INTO customers (first_name, last_name, email, phone_number)
         VALUES ($1, $2, $3, $4)
         RETURNING customer_id, first_name, last_name, email, phone_number, 
                   created_at, updated_at`,
        [
          customer.firstName,
          customer.lastName,
          customer.email,
          customer.phoneNumber,
        ]
      );

      const row = result.rows[0];
      const customerData: CustomerData = {
        customerId: row.customer_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phoneNumber: row.phone_number,
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
         SET first_name = $1, last_name = $2, email = $3, 
             phone_number = $4
         WHERE customer_id = $5
         RETURNING customer_id, first_name, last_name, email, phone_number, 
                   created_at, updated_at`,
        [
          customer.firstName,
          customer.lastName,
          customer.email,
          customer.phoneNumber,
          customer.customerId,
        ]
      );

      if (result.rows.length === 0) {
        throw new Error("Customer not found");
      }

      const row = result.rows[0];
      const customerData: CustomerData = {
        customerId: row.customer_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phoneNumber: row.phone_number,
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
   * Compter le nombre total de clients
   * @returns {Promise<number>} Nombre total de clients
   */
  async count(): Promise<number> {
    try {
      const result = await this.pool.query(
        "SELECT COUNT(*) as total FROM customers"
      );
      return parseInt(result.rows[0].total, 10);
    } catch (error) {
      console.error("Error counting customers:", error);
      throw new Error("Failed to count customers");
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
      firstName: updateData.firstName ?? existingCustomer.firstName,
      lastName: updateData.lastName ?? existingCustomer.lastName,
      email: updateData.email ?? existingCustomer.email,
      phoneNumber: updateData.phoneNumber ?? existingCustomer.phoneNumber,
      createdAt: existingCustomer.createdAt,
      updatedAt: new Date(),
    });
  }
}

export default CustomerRepository;
