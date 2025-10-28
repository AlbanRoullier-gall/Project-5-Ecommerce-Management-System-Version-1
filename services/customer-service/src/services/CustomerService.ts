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

  /**
   * Méthode utilitaire pour récupérer une entité par ID
   * @param {Function} repositoryMethod Méthode du repository à appeler
   * @param {number} id ID de l'entité
   * @param {string} entityName Nom de l'entité pour les logs
   * @returns {Promise<T|null>} Entité ou null si non trouvée
   */
  private async getEntityById<T>(
    repositoryMethod: (id: number) => Promise<T | null>,
    id: number,
    entityName: string
  ): Promise<T | null> {
    try {
      return await repositoryMethod(id);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de ${entityName} par ID:`,
        error
      );
      throw error;
    }
  }

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
        customerId: 0, // Sera remplacé par la base de données
        civilityId: civilityIdToUse!,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        socioProfessionalCategoryId: categoryIdToUse!,
        phoneNumber: data.phoneNumber || null,
        birthday: data.birthday || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const customer = new Customer(customerData);

      // Sauvegarder le client
      const savedCustomer = await this.customerRepository.save(customer);

      // Retourner le client
      return savedCustomer;
    } catch (error) {
      console.error("Erreur lors de la création du client:", error);
      throw error;
    }
  }

  /**
   * Récupérer un client par ID
   * @param {number} id ID du client
   * @returns {Promise<Customer|null>} Client ou null si non trouvé
   */
  async getCustomerById(id: number): Promise<Customer | null> {
    return this.getEntityById(
      this.customerRepository.getById.bind(this.customerRepository),
      id,
      "customer"
    );
  }

  /**
   * Récupérer un client par email
   * @param {string} email Email du client
   * @returns {Promise<Customer|null>} Client ou null si non trouvé
   */
  async getCustomerByEmail(email: string): Promise<Customer | null> {
    try {
      return await this.customerRepository.getByEmail(email);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du client par email:",
        error
      );
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
        throw new Error("Client non trouvé");
      }

      // Vérifier si l'email est mis à jour et s'il y a conflit
      if (data.email && data.email !== customer.email) {
        const emailExists = await this.customerRepository.emailExists(
          data.email,
          id
        );
        if (emailExists) {
          throw new Error("Email déjà existant");
        }
      }

      // Créer un client mis à jour avec fusion (comme auth-service)
      const updatedCustomer = this.customerRepository.createCustomerWithMerge(
        customer,
        data
      );
      return await this.customerRepository.update(updatedCustomer);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du client:", error);
      throw error;
    }
  }

  /**
   * Supprimer un client
   * @param {number} id ID du client
   * @returns {Promise<boolean>} True si supprimé avec succès
   */
  async deleteCustomer(id: number): Promise<boolean> {
    try {
      const customer = await this.customerRepository.getById(id);
      if (!customer) {
        throw new Error("Client non trouvé");
      }

      return await this.customerRepository.delete(customer);
    } catch (error) {
      console.error("Erreur lors de la suppression du client:", error);
      throw error;
    }
  }

  // ===== GESTION DES ADRESSES =====

  // ===== GESTION DES ENTREPRISES =====

  // ===== LISTES ET RECHERCHES =====

  /**
   * Lister les clients avec pagination et recherche
   * @param {Object} options Options de pagination et recherche
   * @returns {Promise<Object>} Clients et informations de pagination
   */
  async listCustomers(
    options: {
      page?: number;
      limit?: number;
      search?: string;
    } = {
      page: 1,
      limit: 10,
      search: "",
    }
  ): Promise<any> {
    try {
      return await this.customerRepository.listAll(options);
    } catch (error) {
      console.error("Erreur lors de la liste des clients:", error);
      throw error;
    }
  }

  /**
   * Ajouter une adresse à un client
   * @param {number} customerId ID du client
   * @param {Object} addressData Données de l'adresse
   * @returns {Promise<CustomerAddress>} Adresse créée
   */
  async addAddress(
    customerId: number,
    addressData: any
  ): Promise<CustomerAddress> {
    try {
      // Vérifier que le client existe
      const customer = await this.customerRepository.getById(customerId);
      if (!customer) {
        throw new Error("Client non trouvé");
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
        throw new Error("Adresse déjà existante");
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
      console.error("Erreur lors de l'ajout de l'adresse:", error);
      throw error;
    }
  }

  /**
   * Mettre à jour une adresse
   * @param {number} addressId ID de l'adresse
   * @param {Object} addressData Données de l'adresse
   * @returns {Promise<CustomerAddress>} Adresse mise à jour
   */
  async updateAddress(
    addressId: number,
    addressData: any
  ): Promise<CustomerAddress> {
    try {
      const address = await this.addressRepository.getById(addressId);
      if (!address) {
        throw new Error("Adresse non trouvée");
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
      console.error("Erreur lors de la mise à jour de l'adresse:", error);
      throw error;
    }
  }

  /**
   * Supprimer une adresse
   * @param {number} addressId ID de l'adresse
   * @returns {Promise<boolean>} True si supprimée avec succès
   */
  async deleteAddress(addressId: number): Promise<boolean> {
    try {
      const address = await this.addressRepository.getById(addressId);
      if (!address) {
        throw new Error("Adresse non trouvée");
      }

      return await this.addressRepository.delete(address);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'adresse:", error);
      throw error;
    }
  }

  /**
   * Lister les adresses d'un client
   * @param {number} customerId ID du client
   * @returns {Promise<CustomerAddress[]>} Tableau d'adresses
   */
  async listCustomerAddresses(customerId: number): Promise<CustomerAddress[]> {
    try {
      return await this.addressRepository.listByCustomer(customerId);
    } catch (error) {
      console.error("Erreur lors de la liste des adresses du client:", error);
      throw error;
    }
  }

  /**
   * Récupérer une adresse par ID
   * @param {number} addressId ID de l'adresse
   * @returns {Promise<CustomerAddress|null>} Adresse ou null si non trouvée
   */
  async getAddressById(addressId: number): Promise<CustomerAddress | null> {
    return this.getEntityById(
      this.addressRepository.getById.bind(this.addressRepository),
      addressId,
      "address"
    );
  }

  // ===== GESTION DES ENTREPRISES =====

  /**
   * Ajouter une entreprise à un client
   * @param {number} customerId ID du client
   * @param {Object} companyData Données de l'entreprise
   * @returns {Promise<CustomerCompany>} Entreprise créée
   */
  async addCompany(
    customerId: number,
    companyData: any
  ): Promise<CustomerCompany> {
    try {
      // Vérifier que le client existe
      const customer = await this.customerRepository.getById(customerId);
      if (!customer) {
        throw new Error("Client non trouvé");
      }

      // Vérifier si le SIRET existe déjà
      if (companyData.siretNumber) {
        const siretExists = await this.companyRepository.siretExists(
          companyData.siretNumber
        );
        if (siretExists) {
          throw new Error("Numéro SIRET déjà existant");
        }
      }

      // Vérifier si le numéro de TVA existe déjà
      if (companyData.vatNumber) {
        const vatExists = await this.companyRepository.vatExists(
          companyData.vatNumber
        );
        if (vatExists) {
          throw new Error("Numéro de TVA déjà existant");
        }
      }

      // Créer l'entité entreprise
      const company = new CustomerCompany({
        ...companyData,
        customerId,
      });

      return await this.companyRepository.save(company);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'entreprise:", error);
      throw error;
    }
  }

  /**
   * Mettre à jour une entreprise
   * @param {number} companyId ID de l'entreprise
   * @param {Object} companyData Données de l'entreprise
   * @returns {Promise<CustomerCompany>} Entreprise mise à jour
   */
  async updateCompany(
    companyId: number,
    companyData: any
  ): Promise<CustomerCompany> {
    try {
      const company = await this.companyRepository.getById(companyId);
      if (!company) {
        throw new Error("Entreprise non trouvée");
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
          throw new Error("Numéro SIRET déjà existant");
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
          throw new Error("Numéro de TVA déjà existant");
        }
      }

      // Mettre à jour l'entité entreprise
      Object.assign(company, companyData);
      company.companyId = companyId; // S'assurer que l'ID est préservé

      return await this.companyRepository.update(company);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'entreprise:", error);
      throw error;
    }
  }

  /**
   * Supprimer une entreprise
   * @param {number} companyId ID de l'entreprise
   * @returns {Promise<boolean>} True si supprimée avec succès
   */
  async deleteCompany(companyId: number): Promise<boolean> {
    try {
      const company = await this.companyRepository.getById(companyId);
      if (!company) {
        throw new Error("Entreprise non trouvée");
      }

      return await this.companyRepository.delete(company);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'entreprise:", error);
      throw error;
    }
  }

  /**
   * Lister les entreprises d'un client
   * @param {number} customerId ID du client
   * @returns {Promise<CustomerCompany[]>} Tableau d'entreprises
   */
  async listCustomerCompanies(customerId: number): Promise<CustomerCompany[]> {
    try {
      return await this.companyRepository.listByCustomer(customerId);
    } catch (error) {
      console.error(
        "Erreur lors de la liste des entreprises du client:",
        error
      );
      throw error;
    }
  }

  /**
   * Récupérer une entreprise par ID
   * @param {number} companyId ID de l'entreprise
   * @returns {Promise<CustomerCompany|null>} Entreprise ou null si non trouvée
   */
  async getCompanyById(companyId: number): Promise<CustomerCompany | null> {
    return this.getEntityById(
      this.companyRepository.getById.bind(this.companyRepository),
      companyId,
      "company"
    );
  }

  // ===== DONNÉES DE RÉFÉRENCE =====

  /**
   * Récupérer toutes les civilités
   * @returns {Promise<any[]>} Liste des civilités
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
      console.error("Erreur lors de la récupération des civilités:", error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les catégories socio-professionnelles
   * @returns {Promise<any[]>} Liste des catégories
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
      console.error("Erreur lors de la récupération des catégories:", error);
      throw error;
    }
  }

  /**
   * Récupérer tous les pays
   * @returns {Promise<any[]>} Liste des pays
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
      console.error("Erreur lors de la récupération des pays:", error);
      throw error;
    }
  }
}

export default CustomerService;
