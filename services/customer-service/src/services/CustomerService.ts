/**
 * Service Client
 * Couche de logique métier pour la gestion des clients
 *
 * Architecture : Pattern Service
 * - Orchestration de la logique métier
 * - Validation et transformation des données
 * - Coordination des repositories
 */
import { Pool } from "pg";
import Customer, { CustomerData } from "../models/Customer";
import CustomerAddress from "../models/CustomerAddress";
import CustomerCompany from "../models/CustomerCompany";
import CustomerRepository from "../repositories/CustomerRepository";
import CustomerAddressRepository from "../repositories/CustomerAddressRepository";
import CustomerCompanyRepository from "../repositories/CustomerCompanyRepository";

class CustomerService {
  private customerRepository: CustomerRepository;
  private addressRepository: CustomerAddressRepository;
  private companyRepository: CustomerCompanyRepository;

  constructor(pool: Pool) {
    this.customerRepository = new CustomerRepository(pool);
    this.addressRepository = new CustomerAddressRepository(pool);
    this.companyRepository = new CustomerCompanyRepository(pool);
  }

  // ===== MÉTHODES UTILITAIRES =====

  // ===== CRÉATION DE CLIENTS =====

  /**
   * Créer un nouveau client
   */
  async createCustomer(data: Partial<CustomerData>): Promise<Customer> {
    try {
      // Vérifier si l'email existe déjà
      if (!data.email) {
        throw new Error("L'email est obligatoire");
      }
      const emailExists = await this.customerRepository.emailExists(data.email);
      if (emailExists) {
        throw new Error("Un client avec cet email existe déjà");
      }

      // Valider les champs obligatoires (civilité et catégorie optionnels)
      if (!data.firstName || !data.lastName || !data.email) {
        throw new Error("Tous les champs obligatoires doivent être fournis");
      }

      // Déterminer la civilité (optionnel → par défaut la première civilité si non fournie)
      let civilityIdToUse = data.civilityId || null;
      if (!civilityIdToUse) {
        const civilityRes = await this.customerRepository.pool.query(
          "SELECT civility_id FROM civilities ORDER BY civility_id LIMIT 1"
        );
        civilityIdToUse = civilityRes.rows[0]?.civility_id || null;
      }

      // Déterminer la catégorie socio-professionnelle (optionnel → par défaut 'Autre' si présent, sinon la première)
      let categoryIdToUse = data.socioProfessionalCategoryId || null;
      if (!categoryIdToUse) {
        const categoryRes = await this.customerRepository.pool.query(
          "SELECT category_id FROM socio_professional_categories ORDER BY category_name = 'Other' DESC, category_id LIMIT 1"
        );
        categoryIdToUse = categoryRes.rows[0]?.category_id || null;
      }

      // Créer l'entité client avec des données temporaires pour l'insertion
      const customerData: CustomerData = {
        customerId: 0, // Sera remplacé par la DB
        civilityId: civilityIdToUse!,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        socioProfessionalCategoryId: categoryIdToUse!,
        phoneNumber: data.phoneNumber || null,
        birthday: data.birthday || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const customer = new Customer(customerData);

      // Sauvegarder le client
      const savedCustomer = await this.customerRepository.save(customer);

      // Retourner le client
      return savedCustomer;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  }

  /**
   * Get customer by ID
   * @param {number} id Customer ID
   * @returns {Promise<Customer|null>} Customer or null if not found
   */
  async getCustomerById(id: number): Promise<Customer | null> {
    try {
      return await this.customerRepository.getByIdWithJoins(id);
    } catch (error) {
      console.error("Error getting customer by ID:", error);
      throw error;
    }
  }

  /**
   * Get customer by email
   * @param {string} email Customer email
   * @returns {Promise<Customer|null>} Customer or null if not found
   */
  async getCustomerByEmail(email: string): Promise<Customer | null> {
    try {
      return await this.customerRepository.getByEmail(email);
    } catch (error) {
      console.error("Error getting customer by email:", error);
      throw error;
    }
  }

  // ===== MISE À JOUR DE CLIENTS =====

  /**
   * Mettre à jour un client
   */
  async updateCustomer(
    id: number,
    data: Partial<CustomerData>
  ): Promise<Customer> {
    try {
      const customer = await this.customerRepository.getById(id);
      if (!customer) {
        throw new Error("Customer not found");
      }

      // Vérifier si l'email est mis à jour et s'il y a conflit
      if (data.email && data.email !== customer.email) {
        const emailExists = await this.customerRepository.emailExists(
          data.email,
          id
        );
        if (emailExists) {
          throw new Error("Email already exists");
        }
      }

      // Créer un client mis à jour avec fusion (comme auth-service)
      const updatedCustomer = this.customerRepository.createCustomerWithMerge(
        customer,
        data
      );
      return await this.customerRepository.update(updatedCustomer);
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  }

  /**
   * Delete customer
   * @param {number} id Customer ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteCustomer(id: number): Promise<boolean> {
    try {
      const customer = await this.customerRepository.getById(id);
      if (!customer) {
        throw new Error("Customer not found");
      }

      return await this.customerRepository.delete(customer);
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  }

  // ===== GESTION DES ADRESSES =====

  /**
   * Créer une nouvelle adresse
   */
  async createCustomerAddress(
    customerId: number,
    addressData: any
  ): Promise<CustomerAddress> {
    try {
      // Vérifier que le client existe
      const customer = await this.customerRepository.getById(customerId);
      if (!customer) {
        throw new Error("Client non trouvé");
      }

      // Vérifier les adresses en double avant la création
      const duplicateExists = await this.addressRepository.existsForCustomer({
        customerId,
        addressType: addressData.addressType,
        address: addressData.address,
        postalCode: addressData.postalCode,
        city: addressData.city,
        countryId: addressData.countryId,
      });
      if (duplicateExists) {
        throw new Error("Address already exists");
      }

      // Créer l'adresse
      const address = new CustomerAddress(addressData);
      address.customerId = customerId;

      return await this.addressRepository.save(address);
    } catch (error) {
      console.error("Error creating customer address:", error);
      throw error;
    }
  }

  // ===== GESTION DES ENTREPRISES =====

  /**
   * Créer une nouvelle entreprise
   */
  async createCustomerCompany(
    customerId: number,
    companyData: any
  ): Promise<CustomerCompany> {
    try {
      // Vérifier que le client existe
      const customer = await this.customerRepository.getById(customerId);
      if (!customer) {
        throw new Error("Client non trouvé");
      }

      // Créer l'entreprise
      const company = new CustomerCompany(companyData);
      company.customerId = customerId;

      return await this.companyRepository.save(company);
    } catch (error) {
      console.error("Error creating customer company:", error);
      throw error;
    }
  }

  // ===== LISTES ET RECHERCHES =====

  /**
   * Lister les clients actifs
   */
  async listActiveCustomers(): Promise<Customer[]> {
    try {
      return await this.customerRepository.listAllActive();
    } catch (error) {
      console.error("Error listing active customers:", error);
      throw error;
    }
  }

  /**
   * List customers with pagination and search
   * @param {Object} options Pagination and search options
   * @returns {Promise<Object>} Customers and pagination info
   */
  async listCustomers(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      activeOnly?: boolean;
    } = {
      page: 1,
      limit: 10,
      search: "",
      activeOnly: false,
    }
  ): Promise<any> {
    try {
      return await this.customerRepository.listAll(options);
    } catch (error) {
      console.error("Error listing customers:", error);
      throw error;
    }
  }

  /**
   * Add address to customer
   * @param {number} customerId Customer ID
   * @param {Object} addressData Address data
   * @returns {Promise<CustomerAddress>} Created address
   */
  async addAddress(
    customerId: number,
    addressData: any
  ): Promise<CustomerAddress> {
    try {
      // Vérifier que le client existe
      const customer = await this.customerRepository.getById(customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }

      // Vérifier les adresses en double avant de modifier les valeurs par défaut
      const duplicateExists = await this.addressRepository.existsForCustomer({
        customerId,
        address: addressData.address,
        postalCode: addressData.postalCode,
        city: addressData.city,
        countryId: addressData.countryId,
      });
      if (duplicateExists) {
        throw new Error("Address already exists");
      }

      // Si ceci est défini comme par défaut, désactiver les autres adresses par défaut pour le client
      if (addressData.isDefault) {
        await this.addressRepository.unsetDefaultForCustomer(customerId);
      }

      // Créer l'entité adresse
      const address = new CustomerAddress({
        ...addressData,
        customerId,
      });

      return await this.addressRepository.save(address);
    } catch (error) {
      console.error("Error adding address:", error);
      throw error;
    }
  }

  /**
   * Update address
   * @param {number} addressId Address ID
   * @param {Object} addressData Address data
   * @returns {Promise<CustomerAddress>} Updated address
   */
  async updateAddress(
    addressId: number,
    addressData: any
  ): Promise<CustomerAddress> {
    try {
      const address = await this.addressRepository.getById(addressId);
      if (!address) {
        throw new Error("Address not found");
      }

      // Si ceci est défini comme par défaut, désactiver les autres adresses par défaut pour le client
      if (addressData.isDefault && !address.isDefault) {
        await this.addressRepository.unsetDefaultForCustomer(
          address.customerId!,
          addressId
        );
      }

      // Mettre à jour l'entité adresse
      Object.assign(address, addressData);
      address.addressId = addressId; // S'assurer que l'ID est préservé

      return await this.addressRepository.update(address);
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  }

  /**
   * Delete address
   * @param {number} addressId Address ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteAddress(addressId: number): Promise<boolean> {
    try {
      const address = await this.addressRepository.getById(addressId);
      if (!address) {
        throw new Error("Address not found");
      }

      return await this.addressRepository.delete(address);
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  }

  /**
   * List customer addresses
   * @param {number} customerId Customer ID
   * @returns {Promise<CustomerAddress[]>} Array of addresses
   */
  async listCustomerAddresses(customerId: number): Promise<CustomerAddress[]> {
    try {
      return await this.addressRepository.listByCustomer(customerId);
    } catch (error) {
      console.error("Error listing customer addresses:", error);
      throw error;
    }
  }

  /**
   * Get address by ID
   * @param {number} addressId Address ID
   * @returns {Promise<CustomerAddress|null>} Address or null if not found
   */
  async getAddressById(addressId: number): Promise<CustomerAddress | null> {
    try {
      return await this.addressRepository.getById(addressId);
    } catch (error) {
      console.error("Error getting address by ID:", error);
      throw error;
    }
  }

  // Méthodes de gestion des entreprises

  /**
   * Add company to customer
   * @param {number} customerId Customer ID
   * @param {Object} companyData Company data
   * @returns {Promise<CustomerCompany>} Created company
   */
  async addCompany(
    customerId: number,
    companyData: any
  ): Promise<CustomerCompany> {
    try {
      // Vérifier que le client existe
      const customer = await this.customerRepository.getById(customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }

      // Vérifier si le SIRET existe déjà
      if (companyData.siretNumber) {
        const siretExists = await this.companyRepository.siretExists(
          companyData.siretNumber
        );
        if (siretExists) {
          throw new Error("SIRET number already exists");
        }
      }

      // Vérifier si le numéro de TVA existe déjà
      if (companyData.vatNumber) {
        const vatExists = await this.companyRepository.vatExists(
          companyData.vatNumber
        );
        if (vatExists) {
          throw new Error("VAT number already exists");
        }
      }

      // Créer l'entité entreprise
      const company = new CustomerCompany({
        ...companyData,
        customerId,
      });

      return await this.companyRepository.save(company);
    } catch (error) {
      console.error("Error adding company:", error);
      throw error;
    }
  }

  /**
   * Update company
   * @param {number} companyId Company ID
   * @param {Object} companyData Company data
   * @returns {Promise<CustomerCompany>} Updated company
   */
  async updateCompany(
    companyId: number,
    companyData: any
  ): Promise<CustomerCompany> {
    try {
      const company = await this.companyRepository.getById(companyId);
      if (!company) {
        throw new Error("Company not found");
      }

      // Vérifier si le SIRET est mis à jour et s'il y a conflit
      if (
        companyData.siretNumber &&
        companyData.siretNumber !== company.siretNumber
      ) {
        const siretExists = await this.companyRepository.siretExists(
          companyData.siretNumber,
          companyId
        );
        if (siretExists) {
          throw new Error("SIRET number already exists");
        }
      }

      // Vérifier si le numéro de TVA est mis à jour et s'il y a conflit
      if (
        companyData.vatNumber &&
        companyData.vatNumber !== company.vatNumber
      ) {
        const vatExists = await this.companyRepository.vatExists(
          companyData.vatNumber,
          companyId
        );
        if (vatExists) {
          throw new Error("VAT number already exists");
        }
      }

      // Mettre à jour l'entité entreprise
      Object.assign(company, companyData);
      company.companyId = companyId; // S'assurer que l'ID est préservé

      return await this.companyRepository.update(company);
    } catch (error) {
      console.error("Error updating company:", error);
      throw error;
    }
  }

  /**
   * Delete company
   * @param {number} companyId Company ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteCompany(companyId: number): Promise<boolean> {
    try {
      const company = await this.companyRepository.getById(companyId);
      if (!company) {
        throw new Error("Company not found");
      }

      return await this.companyRepository.delete(company);
    } catch (error) {
      console.error("Error deleting company:", error);
      throw error;
    }
  }

  /**
   * List customer companies
   * @param {number} customerId Customer ID
   * @returns {Promise<CustomerCompany[]>} Array of companies
   */
  async listCustomerCompanies(customerId: number): Promise<CustomerCompany[]> {
    try {
      return await this.companyRepository.listByCustomer(customerId);
    } catch (error) {
      console.error("Error listing customer companies:", error);
      throw error;
    }
  }

  /**
   * Get company by ID
   * @param {number} companyId Company ID
   * @returns {Promise<CustomerCompany|null>} Company or null if not found
   */
  async getCompanyById(companyId: number): Promise<CustomerCompany | null> {
    try {
      return await this.companyRepository.getById(companyId);
    } catch (error) {
      console.error("Error getting company by ID:", error);
      throw error;
    }
  }

  // ===== ACTIVATION/DÉSACTIVATION =====

  /**
   * Activer un client
   * @param {number} id Customer ID
   * @returns {Promise<Customer>} Activated customer
   */
  async activateCustomer(id: number): Promise<Customer> {
    try {
      const customer = await this.customerRepository.getById(id);
      if (!customer) {
        throw new Error("Customer not found");
      }

      customer.activate();
      return await this.customerRepository.update(customer);
    } catch (error) {
      console.error("Error activating customer:", error);
      throw error;
    }
  }

  /**
   * Désactiver un client
   * @param {number} id Customer ID
   * @returns {Promise<Customer>} Deactivated customer
   */
  async deactivateCustomer(id: number): Promise<Customer> {
    try {
      const customer = await this.customerRepository.getById(id);
      if (!customer) {
        throw new Error("Customer not found");
      }

      customer.deactivate();
      return await this.customerRepository.update(customer);
    } catch (error) {
      console.error("Error deactivating customer:", error);
      throw error;
    }
  }

  // ===== DONNÉES DE RÉFÉRENCE =====

  /**
   * Récupérer toutes les civilités
   * @returns {Promise<any[]>} List of civilities
   */
  async getCivilities(): Promise<any[]> {
    try {
      const result = await this.customerRepository.pool.query(
        "SELECT civility_id, abbreviation FROM civilities ORDER BY civility_id"
      );
      return result.rows.map((row) => ({
        civilityId: row.civility_id,
        abbreviation: row.abbreviation,
      }));
    } catch (error) {
      console.error("Error getting civilities:", error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les catégories socio-professionnelles
   * @returns {Promise<any[]>} List of categories
   */
  async getCategories(): Promise<any[]> {
    try {
      const result = await this.customerRepository.pool.query(
        "SELECT category_id, category_name FROM socio_professional_categories ORDER BY category_id"
      );
      return result.rows.map((row) => ({
        categoryId: row.category_id,
        categoryName: row.category_name,
      }));
    } catch (error) {
      console.error("Error getting categories:", error);
      throw error;
    }
  }

  /**
   * Récupérer tous les pays
   * @returns {Promise<any[]>} List of countries
   */
  async getCountries(): Promise<any[]> {
    try {
      const result = await this.customerRepository.pool.query(
        "SELECT country_id, country_name FROM countries ORDER BY country_name"
      );
      return result.rows.map((row) => ({
        countryId: row.country_id,
        countryName: row.country_name,
      }));
    } catch (error) {
      console.error("Error getting countries:", error);
      throw error;
    }
  }
}

export default CustomerService;
