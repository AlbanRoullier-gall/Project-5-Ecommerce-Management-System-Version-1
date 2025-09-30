/**
 * API Router
 * Main API configuration and routing
 *
 * Architecture : Router pattern
 * - Centralized route configuration
 * - Middleware setup
 * - Authentication handling
 * - Request validation
 */

import express, { Request, Response, NextFunction } from "express";
import { Pool } from "pg";
import cors from "cors";
import helmet from "helmet";
import Joi from "joi";
import morgan from "morgan";
import CustomerService from "../services/CustomerService";
import {
  HealthController,
  CustomerController,
  AddressController,
  CompanyController,
} from "./controller";
import { ResponseMapper } from "./mapper";
// Routes are now defined directly in setupRoutes method

export class ApiRouter {
  private healthController: HealthController;
  private customerController: CustomerController;
  private addressController: AddressController;
  private companyController: CompanyController;

  constructor(pool: Pool) {
    const customerService = new CustomerService(pool);
    this.healthController = new HealthController(pool);
    this.customerController = new CustomerController(customerService);
    this.addressController = new AddressController(customerService);
    this.companyController = new CompanyController(customerService);
  }

  /**
   * Setup middlewares
   */
  private setupMiddlewares(app: express.Application): void {
    app.use(helmet()); // Security headers
    app.use(cors()); // CORS handling
    app.use(express.json()); // JSON parsing
    app.use(morgan("combined")); // Request logging
  }

  /**
   * Configuration des schémas de validation
   */
  private setupValidationSchemas(): any {
    return {
      customerCreateSchema: Joi.object({
        civilityId: Joi.number().integer().required(),
        firstName: Joi.string().max(100).required(),
        lastName: Joi.string().max(100).required(),
        email: Joi.string().email().max(255).required(),
        socioProfessionalCategoryId: Joi.number().integer().required(),
        phoneNumber: Joi.string().max(20).optional(),
        birthday: Joi.date().optional(),
      }),

      customerUpdateSchema: Joi.object({
        firstName: Joi.string().max(100).optional(),
        lastName: Joi.string().max(100).optional(),
        email: Joi.string().email().max(255).optional(),
        socioProfessionalCategoryId: Joi.number().integer().optional(),
        phoneNumber: Joi.string().max(20).optional(),
        birthday: Joi.date().optional(),
      }),

      addressCreateSchema: Joi.object({
        addressType: Joi.string().valid("shipping", "billing").required(),
        address: Joi.string().required(),
        postalCode: Joi.string().max(10).required(),
        city: Joi.string().max(100).required(),
        countryId: Joi.number().integer().required(),
        isDefault: Joi.boolean().optional(),
      }),

      addressUpdateSchema: Joi.object({
        addressType: Joi.string().valid("shipping", "billing").optional(),
        address: Joi.string().optional(),
        postalCode: Joi.string().max(10).optional(),
        city: Joi.string().max(100).optional(),
        countryId: Joi.number().integer().optional(),
        isDefault: Joi.boolean().optional(),
      }),

      companyCreateSchema: Joi.object({
        companyName: Joi.string().max(255).required(),
        siretNumber: Joi.string().max(20).optional(),
        vatNumber: Joi.string().max(20).optional(),
        address: Joi.string().optional(),
        postalCode: Joi.string().max(10).optional(),
        city: Joi.string().max(100).optional(),
        countryId: Joi.number().integer().optional(),
        phoneNumber: Joi.string().max(20).optional(),
        email: Joi.string().email().max(255).optional(),
      }),

      companyUpdateSchema: Joi.object({
        companyName: Joi.string().max(255).optional(),
        siretNumber: Joi.string().max(20).optional(),
        vatNumber: Joi.string().max(20).optional(),
        address: Joi.string().optional(),
        postalCode: Joi.string().max(10).optional(),
        city: Joi.string().max(100).optional(),
        countryId: Joi.number().integer().optional(),
        phoneNumber: Joi.string().max(20).optional(),
        email: Joi.string().email().max(255).optional(),
      }),
    };
  }

  /**
   * Validation middleware
   */
  private validateRequest = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error } = schema.validate(req.body);
      if (error) {
        res
          .status(400)
          .json(
            ResponseMapper.validationError(
              error.details[0]?.message || "Validation error"
            )
          );
        return;
      }
      next();
    };
  };

  /**
   * Configuration des routes
   */
  setupRoutes(app: express.Application): void {
    this.setupMiddlewares(app);
    const schemas = this.setupValidationSchemas();

    // ===== ROUTES DE SANTÉ =====
    app.get("/api/health", (req: Request, res: Response) => {
      this.healthController.healthCheck(req, res);
    });

    app.get("/api/health/detailed", (req: Request, res: Response) => {
      this.healthController.detailedHealthCheck(req, res);
    });

    // ===== ROUTES DE CLIENTS =====
    app.get("/api/customers/:id", (req: Request, res: Response) => {
      this.customerController.getCustomerById(req, res);
    });

    app.post(
      "/api/customers",
      this.validateRequest(schemas.customerCreateSchema),
      (req: Request, res: Response) => {
        this.customerController.createCustomer(req, res);
      }
    );

    app.put(
      "/api/customers/:id",
      this.validateRequest(schemas.customerUpdateSchema),
      (req: Request, res: Response) => {
        this.customerController.updateCustomer(req, res);
      }
    );

    app.delete("/api/customers/:id", (req: Request, res: Response) => {
      this.customerController.deleteCustomer(req, res);
    });

    app.get("/api/customers", (req: Request, res: Response) => {
      this.customerController.listCustomers(req, res);
    });

    // ===== ROUTES D'ADRESSES =====
    app.get(
      "/api/customers/:customerId/addresses",
      (req: Request, res: Response) => {
        this.addressController.getCustomerAddresses(req, res);
      }
    );

    app.post(
      "/api/customers/:customerId/addresses",
      this.validateRequest(schemas.addressCreateSchema),
      (req: Request, res: Response) => {
        this.addressController.createAddress(req, res);
      }
    );

    app.put(
      "/api/customers/:customerId/addresses/:id",
      this.validateRequest(schemas.addressUpdateSchema),
      (req: Request, res: Response) => {
        this.addressController.updateAddress(req, res);
      }
    );

    app.delete(
      "/api/customers/:customerId/addresses/:id",
      (req: Request, res: Response) => {
        this.addressController.deleteAddress(req, res);
      }
    );

    // ===== ROUTES D'ENTREPRISES =====
    app.get(
      "/api/customers/:customerId/companies",
      (req: Request, res: Response) => {
        this.companyController.getCustomerCompanies(req, res);
      }
    );

    app.post(
      "/api/customers/:customerId/companies",
      this.validateRequest(schemas.companyCreateSchema),
      (req: Request, res: Response) => {
        this.companyController.createCompany(req, res);
      }
    );

    app.put(
      "/api/customers/:customerId/companies/:id",
      this.validateRequest(schemas.companyUpdateSchema),
      (req: Request, res: Response) => {
        this.companyController.updateCompany(req, res);
      }
    );

    app.delete(
      "/api/customers/:customerId/companies/:id",
      (req: Request, res: Response) => {
        this.companyController.deleteCompany(req, res);
      }
    );

    // ===== GESTION DES ERREURS GLOBALES =====
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error(err.stack);
      res.status(500).json(ResponseMapper.internalServerError());
    });

    // Handler pour les routes non trouvées (404)
    app.use("*", (_req: Request, res: Response) => {
      res.status(404).json(ResponseMapper.notFoundError("Route non trouvée"));
    });
  }
}
