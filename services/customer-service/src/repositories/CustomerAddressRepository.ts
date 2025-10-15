/**
 * CustomerAddressRepository
 * Handles database operations for CustomerAddress entities
 */
import { Pool } from "pg";
import CustomerAddress, {
  CustomerAddressData,
} from "../models/CustomerAddress";

class CustomerAddressRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Check if an address already exists for a customer with the same fields
   * A duplicate is defined by same customer_id, address_type, address, postal_code, city, country_id
   */
  async existsForCustomer(params: {
    customerId: number;
    addressType: string;
    address: string;
    postalCode: string;
    city: string;
    countryId: number;
  }): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `SELECT address_id FROM customer_addresses
         WHERE customer_id = $1
           AND address_type = $2
           AND address = $3
           AND postal_code = $4
           AND city = $5
           AND country_id = $6
         LIMIT 1`,
        [
          params.customerId,
          params.addressType,
          params.address,
          params.postalCode,
          params.city,
          params.countryId,
        ]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking existing address:", error);
      throw new Error("Failed to check existing address");
    }
  }

  /**
   * Get address by ID
   * @param {number} id Address ID
   * @returns {Promise<CustomerAddress|null>} CustomerAddress or null if not found
   */
  async getById(id: number): Promise<CustomerAddress | null> {
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

      const row = result.rows[0];
      const addressData: CustomerAddressData = {
        addressId: row.address_id,
        customerId: row.customer_id,
        addressType: row.address_type,
        address: row.address,
        postalCode: row.postal_code,
        city: row.city,
        countryId: row.country_id,
        isDefault: row.is_default,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      return new CustomerAddress(addressData);
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
  async getByIdWithJoins(id: number): Promise<CustomerAddress | null> {
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

      const row = result.rows[0];
      const addressData: CustomerAddressData = {
        addressId: row.address_id,
        customerId: row.customer_id,
        addressType: row.address_type,
        address: row.address,
        postalCode: row.postal_code,
        city: row.city,
        countryId: row.country_id,
        isDefault: row.is_default,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      return new CustomerAddress(addressData);
    } catch (error) {
      console.error("Error getting address by ID with joins:", error);
      throw new Error("Failed to retrieve address");
    }
  }

  /**
   * List addresses by customer
   * @param {number} customerId Customer ID
   * @returns {Promise<CustomerAddress[]>} Array of addresses
   */
  async listByCustomer(customerId: number): Promise<CustomerAddress[]> {
    try {
      const result = await this.pool.query(
        `SELECT address_id, customer_id, address_type, address, postal_code, city, 
                country_id, is_default, created_at, updated_at
         FROM customer_addresses 
         WHERE customer_id = $1
         ORDER BY is_default DESC, created_at DESC`,
        [customerId]
      );

      // Map explicit snake_case DB columns to camelCase model fields
      return result.rows.map(
        (row) =>
          new CustomerAddress({
            addressId: row.address_id,
            customerId: row.customer_id,
            addressType: row.address_type,
            address: row.address,
            postalCode: row.postal_code,
            city: row.city,
            countryId: row.country_id,
            isDefault: row.is_default,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          } as CustomerAddressData)
      );
    } catch (error) {
      console.error("Error listing addresses by customer:", error);
      throw new Error("Failed to retrieve addresses");
    }
  }

  /**
   * Save new address
   * @param {CustomerAddress} address CustomerAddress entity to save
   * @returns {Promise<CustomerAddress>} Saved address with ID
   */
  async save(address: CustomerAddress): Promise<CustomerAddress> {
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

      const row = result.rows[0];
      const addressData: CustomerAddressData = {
        addressId: row.address_id,
        customerId: row.customer_id,
        addressType: row.address_type,
        address: row.address,
        postalCode: row.postal_code,
        city: row.city,
        countryId: row.country_id,
        isDefault: row.is_default,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      return new CustomerAddress(addressData);
    } catch (error) {
      console.error("Error saving address:", error);
      throw new Error("Failed to save address");
    }
  }

  /**
   * Update existing address
   * @param {CustomerAddress} address CustomerAddress entity to update
   * @returns {Promise<CustomerAddress>} Updated address
   */
  async update(address: CustomerAddress): Promise<CustomerAddress> {
    try {
      const validation = address.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `UPDATE customer_addresses 
         SET customer_id = $1, address_type = $2, address = $3, postal_code = $4, 
             city = $5, country_id = $6, is_default = $7
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

      const row = result.rows[0];
      const addressData: CustomerAddressData = {
        addressId: row.address_id,
        customerId: row.customer_id,
        addressType: row.address_type,
        address: row.address,
        postalCode: row.postal_code,
        city: row.city,
        countryId: row.country_id,
        isDefault: row.is_default,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      return new CustomerAddress(addressData);
    } catch (error) {
      console.error("Error updating address:", error);
      throw new Error("Failed to update address");
    }
  }

  /**
   * Delete address
   * @param {CustomerAddress} address CustomerAddress entity to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(address: CustomerAddress): Promise<boolean> {
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
   * Unset default for all addresses of a customer (optionally excluding one)
   * @param {number} customerId Customer ID
   * @param {number} [excludeAddressId] Address ID to exclude from update
   */
  async unsetDefaultForCustomer(
    customerId: number,
    excludeAddressId?: number
  ): Promise<void> {
    try {
      if (excludeAddressId) {
        await this.pool.query(
          `UPDATE customer_addresses
           SET is_default = false
           WHERE customer_id = $1 AND address_id <> $2 AND is_default = true`,
          [customerId, excludeAddressId]
        );
      } else {
        await this.pool.query(
          `UPDATE customer_addresses
           SET is_default = false
           WHERE customer_id = $1 AND is_default = true`,
          [customerId]
        );
      }
    } catch (error) {
      console.error("Error unsetting default addresses:", error);
      throw new Error("Failed to unset default addresses");
    }
  }
}

export default CustomerAddressRepository;
