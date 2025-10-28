/**
 * Routeur API
 * Configuration et routage principaux de l'API
 *
 * Architecture : Pattern Routeur
 * - Configuration centralisée des routes
 * - Configuration des middlewares
 * - Gestion de l'authentification
 * - Validation des requêtes
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
// Les routes sont maintenant définies directement dans la méthode setupRoutes

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
   * Configuration des middlewares
   */
  private setupMiddlewares(app: express.Application): void {
    app.use(helmet()); // En-têtes de sécurité
    app.use(cors()); // Gestion CORS
    app.use(express.json()); // Analyse JSON
    app.use(morgan("combined")); // Journalisation des requêtes
  }

  /**
   * Configuration des schémas de validation
   */
  private setupValidationSchemas(): any {
    return {
      customerCreateSchema: Joi.object({
        civilityId: Joi.number().integer().optional(),
        firstName: Joi.string().max(100).required(),
        lastName: Joi.string().max(100).required(),
        email: Joi.string().email().max(255).required(),
        socioProfessionalCategoryId: Joi.number().integer().optional(),
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
   * Middleware de validation
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
   * Authentication middleware pour les routes protégées
   */
  private requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const userId = req.headers["x-user-id"];
    const userEmail = req.headers["x-user-email"];

    if (!userId || !userEmail) {
      res.status(401).json({
        error: "Erreur d'authentification",
        message: "Informations utilisateur manquantes",
        timestamp: new Date().toISOString(),
        status: 401,
      });
      return;
    }

    // Ajouter les informations utilisateur à la requête
    (req as any).user = {
      userId: Number(userId),
      email: userEmail,
    };

    next();
  };

  /**
   * Middleware pour vérifier que l'utilisateur accède à ses propres données
   */
  private requireOwnership = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const userId = req.headers["x-user-id"];
    const customerId = req.params.id || req.params.customerId;

    if (!userId) {
      res.status(401).json({
        error: "Erreur d'authentification",
        message: "Informations utilisateur manquantes",
        timestamp: new Date().toISOString(),
        status: 401,
      });
      return;
    }

    // Vérifier que l'utilisateur accède à ses propres données
    if (Number(userId) !== Number(customerId)) {
      res.status(403).json({
        error: "Accès interdit",
        message: "Vous ne pouvez accéder qu'à vos propres données",
        timestamp: new Date().toISOString(),
        status: 403,
      });
      return;
    }

    next();
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

    // ===== ROUTES PUBLIQUES DE CLIENTS =====
    // Création de client (publique pour l'inscription)
    app.post(
      "/api/customers",
      this.validateRequest(schemas.customerCreateSchema),
      (req: Request, res: Response) => {
        this.customerController.createCustomer(req, res);
      }
    );

    // Récupérer un client par email (publique)
    app.get("/api/customers/by-email/:email", (req: Request, res: Response) => {
      this.customerController.getCustomerByEmail(req, res);
    });

    // Données de référence publiques (civilités, catégories, pays)
    app.get("/api/customers/civilities", (req: Request, res: Response) => {
      this.customerController.getCivilities(req, res);
    });

    app.get("/api/customers/categories", (req: Request, res: Response) => {
      this.customerController.getCategories(req, res);
    });

    app.get("/api/customers/countries", (req: Request, res: Response) => {
      this.customerController.getCountries(req, res);
    });

    // Voir un client spécifique (publique) — doit être après les routes spécifiques ci-dessus
    app.get("/api/customers/:id", (req: Request, res: Response) => {
      this.customerController.getCustomerById(req, res);
    });

    // ===== ROUTES DE RÉFÉRENCE ADMIN =====
    // Routes admin pour obtenir les données de référence (civilités, catégories, pays)
    // Utilisées dans le backoffice
    // IMPORTANT: Ces routes doivent être définies AVANT les routes avec paramètres
    app.get(
      "/api/admin/customers/civilities",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.customerController.getCivilities(req, res);
      }
    );

    app.get(
      "/api/admin/customers/categories",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.customerController.getCategories(req, res);
      }
    );

    app.get(
      "/api/admin/customers/countries",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.customerController.getCountries(req, res);
      }
    );

    // Route de recherche de clients
    app.get(
      "/api/admin/customers/search",
      this.requireAuth,
      (req: Request, res: Response) => {
        // Mapper le paramètre 'q' vers 'search' pour la compatibilité
        if (req.query.q && !req.query.search) {
          req.query.search = req.query.q;
        }
        this.customerController.listCustomers(req, res);
      }
    );

    // Routes d'activation/désactivation
    app.post(
      "/api/admin/customers/:id/activate",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.customerController.activateCustomer(req, res);
      }
    );

    app.post(
      "/api/admin/customers/:id/deactivate",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.customerController.deactivateCustomer(req, res);
      }
    );

    // ===== ROUTES ADMIN DE CLIENTS =====
    app.get(
      "/api/admin/customers/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.customerController.getCustomerById(req, res);
      }
    );

    app.put(
      "/api/admin/customers/:id",
      this.requireAuth,
      this.validateRequest(schemas.customerUpdateSchema),
      (req: Request, res: Response) => {
        this.customerController.updateCustomer(req, res);
      }
    );

    app.delete(
      "/api/admin/customers/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.customerController.deleteCustomer(req, res);
      }
    );

    app.get(
      "/api/admin/customers",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.customerController.listCustomers(req, res);
      }
    );

    app.post(
      "/api/admin/customers",
      this.requireAuth,
      this.validateRequest(schemas.customerCreateSchema),
      (req: Request, res: Response) => {
        this.customerController.createCustomer(req, res);
      }
    );

    // ===== ROUTES PUBLIQUES D'ADRESSES =====
    // Ajout d'adresse (publique pour les clients)
    app.post(
      "/api/customers/:customerId/addresses",
      this.validateRequest(schemas.addressCreateSchema),
      (req: Request, res: Response) => {
        this.addressController.createAddress(req, res);
      }
    );

    // Récupérer une adresse spécifique (publique)
    app.get(
      "/api/customers/:customerId/addresses/:id",
      (req: Request, res: Response) => {
        this.addressController.getAddressById(req, res);
      }
    );

    // ===== ROUTES ADMIN D'ADRESSES =====
    app.post(
      "/api/admin/customers/:customerId/addresses",
      this.requireAuth,
      this.validateRequest(schemas.addressCreateSchema),
      (req: Request, res: Response) => {
        this.addressController.createAddress(req, res);
      }
    );

    app.get(
      "/api/admin/customers/:customerId/addresses",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.addressController.getCustomerAddresses(req, res);
      }
    );

    app.put(
      "/api/admin/customers/:customerId/addresses/:id",
      this.requireAuth,
      this.validateRequest(schemas.addressUpdateSchema),
      (req: Request, res: Response) => {
        this.addressController.updateAddress(req, res);
      }
    );

    app.delete(
      "/api/admin/customers/:customerId/addresses/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.addressController.deleteAddress(req, res);
      }
    );

    // ===== ROUTES PUBLIQUES D'ENTREPRISES =====
    // Ajout d'entreprise (publique pour les clients)
    app.post(
      "/api/customers/:customerId/companies",
      this.validateRequest(schemas.companyCreateSchema),
      (req: Request, res: Response) => {
        this.companyController.createCompany(req, res);
      }
    );

    // Récupérer une entreprise spécifique (publique)
    app.get(
      "/api/customers/:customerId/companies/:id",
      (req: Request, res: Response) => {
        this.companyController.getCompanyById(req, res);
      }
    );

    // ===== ROUTES ADMIN D'ENTREPRISES =====
    app.get(
      "/api/admin/customers/:customerId/companies",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.companyController.getCustomerCompanies(req, res);
      }
    );

    app.put(
      "/api/admin/customers/:customerId/companies/:id",
      this.requireAuth,
      this.validateRequest(schemas.companyUpdateSchema),
      (req: Request, res: Response) => {
        this.companyController.updateCompany(req, res);
      }
    );

    app.delete(
      "/api/admin/customers/:customerId/companies/:id",
      this.requireAuth,
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
