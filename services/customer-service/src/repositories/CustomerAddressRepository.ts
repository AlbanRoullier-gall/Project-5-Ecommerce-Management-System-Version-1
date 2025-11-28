/**
 * Repository d'Adresses Clients
 * Gère les opérations de base de données pour les entités CustomerAddress
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
   * Vérifier si une adresse existe déjà pour un client avec les mêmes champs
   * Un doublon est défini par le même customer_id, address_type, address, postal_code, city, country_name
   * Permet d'avoir la même adresse en shipping et billing
   */
  async existsForCustomer(params: {
    customerId: number;
    addressType?: string;
    address: string;
    postalCode: string;
    city: string;
    countryName: string;
  }): Promise<boolean> {
    try {
      let query = `SELECT address_id FROM customer_addresses
         WHERE customer_id = $1
           AND address = $2
           AND postal_code = $3
           AND city = $4
           AND country_name = $5`;

      const values: any[] = [
        params.customerId,
        params.address,
        params.postalCode,
        params.city,
        params.countryName,
      ];

      // Si addressType est fourni, l'inclure dans la vérification
      if (params.addressType) {
        query += ` AND address_type = $6`;
        values.push(params.addressType);
      }

      query += ` LIMIT 1`;

      const result = await this.pool.query(query, values);
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking existing address:", error);
      throw new Error("Failed to check existing address");
    }
  }

  /**
   * Récupérer une adresse par ID
   * @param {number} id ID de l'adresse
   * @returns {Promise<CustomerAddress|null>} CustomerAddress ou null si non trouvée
   */
  async getById(id: number): Promise<CustomerAddress | null> {
    try {
      const result = await this.pool.query(
        `SELECT address_id, customer_id, address_type, address, postal_code, city, 
                country_name, is_default, created_at, updated_at
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
        countryName: row.country_name,
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
   * Lister les adresses par client
   * @param {number} customerId ID du client
   * @returns {Promise<CustomerAddress[]>} Tableau d'adresses
   */
  async listByCustomer(customerId: number): Promise<CustomerAddress[]> {
    try {
      const result = await this.pool.query(
        `SELECT address_id, customer_id, address_type, address, postal_code, city, 
                country_name, is_default, created_at, updated_at
         FROM customer_addresses 
         WHERE customer_id = $1
         ORDER BY is_default DESC, created_at DESC`,
        [customerId]
      );

      // Mapper explicitement les colonnes snake_case de la DB vers les champs camelCase du modèle
      return result.rows.map(
        (row) =>
          new CustomerAddress({
            addressId: row.address_id,
            customerId: row.customer_id,
            addressType: row.address_type,
            address: row.address,
            postalCode: row.postal_code,
            city: row.city,
            countryName: row.country_name,
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
   * Sauvegarder une nouvelle adresse
   * @param {CustomerAddress} address Entité CustomerAddress à sauvegarder
   * @returns {Promise<CustomerAddress>} Adresse sauvegardée avec ID
   */
  async save(address: CustomerAddress): Promise<CustomerAddress> {
    try {
      const validation = address.validate();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const result = await this.pool.query(
        `INSERT INTO customer_addresses (customer_id, address_type, address, postal_code, 
                                       city, country_name, is_default, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING address_id, customer_id, address_type, address, postal_code, city, 
                   country_name, is_default, created_at, updated_at`,
        [
          address.customerId,
          address.addressType,
          address.address,
          address.postalCode,
          address.city,
          address.countryName,
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
        countryName: row.country_name,
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
   * Mettre à jour une adresse existante
   * @param {CustomerAddress} address Entité CustomerAddress à mettre à jour
   * @returns {Promise<CustomerAddress>} Adresse mise à jour
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
             city = $5, country_name = $6, is_default = $7
         WHERE address_id = $8
         RETURNING address_id, customer_id, address_type, address, postal_code, city, 
                   country_name, is_default, created_at, updated_at`,
        [
          address.customerId,
          address.addressType,
          address.address,
          address.postalCode,
          address.city,
          address.countryName,
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
        countryName: row.country_name,
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
   * Supprimer une adresse
   * @param {CustomerAddress} address Entité CustomerAddress à supprimer
   * @returns {Promise<boolean>} True si supprimée avec succès
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
   * Désactiver l'adresse par défaut pour toutes les adresses d'un client (en excluant optionnellement une)
   * @param {number} customerId ID du client
   * @param {number} [excludeAddressId] ID de l'adresse à exclure de la mise à jour
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
