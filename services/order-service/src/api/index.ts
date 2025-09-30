/**
 * API Router
 * Main API configuration and routing
 *
 * Architecture : Router pattern
 * - Centralized route configuration
 * - Middleware setup
 * - Request validation
 */

import express, { Request, Response, NextFunction } from "express";
import { Pool } from "pg";
import cors from "cors";
import helmet from "helmet";
import Joi from "joi";
import morgan from "morgan";
import OrderService from "../services/OrderService";
import { HealthController, OrderController } from "./controller";
import { ResponseMapper } from "./mapper";

export class ApiRouter {
  private healthController: HealthController;
  private orderController: OrderController;

  constructor(pool: Pool) {
    const orderService = new OrderService(pool);
    this.healthController = new HealthController(pool);
    this.orderController = new OrderController(orderService);
  }

  /**
   * Setup middlewares
   */
  private setupMiddlewares(app: express.Application): void {
    app.use(helmet());
    app.use(cors());
    app.use(morgan("combined"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
  }

  /**
   * Setup validation schemas
   */
  private setupValidationSchemas() {
    return {
      orderCreateSchema: Joi.object({
        customerId: Joi.number().integer().positive().required(),
        customerSnapshot: Joi.object().optional(),
        totalAmountHT: Joi.number().positive().required(),
        totalAmountTTC: Joi.number().positive().required(),
        paymentMethod: Joi.string().required(),
        notes: Joi.string().optional(),
      }),
      orderUpdateSchema: Joi.object({
        customerSnapshot: Joi.object().optional(),
        totalAmountHT: Joi.number().positive().optional(),
        totalAmountTTC: Joi.number().positive().optional(),
        paymentMethod: Joi.string().optional(),
        notes: Joi.string().optional(),
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

    // ===== ROUTES DE COMMANDES =====
    app.post(
      "/api/orders",
      this.validateRequest(schemas.orderCreateSchema),
      (req: Request, res: Response) => {
        this.orderController.createOrder(req, res);
      }
    );

    app.get("/api/orders/:id", (req: Request, res: Response) => {
      this.orderController.getOrderById(req, res);
    });

    app.put(
      "/api/orders/:id",
      this.validateRequest(schemas.orderUpdateSchema),
      (req: Request, res: Response) => {
        this.orderController.updateOrder(req, res);
      }
    );

    app.delete("/api/orders/:id", (req: Request, res: Response) => {
      this.orderController.deleteOrder(req, res);
    });

    app.get("/api/orders", (req: Request, res: Response) => {
      this.orderController.listOrders(req, res);
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
