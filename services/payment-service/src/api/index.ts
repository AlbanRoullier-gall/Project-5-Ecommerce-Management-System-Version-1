/**
 * Routeur API - Version simplifiée pour Stripe
 * Configuration centralisée des routes pour payment-service
 */

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import Joi from "joi";
import morgan from "morgan";
import PaymentService from "../services/PaymentService";
import { HealthController, PaymentController } from "./controller";
import { ResponseMapper } from "./mapper";

export class ApiRouter {
  private healthController: HealthController;
  private paymentController: PaymentController;

  constructor() {
    const paymentService = new PaymentService();
    this.healthController = new HealthController();
    this.paymentController = new PaymentController(paymentService);
  }

  /**
   * Configuration des middlewares
   */
  private setupMiddlewares(app: express.Application): void {
    app.use(helmet());
    app.use(cors());
    app.use(morgan("combined"));
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  }

  /**
   * Configuration des schémas de validation
   */
  private setupValidationSchemas() {
    return {
      // Schéma de création de paiement
      paymentCreateSchema: Joi.object({
        customer: Joi.object({
          email: Joi.string().email().required(),
          name: Joi.string().max(100).optional(),
          phone: Joi.string().max(20).allow("").optional(),
        }).required(),
        items: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().max(100).required(),
              description: Joi.string().allow("").max(255).optional(),
              price: Joi.number().positive().required(),
              quantity: Joi.number().positive().required(),
              currency: Joi.string().length(3).required(),
            })
          )
          .min(1)
          .required(),
        // Accepter les placeholders Stripe {CHECKOUT_SESSION_ID}
        // Joi.uri() rejette les accolades, on assouplit donc la validation
        successUrl: Joi.string().required(),
        cancelUrl: Joi.string().required(),
        metadata: Joi.object().optional(),
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
   * Middleware d'authentification pour les routes admin
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

    (req as any).user = {
      userId: Number(userId),
      email: userEmail,
    };

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

    // ===== ROUTES DE PAIEMENT =====
    // Créer un paiement
    app.post(
      "/api/payment/create",
      this.validateRequest(schemas.paymentCreateSchema),
      (req: Request, res: Response) => {
        this.paymentController.createPayment(req, res);
      }
    );

    // (Route de confirmation supprimée)

    // ===== GESTION DES ERREURS =====
    app.use((req: Request, res: Response) => {
      res.status(404).json(ResponseMapper.notFoundError("Route"));
    });

    app.use((error: any, req: Request, res: Response, next: NextFunction) => {
      console.error("Unhandled error:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    });
  }
}
