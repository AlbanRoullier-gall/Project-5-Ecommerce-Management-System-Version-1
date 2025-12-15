/**
 * Contrôleur de Clients
 * Gère les opérations de gestion des clients
 *
 * Architecture : Pattern Contrôleur
 * - Gestion des requêtes HTTP
 * - Orchestration de la logique métier
 * - Formatage des réponses
 */

import { Request, Response } from "express";
import CustomerService from "../../services/CustomerService";
import type {
  CustomerCreateDTO,
  CustomerUpdateDTO,
  CustomerListRequestDTO,
  CustomerResolveOrCreateDTO,
} from "../dto";
import { CustomerMapper, ResponseMapper } from "../mapper";
import Joi from "joi";

export class CustomerController {
  constructor(private customerService: CustomerService) {}

  // ===== GESTION DES CLIENTS =====

  /**
   * Récupérer un client par ID
   */
  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await this.customerService.getCustomerById(
        parseInt(id!)
      );

      if (!customer) {
        res.status(404).json(ResponseMapper.notFoundError("Client"));
        return;
      }

      const customerDTO = CustomerMapper.customerToPublicDTO(customer);
      res.json(ResponseMapper.customerRetrieved(customerDTO));
    } catch (error: any) {
      console.error("Get customer error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Récupérer un client par email
   */
  async getCustomerByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;

      if (!email) {
        res.status(400).json(ResponseMapper.validationError("Email requis"));
        return;
      }

      const customer = await this.customerService.getCustomerByEmail(
        decodeURIComponent(email)
      );

      if (!customer) {
        res.status(404).json(ResponseMapper.notFoundError("Client"));
        return;
      }

      const customerDTO = CustomerMapper.customerToPublicDTO(customer);
      res.json(ResponseMapper.customerRetrieved(customerDTO));
    } catch (error: any) {
      console.error("Get customer by email error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Récupérer uniquement le customerId par email (route optimisée)
   * Retourne seulement l'ID du client pour réduire le transfert de données
   */
  async getCustomerIdByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;

      if (!email) {
        res.status(400).json(ResponseMapper.validationError("Email requis"));
        return;
      }

      const customer = await this.customerService.getCustomerByEmail(
        decodeURIComponent(email)
      );

      if (!customer) {
        res.status(404).json(ResponseMapper.notFoundError("Client"));
        return;
      }

      // Retourner seulement le customerId
      res.json({
        success: true,
        customerId: customer.customerId,
      });
    } catch (error: any) {
      console.error("Get customer ID by email error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Créer un nouveau client
   */
  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const customerCreateDTO: CustomerCreateDTO = req.body;

      // Convertir DTO en données Customer
      const customerData =
        CustomerMapper.customerCreateDTOToCustomerData(customerCreateDTO);

      const customer = await this.customerService.createCustomer(customerData);
      const customerDTO = CustomerMapper.customerToPublicDTO(customer);

      res.status(201).json(ResponseMapper.customerCreated(customerDTO));
    } catch (error: any) {
      console.error("Create customer error:", error);
      if (error.message.includes("existe déjà")) {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      if (error.message.includes("invalide")) {
        res.status(400).json(ResponseMapper.validationError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Mettre à jour un client
   */
  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const customerUpdateDTO: CustomerUpdateDTO = req.body;

      // Convertir DTO en données Customer
      const customerData =
        CustomerMapper.customerUpdateDTOToCustomerData(customerUpdateDTO);

      const customer = await this.customerService.updateCustomer(
        parseInt(id!),
        customerData
      );
      const customerDTO = CustomerMapper.customerToPublicDTO(customer);

      res.json(ResponseMapper.customerUpdated(customerDTO));
    } catch (error: any) {
      console.error("Update customer error:", error);
      if (error.message === "Customer not found") {
        res.status(404).json(ResponseMapper.notFoundError("Customer"));
        return;
      }
      if (error.message.includes("already exists")) {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Supprimer un client
   */
  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.customerService.deleteCustomer(parseInt(id!));

      if (!success) {
        res.status(404).json(ResponseMapper.notFoundError("Customer"));
        return;
      }

      res.json(ResponseMapper.customerDeleted());
    } catch (error: any) {
      console.error("Delete customer error:", error);
      if (error.message === "Customer not found") {
        res.status(404).json(ResponseMapper.notFoundError("Customer"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Lister les clients avec pagination
   */
  async listCustomers(req: Request, res: Response): Promise<void> {
    try {
      // Schéma de validation Joi pour les query params
      const customerListQuerySchema = Joi.object({
        search: Joi.string().max(255).optional().allow(""),
      }).unknown(true);

      // Valider les query params
      const { error, value } = customerListQuerySchema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const messages = error.details
          .map((detail) => detail.message)
          .join("; ");
        res
          .status(400)
          .json(
            ResponseMapper.validationError(
              `Paramètres de recherche invalides: ${messages}`
            )
          );
        return;
      }

      // Construire le DTO à partir des valeurs validées
      const options: CustomerListRequestDTO = {
        ...(value.search && { search: value.search }),
      };

      const customers = await this.customerService.listCustomers({
        search: options.search ?? "",
      });

      // Mapper les clients vers CustomerPublicDTO
      const customersDTO = CustomerMapper.customersToPublicDTOs(customers);

      // Utiliser ResponseMapper pour standardiser la réponse
      res.json(
        ResponseMapper.customersListed({
          customers: customersDTO,
        })
      );
    } catch (error: any) {
      console.error("List customers error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Obtenir les statistiques formatées pour le dashboard
   */
  async getDashboardStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.customerService.getDashboardStatistics();

      res.json({
        success: true,
        data: {
          statistics,
        },
        timestamp: new Date().toISOString(),
        status: 200,
      });
    } catch (error: any) {
      console.error("Get dashboard statistics error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Résoudre ou créer un client
   * Cherche le client par email, le crée s'il n'existe pas
   */
  async resolveOrCreateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const resolveOrCreateDTO: CustomerResolveOrCreateDTO = req.body;

      if (!resolveOrCreateDTO.email) {
        res.status(400).json(ResponseMapper.validationError("Email requis"));
        return;
      }

      const customerId = await this.customerService.resolveOrCreateCustomer({
        email: resolveOrCreateDTO.email,
        ...(resolveOrCreateDTO.firstName && {
          firstName: resolveOrCreateDTO.firstName,
        }),
        ...(resolveOrCreateDTO.lastName && {
          lastName: resolveOrCreateDTO.lastName,
        }),
        ...(resolveOrCreateDTO.phoneNumber && {
          phoneNumber: resolveOrCreateDTO.phoneNumber,
        }),
      });

      res.json({
        success: true,
        customerId,
      });
    } catch (error: any) {
      console.error("Resolve or create customer error:", error);
      if (error.message.includes("obligatoire")) {
        res.status(400).json(ResponseMapper.validationError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Valider les données client (sans les créer)
   * Endpoint public pour valider les données client avant soumission
   */
  async validateCustomerData(req: Request, res: Response): Promise<void> {
    try {
      const customerData: CustomerResolveOrCreateDTO = req.body;

      const validationResult =
        this.customerService.validateCustomerData(customerData);

      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          isValid: false,
          errors: validationResult.errors,
          timestamp: new Date().toISOString(),
          status: 400,
        });
        return;
      }

      res.json({
        success: true,
        isValid: true,
        message: "Les données client sont valides",
        timestamp: new Date().toISOString(),
        status: 200,
      });
    } catch (error: any) {
      console.error("Validate customer data error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
