/**
 * Routeur API - Service PDF Export
 * Configuration centralisée des routes pour pdf-export-service
 */

import { Request, Response, NextFunction } from "express";
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const Joi = require("joi");
const morgan = require("morgan");
import { HealthController, ExportController } from "./controller/index";
import { ResponseMapper } from "./mapper/index";

export class ApiRouter {
  private healthController: HealthController;
  private exportController: ExportController;

  constructor() {
    this.healthController = new HealthController();
    this.exportController = new ExportController();
  }

  /**
   * Configuration des middlewares
   */
  private setupMiddlewares(app: express.Application): void {
    app.use(helmet());
    app.use(cors());
    app.use(morgan("combined"));
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  }

  /**
   * Configuration des schémas de validation
   */
  private setupValidationSchemas() {
    return {
      // Schéma d'export d'année (simplifié)
      yearExportSchema: Joi.object({
        year: Joi.number().integer().min(2000).max(2100).required(),
        orders: Joi.array().items(Joi.object()).required(),
        creditNotes: Joi.array().items(Joi.object()).required(),
      }),
      // Schéma d'export de facture (simplifié)
      orderInvoiceSchema: Joi.object({
        order: Joi.object().required(),
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

    // ===== ROUTES D'EXPORT =====
    // Export d'une facture pour une commande (ROUTE ADMIN)
    app.post(
      "/api/admin/export/order-invoice",
      this.requireAuth,
      this.validateRequest(schemas.orderInvoiceSchema),
      (req: Request, res: Response) => {
        this.exportController.generateOrderInvoice(req, res);
      }
    );

    // Export des commandes par année (ROUTE ADMIN)
    app.post(
      "/api/admin/export/orders-year",
      this.requireAuth,
      this.validateRequest(schemas.yearExportSchema),
      (req: Request, res: Response) => {
        this.exportController.generateOrdersYearExport(req, res);
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
