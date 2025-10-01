/**
 * CustomerAddressRepository
 * Handles database operations for CustomerAddress entities
 */
const CustomerAddress = require("../models/CustomerAddress");

class CustomerAddressRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Get address by ID
   * @param {number} id Address ID
   * @returns {Promise<CustomerAddress|null>} CustomerAddress or null if not found
   */
  async getById(id) {
    try {
      const result = await this.pool.query(
        `SELECT address_id, customer_id, address_type, address, postal_code, city, 
                country_id, is_default, created_at, updated_at
         FROM customer_addresses 
         WHERE address_id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return CustomerAddress.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error getting address by ID:", error);
      throw new Error("Failed to retrieve address");
    }
  }

  /**
   * Get address by ID with joins
   * @param {number} id Address ID
   * @returns {Promise<CustomerAddress|null>} CustomerAddress with joined data or null if not found
   */
  async getByIdWithJoins(id) {
    try {
      const result = await this.pool.query(
        `SELECT ca.address_id, ca.customer_id, ca.address_type, ca.address, ca.postal_code, 
                ca.city, ca.country_id, ca.is_default, ca.created_at, ca.updated_at,
                co.country_name
         FROM customer_addresses ca
         LEFT JOIN countries co ON ca.country_id = co.country_id
         WHERE ca.address_id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return CustomerAddress.fromDbRowWithJoins(result.rows[0]);
    } catch (error) {
      console.error("Error getting address by ID with joins:", error);
      throw new Error("Failed to retrieve address");
    }
  }

  /**
   * List addresses by customer ID
   * @param {number} customerId Customer ID
   * @returns {Promise<CustomerAddress[]>} Array of addresses
   */
  async listByCustomer(customerId) {
    try {
      const result = await this.pool.query(
        `SELECT ca.address_id, ca.customer_id, ca.address_type, ca.address, ca.postal_code, 
                ca.city, ca.country_id, ca.is_default, ca.created_at, ca.updated_at,
                co.country_name
         FROM customer_addresses ca
         LEFT JOIN countries co ON ca.country_id = co.country_id
         WHERE ca.customer_id = $1
         ORDER BY ca.is_default DESC, ca.created_at DESC`,
        [customerId]
      );

      return result.rows.map((row) => CustomerAddress.fromDbRowWithJoins(row));
    } catch (error) {
      console.error("Error listing addresses by customer:", error);
      throw new Error("Failed to retrieve addresses");
    }
  }

  /**
   * Save new address
   * @param {CustomerAddress} address Address entity to save
   * @returns {Promise<CustomerAddress>} Saved address with ID
   */
  async save(address) {
    try {
      const validation = address.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `INSERT INTO customer_addresses (customer_id, address_type, address, postal_code, 
                                        city, country_id, is_default, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING address_id, customer_id, address_type, address, postal_code, city, 
                   country_id, is_default, created_at, updated_at`,
        [
          address.customerId,
          address.addressType,
          address.address,
          address.postalCode,
          address.city,
          address.countryId,
          address.isDefault,
        ]
      );

      return CustomerAddress.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error saving address:", error);
      throw new Error("Failed to save address");
    }
  }

  /**
   * Update existing address
   * @param {CustomerAddress} address Address entity to update
   * @returns {Promise<CustomerAddress>} Updated address
   */
  async update(address) {
    try {
      const validation = address.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `UPDATE customer_addresses 
         SET customer_id = $1, address_type = $2, address = $3, postal_code = $4, 
             city = $5, country_id = $6, is_default = $7, updated_at = NOW()
         WHERE address_id = $8
         RETURNING address_id, customer_id, address_type, address, postal_code, city, 
                   country_id, is_default, created_at, updated_at`,
        [
          address.customerId,
          address.addressType,
          address.address,
          address.postalCode,
          address.city,
          address.countryId,
          address.isDefault,
          address.addressId,
        ]
      );

      if (result.rows.length === 0) {
        throw new Error("Address not found");
      }

      return CustomerAddress.fromDbRow(result.rows[0]);
    } catch (error) {
      console.error("Error updating address:", error);
      throw new Error("Failed to update address");
    }
  }

  /**
   * Delete address
   * @param {CustomerAddress} address Address entity to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(address) {
    try {
      const result = await this.pool.query(
        "DELETE FROM customer_addresses WHERE address_id = $1 RETURNING address_id",
        [address.addressId]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error deleting address:", error);
      throw new Error("Failed to delete address");
    }
  }

  /**
   * Set default address for customer
   * @param {number} customerId Customer ID
   * @param {number} addressId Address ID to set as default
   * @returns {Promise<boolean>} True if updated successfully
   */
  async setDefaultAddress(customerId, addressId) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // First, unset all default addresses for this customer
      await client.query(
        "UPDATE customer_addresses SET is_default = false WHERE customer_id = $1",
        [customerId]
      );

      // Then set the specified address as default
      const result = await client.query(
        "UPDATE customer_addresses SET is_default = true WHERE address_id = $1 AND customer_id = $2 RETURNING address_id",
        [addressId, customerId]
      );

      await client.query("COMMIT");
      return result.rows.length > 0;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error setting default address:", error);
      throw new Error("Failed to set default address");
    } finally {
      client.release();
    }
  }

  /**
   * Get default address for customer
   * @param {number} customerId Customer ID
   * @param {string} addressType Address type (shipping/billing)
   * @returns {Promise<CustomerAddress|null>} Default address or null if not found
   */
  async getDefaultAddress(customerId, addressType) {
    try {
      const result = await this.pool.query(
        `SELECT ca.address_id, ca.customer_id, ca.address_type, ca.address, ca.postal_code, 
                ca.city, ca.country_id, ca.is_default, ca.created_at, ca.updated_at,
                co.country_name
         FROM customer_addresses ca
         LEFT JOIN countries co ON ca.country_id = co.country_id
         WHERE ca.customer_id = $1 AND ca.address_type = $2 AND ca.is_default = true`,
        [customerId, addressType]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return CustomerAddress.fromDbRowWithJoins(result.rows[0]);
    } catch (error) {
      console.error("Error getting default address:", error);
      throw new Error("Failed to retrieve default address");
    }
  }

  /**
   * Count addresses for customer
   * @param {number} customerId Customer ID
   * @returns {Promise<number>} Number of addresses
   */
  async countByCustomer(customerId) {
    try {
      const result = await this.pool.query(
        "SELECT COUNT(*) FROM customer_addresses WHERE customer_id = $1",
        [customerId]
      );

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Error counting addresses:", error);
      throw new Error("Failed to count addresses");
    }
  }
}

module.exports = CustomerAddressRepository;
