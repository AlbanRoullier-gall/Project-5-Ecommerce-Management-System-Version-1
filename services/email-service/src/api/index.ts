/**
 * API Router - Version simplifiée pour Gmail
 * Configuration centralisée des routes pour email-service
 */

import express, { Request, Response, NextFunction, Application } from "express";
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
  private setupMiddlewares(app: Application): void {
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
      // Le destinataire est déterminé côté serveur depuis ADMIN_EMAIL
      emailSendSchema: Joi.object({
        subject: Joi.string().max(255).required(),
        message: Joi.string().max(5000).required(),
        clientName: Joi.string().max(100).required(),
        clientEmail: Joi.string().email().required(),
      }).unknown(true),

      // Email reset password schema
      emailResetPasswordSchema: Joi.object({
        email: Joi.string().email().required(),
        token: Joi.string().required(),
        userName: Joi.string().max(100).required(),
        resetUrl: Joi.string().uri().required(),
      }),

      // Backoffice rejection notification schema
      // Accepte soit userFullName/userEmail (compatibilité), soit user object (nouveau format)
      backofficeRejectionNotificationSchema: Joi.alternatives().try(
        Joi.object({
          userEmail: Joi.string().email().required(),
          userFullName: Joi.string().max(200).required(),
        }).unknown(true),
        Joi.object({
          user: Joi.object({
            firstName: Joi.string().optional(),
            lastName: Joi.string().optional(),
            email: Joi.string().email().required(),
          })
            .unknown(true)
            .required(),
        }).unknown(true)
      ),

      // Order confirmation email schema
      // Format simplifié : orderId, cart, customerData, addressData
      // Les items peuvent avoir des champs supplémentaires (productId, unitPriceHT, etc.)
      orderConfirmationEmailSchema: Joi.object({
        orderId: Joi.number().integer().positive().required(),
        cart: Joi.object({
          items: Joi.array()
            .items(
              Joi.object({
                productName: Joi.string().required(),
                quantity: Joi.number().integer().positive().required(),
                unitPriceTTC: Joi.number().positive().required(),
                totalPriceTTC: Joi.number().positive().required(),
                vatRate: Joi.number().min(0).max(100).required(),
              }).unknown(true) // Accepter les champs supplémentaires (productId, unitPriceHT, totalPriceHT, etc.)
            )
            .min(1)
            .required(),
          subtotal: Joi.number().required(),
          tax: Joi.number().required(),
          total: Joi.number().required(),
        })
          .unknown(true)
          .required(),
        customerData: Joi.object({
          firstName: Joi.string().optional().allow(null, ""),
          lastName: Joi.string().optional().allow(null, ""),
          email: Joi.string().email().required(),
          phoneNumber: Joi.string().optional().allow(null, ""),
        })
          .unknown(true)
          .required(),
        addressData: Joi.object({
          shipping: Joi.object({
            address: Joi.string().optional().allow(null, ""),
            postalCode: Joi.string().optional().allow(null, ""),
            city: Joi.string().optional().allow(null, ""),
            countryName: Joi.string().optional().allow(null, ""),
          })
            .unknown(true)
            .optional(),
        })
          .unknown(true)
          .required(),
      }).unknown(true),
    };
  }

  /**
   * Middleware de validation
   */
  private validateRequest = (schema: Joi.Schema) => {
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
  setupRoutes(app: Application): void {
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

    // Envoyer un email de réinitialisation de mot de passe
    app.post(
      "/api/email/send-reset-email",
      this.validateRequest(schemas.emailResetPasswordSchema),
      (req: Request, res: Response) => {
        this.emailController.sendResetPasswordEmail(req, res);
      }
    );

    // ===== ROUTES BACKOFFICE =====
    // Envoyer une notification de rejet backoffice
    app.post(
      "/api/email/backoffice-rejection-notification",
      this.validateRequest(schemas.backofficeRejectionNotificationSchema),
      (req: Request, res: Response) => {
        this.emailController.sendBackofficeRejectionNotification(req, res);
      }
    );

    // ===== ROUTES COMMANDES =====
    // Envoyer un email de confirmation de commande
    app.post(
      "/api/email/order-confirmation",
      this.validateRequest(schemas.orderConfirmationEmailSchema),
      (req: Request, res: Response) => {
        this.emailController.sendOrderConfirmationEmail(req, res);
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
