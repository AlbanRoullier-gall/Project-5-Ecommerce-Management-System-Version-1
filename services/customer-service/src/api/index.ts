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
} from "./controller";
import { ResponseMapper } from "./mapper";
// Les routes sont maintenant définies directement dans la méthode setupRoutes

export class ApiRouter {
  private healthController: HealthController;
  private customerController: CustomerController;
  private addressController: AddressController;

  constructor(pool: Pool) {
    const customerService = new CustomerService(pool);
    this.healthController = new HealthController(pool);
    this.customerController = new CustomerController(customerService);
    this.addressController = new AddressController(customerService);
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
        firstName: Joi.string().max(100).required(),
        lastName: Joi.string().max(100).required(),
        email: Joi.string().email().max(255).required(),
        phoneNumber: Joi.string().max(20).optional(),
      }),

      customerUpdateSchema: Joi.object({
        firstName: Joi.string().max(100).optional(),
        lastName: Joi.string().max(100).optional(),
        email: Joi.string().email().max(255).optional(),
        phoneNumber: Joi.string().max(20).optional(),
      }),

      addressCreateSchema: Joi.object({
        addressType: Joi.string().valid("shipping", "billing").required(),
        address: Joi.string().required(),
        postalCode: Joi.string().max(10).required(),
        city: Joi.string().max(100).required(),
        countryName: Joi.string().optional(), // Optionnel car toujours "Belgique" par défaut
        isDefault: Joi.boolean().optional(),
      }),

      addressUpdateSchema: Joi.object({
        addressType: Joi.string().valid("shipping", "billing").optional(),
        address: Joi.string().optional(),
        postalCode: Joi.string().max(10).optional(),
        city: Joi.string().max(100).optional(),
        countryName: Joi.string().optional(), // Optionnel car toujours "Belgique"
        isDefault: Joi.boolean().optional(),
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

    // Récupérer uniquement le customerId par email (route optimisée - doit être avant la route générale)
    app.get(
      "/api/customers/by-email/:email/id",
      (req: Request, res: Response) => {
        this.customerController.getCustomerIdByEmail(req, res);
      }
    );

    // Récupérer un client par email (publique)
    app.get("/api/customers/by-email/:email", (req: Request, res: Response) => {
      this.customerController.getCustomerByEmail(req, res);
    });

    // Voir un client spécifique (publique) — doit être après les routes spécifiques ci-dessus
    app.get("/api/customers/:id", (req: Request, res: Response) => {
      this.customerController.getCustomerById(req, res);
    });

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
