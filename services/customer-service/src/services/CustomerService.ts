/**
 * CustomerService
 * Business logic layer for customer management
 *
 * Architecture : Service pattern
 * - Business logic orchestration
 * - Data validation and transformation
 * - Repository coordination
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
      // Check if email already exists
      if (!data.email) {
        throw new Error("L'email est obligatoire");
      }
      const emailExists = await this.customerRepository.emailExists(data.email);
      if (emailExists) {
        throw new Error("Un client avec cet email existe déjà");
      }

      // Validate required fields
      if (!data.civilityId || !data.firstName || !data.lastName || !data.email || !data.socioProfessionalCategoryId) {
        throw new Error("Tous les champs obligatoires doivent être fournis");
      }

      // Create customer entity with temporary data for insertion
      const customerData: CustomerData = {
        customerId: 0, // Will be replaced by DB
        civilityId: data.civilityId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        socioProfessionalCategoryId: data.socioProfessionalCategoryId,
        phoneNumber: data.phoneNumber || null,
        birthday: data.birthday || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const customer = new Customer(customerData);

      // Save customer
      const savedCustomer = await this.customerRepository.save(customer);

      // Return customer without password hash
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

      // Check if email is being updated and if it conflicts
      if (data.email && data.email !== customer.email) {
        const emailExists = await this.customerRepository.emailExists(
          data.email,
          id
        );
        if (emailExists) {
          throw new Error("Email already exists");
        }
      }

      // Create updated customer with merge (like auth-service)
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

  // Note: authenticateCustomer method removed - authentication handled elsewhere

  // Note: changePassword method removed - authentication handled elsewhere

  // Address management methods

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
      // Verify customer exists
      const customer = await this.customerRepository.getById(customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }

      // If this is set as default, unset other default addresses of the same type
      if (addressData.isDefault) {
        const existingAddresses = await this.addressRepository.listByCustomer(
          customerId
        );
        for (const address of existingAddresses) {
          if (
            address.addressType === addressData.addressType &&
            address.isDefault
          ) {
            address.isDefault = false;
            await this.addressRepository.update(address);
          }
        }
      }

      // Create address entity
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

      // If this is set as default, unset other default addresses of the same type
      if (addressData.isDefault && !address.isDefault) {
        const existingAddresses = await this.addressRepository.listByCustomer(
          address.customerId!
        );
        for (const existingAddress of existingAddresses) {
          if (
            existingAddress.addressType === address.addressType &&
            existingAddress.addressId !== addressId &&
            existingAddress.isDefault
          ) {
            existingAddress.isDefault = false;
            await this.addressRepository.update(existingAddress);
          }
        }
      }

      // Update address entity
      Object.assign(address, addressData);
      address.addressId = addressId; // Ensure ID is preserved

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

  // Company management methods

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
      // Verify customer exists
      const customer = await this.customerRepository.getById(customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }

      // Check if SIRET already exists
      if (companyData.siretNumber) {
        const siretExists = await this.companyRepository.siretExists(
          companyData.siretNumber
        );
        if (siretExists) {
          throw new Error("SIRET number already exists");
        }
      }

      // Check if VAT number already exists
      if (companyData.vatNumber) {
        const vatExists = await this.companyRepository.vatExists(
          companyData.vatNumber
        );
        if (vatExists) {
          throw new Error("VAT number already exists");
        }
      }

      // Create company entity
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

      // Check if SIRET is being updated and if it conflicts
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

      // Check if VAT number is being updated and if it conflicts
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

      // Update company entity
      Object.assign(company, companyData);
      company.companyId = companyId; // Ensure ID is preserved

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
}

export default CustomerService;
