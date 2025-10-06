/**
 * Customer Controller
 * Handles customer management operations
 *
 * Architecture : Controller pattern
 * - HTTP request handling
 * - Business logic orchestration
 * - Response formatting
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
   * Update customer
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
   * Delete customer
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
   * List customers with pagination
   */
  async listCustomers(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        activeOnly = false,
      } = req.query;

      const result = await this.customerService.listCustomers({
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10,
        search: (search as string) || "",
        activeOnly: activeOnly === "true",
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
}
