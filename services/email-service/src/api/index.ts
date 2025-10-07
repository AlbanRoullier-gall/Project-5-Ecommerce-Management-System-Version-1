/**
 * API Router - Version simplifiée pour Gmail
 * Configuration centralisée des routes pour email-service
 */

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import Joi from "joi";
import morgan from "morgan";
import EmailService from "../services/EmailService";
import { HealthController, EmailController } from "./controller";
import { ResponseMapper } from "./mapper";

export class ApiRouter {
  private healthController: HealthController;
  private emailController: EmailController;

  constructor() {
    const emailService = new EmailService();
    this.healthController = new HealthController();
    this.emailController = new EmailController(emailService);
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
      // Email client schema
      emailSendSchema: Joi.object({
        to: Joi.object({
          email: Joi.string().email().required(),
          name: Joi.string().optional(),
        }).required(),
        subject: Joi.string().max(255).required(),
        message: Joi.string().max(5000).required(),
        clientName: Joi.string().max(100).required(),
        clientEmail: Joi.string().email().required(),
      }),

      // Email confirmation schema
      emailConfirmationSchema: Joi.object({
        clientName: Joi.string().max(100).required(),
        clientEmail: Joi.string().email().required(),
        subject: Joi.string().max(255).required(),
        message: Joi.string().max(5000).required(),
        sentAt: Joi.date().required(),
      }),

      // Email reset password schema
      emailResetPasswordSchema: Joi.object({
        email: Joi.string().email().required(),
        token: Joi.string().required(),
        userName: Joi.string().max(100).required(),
        resetUrl: Joi.string().uri().required(),
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

    // ===== ROUTES PRINCIPALES =====
    // Envoyer un email au client
    app.post(
      "/api/email/send",
      this.validateRequest(schemas.emailSendSchema),
      (req: Request, res: Response) => {
        this.emailController.sendClientEmail(req, res);
      }
    );

    // Envoyer une confirmation à l'admin (optionnel, car fait automatiquement)
    app.post(
      "/api/email/confirmation",
      this.validateRequest(schemas.emailConfirmationSchema),
      (req: Request, res: Response) => {
        this.emailController.sendConfirmationEmail(req, res);
      }
    );

    // Envoyer un email de réinitialisation de mot de passe
    app.post(
      "/api/email/send-reset-email",
      this.validateRequest(schemas.emailResetPasswordSchema),
      (req: Request, res: Response) => {
        this.emailController.sendResetPasswordEmail(req, res);
      }
    );

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
