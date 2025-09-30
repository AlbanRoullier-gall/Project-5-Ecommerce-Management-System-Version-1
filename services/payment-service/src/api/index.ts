/**
 * API Router - Version simplifiée pour Stripe
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
   * Setup middlewares
   */
  private setupMiddlewares(app: express.Application): void {
    app.use(helmet());
    app.use(cors());
    app.use(morgan("combined"));
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  }

  /**
   * Setup validation schemas
   */
  private setupValidationSchemas() {
    return {
      // Payment create schema
      paymentCreateSchema: Joi.object({
        customer: Joi.object({
          email: Joi.string().email().required(),
          name: Joi.string().max(100).optional(),
          phone: Joi.string().max(20).optional(),
        }).required(),
        items: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().max(100).required(),
              description: Joi.string().max(255).optional(),
              price: Joi.number().positive().required(),
              quantity: Joi.number().positive().required(),
              currency: Joi.string().length(3).required(),
            })
          )
          .min(1)
          .required(),
        successUrl: Joi.string().uri().required(),
        cancelUrl: Joi.string().uri().required(),
        metadata: Joi.object().optional(),
      }),

      // Payment confirm schema
      paymentConfirmSchema: Joi.object({
        paymentIntentId: Joi.string().required(),
      }),

      // Payment refund schema
      paymentRefundSchema: Joi.object({
        paymentIntentId: Joi.string().required(),
        amount: Joi.number().positive().optional(),
        reason: Joi.string().max(100).optional(),
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

    // Confirmer un paiement
    app.post(
      "/api/payment/confirm",
      this.validateRequest(schemas.paymentConfirmSchema),
      (req: Request, res: Response) => {
        this.paymentController.confirmPayment(req, res);
      }
    );

    // Rembourser un paiement
    app.post(
      "/api/payment/refund",
      this.validateRequest(schemas.paymentRefundSchema),
      (req: Request, res: Response) => {
        this.paymentController.refundPayment(req, res);
      }
    );

    // Récupérer un paiement par ID
    app.get("/api/payment/:paymentId", (req: Request, res: Response) => {
      this.paymentController.getPayment(req, res);
    });

    // Récupérer les statistiques de paiement
    app.get("/api/payment/stats", (req: Request, res: Response) => {
      this.paymentController.getPaymentStats(req, res);
    });

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
