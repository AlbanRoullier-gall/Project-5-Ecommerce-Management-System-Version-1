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
import { CustomerCreateDTO, CustomerUpdateDTO } from "../dto";
import { CustomerMapper, ResponseMapper } from "../mapper";

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
      const { page = 1, limit = 10, search = "" } = req.query;

      const result = await this.customerService.listCustomers({
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10,
        search: (search as string) || "",
      });
      const response = CustomerMapper.createCustomerListResponse(
        result.customers,
        result.pagination
      );

      res.json(response);
    } catch (error: any) {
      console.error("List customers error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Récupérer tous les pays
   */
  async getCountries(req: Request, res: Response): Promise<void> {
    try {
      const countries = await this.customerService.getCountries();
      res.json({ message: "Countries retrieved", countries });
    } catch (error: any) {
      console.error("Get countries error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
