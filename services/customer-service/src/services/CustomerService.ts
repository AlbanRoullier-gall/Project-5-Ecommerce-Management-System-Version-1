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
import CustomerRepository from "../repositories/CustomerRepository";
import CustomerAddressRepository from "../repositories/CustomerAddressRepository";
import { BELGIUM_COUNTRY_NAME } from "../constants/CountryConstants";

class CustomerService {
  private customerRepository: CustomerRepository;
  private addressRepository: CustomerAddressRepository;

  constructor(pool: Pool) {
    this.customerRepository = new CustomerRepository(pool);
    this.addressRepository = new CustomerAddressRepository(pool);
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

      // Valider les champs obligatoires
      if (!data.firstName || !data.lastName || !data.email) {
        throw new Error("Tous les champs obligatoires doivent être fournis");
      }

      // Créer l'entité client avec des données temporaires pour l'insertion
      const customerData: CustomerData = {
        customerId: 0, // Sera remplacé par la base de données
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || null,
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

  /**
   * Résoudre ou créer un client
   * Cherche le client par email, le crée s'il n'existe pas
   * @param {Partial<CustomerData>} data Données du client
   * @returns {Promise<number>} ID du client (existant ou créé)
   */
  async resolveOrCreateCustomer(data: Partial<CustomerData>): Promise<number> {
    try {
      if (!data.email) {
        throw new Error("L'email est obligatoire");
      }

      // Chercher le client existant par email
      const existingCustomer = await this.customerRepository.getByEmail(
        data.email
      );

      if (existingCustomer) {
        return existingCustomer.customerId;
      }

      // Le client n'existe pas, le créer
      // Valider les champs obligatoires pour la création
      if (!data.firstName || !data.lastName) {
        throw new Error(
          "Les champs firstName et lastName sont obligatoires pour créer un nouveau client"
        );
      }

      const customerData: CustomerData = {
        customerId: 0, // Sera remplacé par la base de données
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const customer = new Customer(customerData);
      const savedCustomer = await this.customerRepository.save(customer);

      return savedCustomer.customerId;
    } catch (error) {
      console.error("Erreur lors de la résolution/création du client:", error);
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
   * Obtenir les statistiques formatées pour le dashboard
   * @returns {Promise<{customersCount: number}>} Statistiques formatées
   */
  async getDashboardStatistics(): Promise<{
    customersCount: number;
  }> {
    try {
      // Récupérer le nombre de clients
      const customersList = await this.customerRepository.listAll({
        page: 1,
        limit: 1, // On n'a besoin que de la pagination
      });
      const customersCount = customersList.pagination?.total || 0;

      return {
        customersCount,
      };
    } catch (error: any) {
      console.error("Error getting dashboard statistics:", error);
      throw new Error(
        `Failed to retrieve dashboard statistics: ${error.message}`
      );
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

      // Forcer le country_name à être toujours la Belgique
      const addressWithBelgium = {
        ...addressData,
        countryName: BELGIUM_COUNTRY_NAME,
      };

      // Vérifier les adresses en double avant de modifier les valeurs par défaut
      // Prendre en compte le type d'adresse pour permettre shipping et billing avec les mêmes coordonnées
      const duplicateExists = await this.addressRepository.existsForCustomer({
        customerId,
        addressType: addressWithBelgium.addressType,
        address: addressWithBelgium.address,
        postalCode: addressWithBelgium.postalCode,
        city: addressWithBelgium.city,
        countryName: addressWithBelgium.countryName,
      });

      if (duplicateExists) {
        throw new Error("Adresse déjà existante");
      }

      // Si ceci est défini comme par défaut, désactiver les autres adresses par défaut pour le client
      if (addressWithBelgium.isDefault) {
        await this.addressRepository.unsetDefaultForCustomer(customerId);
      }

      // Créer l'entité adresse (country_name toujours Belgique)
      const address = new CustomerAddress({
        ...addressWithBelgium,
        customerId,
      });

      return await this.addressRepository.save(address);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'adresse:", error);
      throw error;
    }
  }

  /**
   * Ajouter plusieurs adresses pour un client (shipping + billing)
   * @param {number} customerId ID du client
   * @param {Object} addressData Données contenant shipping et billing
   * @returns {Promise<{shipping?: CustomerAddress, billing?: CustomerAddress}>} Adresses créées
   */
  async addAddresses(
    customerId: number,
    addressData: {
      shipping?: {
        address: string;
        postalCode: string;
        city: string;
        countryName?: string;
      };
      billing?: {
        address: string;
        postalCode: string;
        city: string;
        countryName?: string;
      };
      useSameBillingAddress?: boolean;
    }
  ): Promise<{
    shipping?: CustomerAddress;
    billing?: CustomerAddress;
  }> {
    try {
      // Vérifier que le client existe
      const customer = await this.customerRepository.getById(customerId);
      if (!customer) {
        throw new Error("Client non trouvé");
      }

      const result: {
        shipping?: CustomerAddress;
        billing?: CustomerAddress;
      } = {};

      // Ajouter l'adresse de livraison si fournie
      if (addressData.shipping?.address) {
        const shippingAddressData = {
          addressType: "shipping" as const,
          address: addressData.shipping.address,
          postalCode: addressData.shipping.postalCode || "",
          city: addressData.shipping.city || "",
          countryName: addressData.shipping.countryName,
          isDefault: true, // L'adresse de livraison est par défaut
        };

        try {
          result.shipping = await this.addAddress(
            customerId,
            shippingAddressData
          );
        } catch (error: any) {
          // Ignorer les erreurs de doublon pour l'adresse de livraison
          if (!error.message.includes("déjà existante")) {
            throw error;
          }
        }
      }

      // Ajouter l'adresse de facturation si fournie et différente de l'adresse de livraison
      // Si useSameBillingAddress est true, on n'ajoute pas d'adresse de facturation séparée
      if (!addressData.useSameBillingAddress && addressData.billing?.address) {
        const billingData = {
          addressType: "billing" as const,
          address: addressData.billing.address,
          postalCode: addressData.billing.postalCode || "",
          city: addressData.billing.city || "",
          countryName: addressData.billing.countryName,
          isDefault: false, // L'adresse de facturation n'est pas par défaut
        };

        try {
          result.billing = await this.addAddress(customerId, billingData);
        } catch (error: any) {
          // Ignorer les erreurs de doublon pour l'adresse de facturation
          if (!error.message.includes("déjà existante")) {
            throw error;
          }
        }
      }

      return result;
    } catch (error) {
      console.error("Erreur lors de l'ajout des adresses:", error);
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

      // Forcer le country_name à être toujours la Belgique
      const addressDataWithBelgium = {
        ...addressData,
        countryName: BELGIUM_COUNTRY_NAME,
      };

      // Si ceci est défini comme par défaut, désactiver les autres adresses par défaut pour le client
      if (addressDataWithBelgium.isDefault && !address.isDefault) {
        await this.addressRepository.unsetDefaultForCustomer(
          address.customerId!,
          addressId
        );
      }

      // Mettre à jour l'entité adresse (country_name toujours Belgique)
      Object.assign(address, addressDataWithBelgium);
      address.addressId = addressId; // S'assurer que l'ID est préservé
      address.countryName = BELGIUM_COUNTRY_NAME; // Forcer country_name à Belgique

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
}

export default CustomerService;
