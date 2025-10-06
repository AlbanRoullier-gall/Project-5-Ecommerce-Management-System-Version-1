/**
 * Company Controller
 * Handles customer company management operations
 *
 * Architecture : Controller pattern
 * - HTTP request handling
 * - Business logic orchestration
 * - Response formatting
 */

import { Request, Response } from "express";
import CustomerService from "../../services/CustomerService";
import { CompanyCreateDTO, CompanyUpdateDTO } from "../dto";
import { CustomerMapper, ResponseMapper } from "../mapper";

export class CompanyController {
  constructor(private customerService: CustomerService) {}

  /**
   * Get customer companies
   */
  async getCustomerCompanies(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;

      if (!customerId) {
        res.status(400).json({ error: "Customer ID is required" });
        return;
      }

      const companies = await this.customerService.listCustomerCompanies(
        parseInt(customerId)
      );
      const response = {
        message: "Entreprises récupérées avec succès",
        companies: CustomerMapper.companiesToPublicDTOs(companies),
        timestamp: new Date().toISOString(),
        status: 200,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Get companies error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Get company by ID
   */
  async getCompanyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: "Company ID is required" });
        return;
      }

      const company = await this.customerService.getCompanyById(parseInt(id));

      if (!company) {
        res.status(404).json(ResponseMapper.notFoundError("Company"));
        return;
      }

      const companyDTO = CustomerMapper.companyToPublicDTO(company);
      res.json(ResponseMapper.companyRetrieved(companyDTO));
    } catch (error: any) {
      console.error("Get company by ID error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Create new company
   */
  async createCompany(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;

      if (!customerId) {
        res.status(400).json({ error: "Customer ID is required" });
        return;
      }

      const companyCreateDTO: CompanyCreateDTO = req.body;
      const companyData =
        CustomerMapper.companyCreateDTOToCompanyData(companyCreateDTO);

      const company = await this.customerService.addCompany(
        parseInt(customerId),
        companyData
      );
      const companyDTO = CustomerMapper.companyToPublicDTO(company);

      res.status(201).json(ResponseMapper.companyCreated(companyDTO));
    } catch (error: any) {
      console.error("Create company error:", error);
      if (error.message === "Customer not found") {
        res.status(404).json(ResponseMapper.notFoundError("Customer"));
        return;
      }
      if (error.message.includes("already exists")) {
        res.status(409).json(ResponseMapper.conflictError(error.message));
        return;
      }
      if (error.message.includes("validation")) {
        res.status(400).json(ResponseMapper.validationError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  /**
   * Update company
   */
  async updateCompany(req: Request, res: Response): Promise<void> {
    try {
      const { id: companyId } = req.params;

      if (!companyId) {
        res.status(400).json({ error: "Company ID is required" });
        return;
      }

      const companyUpdateDTO: CompanyUpdateDTO = req.body;
      const updateData =
        CustomerMapper.companyUpdateDTOToCompanyData(companyUpdateDTO);

      const company = await this.customerService.updateCompany(
        parseInt(companyId),
        updateData
      );
      const companyDTO = CustomerMapper.companyToPublicDTO(company);

      res.json(ResponseMapper.companyUpdated(companyDTO));
    } catch (error: any) {
      console.error("Update company error:", error);
      if (error.message === "Company not found") {
        res.status(404).json(ResponseMapper.notFoundError("Company"));
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
   * Delete company
   */
  async deleteCompany(req: Request, res: Response): Promise<void> {
    try {
      const { id: companyId } = req.params;

      if (!companyId) {
        res.status(400).json({ error: "Company ID is required" });
        return;
      }

      const success = await this.customerService.deleteCompany(
        parseInt(companyId)
      );

      if (!success) {
        res.status(404).json(ResponseMapper.notFoundError("Company"));
        return;
      }

      res.json(ResponseMapper.companyDeleted());
    } catch (error: any) {
      console.error("Delete company error:", error);
      if (error.message === "Company not found") {
        res.status(404).json(ResponseMapper.notFoundError("Company"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}
