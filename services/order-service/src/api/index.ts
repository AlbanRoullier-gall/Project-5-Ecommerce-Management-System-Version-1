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
import {
  HealthController,
  OrderController,
  OrderItemController,
  CreditNoteController,
  CreditNoteItemController,
  OrderAddressController,
  OrderStatisticsController,
} from "./controller";
import { ResponseMapper } from "./mapper";

export class ApiRouter {
  private healthController: HealthController;
  private orderController: OrderController;
  private orderItemController: OrderItemController;
  private creditNoteController: CreditNoteController;
  private creditNoteItemController: CreditNoteItemController;
  private orderAddressController: OrderAddressController;
  private orderStatisticsController: OrderStatisticsController;

  constructor(pool: Pool) {
    const orderService = new OrderService(pool);
    this.healthController = new HealthController(pool);
    this.orderController = new OrderController(orderService);
    this.orderItemController = new OrderItemController(orderService);
    this.creditNoteController = new CreditNoteController(orderService);
    this.creditNoteItemController = new CreditNoteItemController(orderService);
    this.orderAddressController = new OrderAddressController(orderService);
    this.orderStatisticsController = new OrderStatisticsController(
      orderService
    );
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
      // Order schemas
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

      // OrderItem schemas
      orderItemCreateSchema: Joi.object({
        orderId: Joi.number().integer().positive().required(),
        productId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
        unitPriceHT: Joi.number().positive().required(),
        unitPriceTTC: Joi.number().positive().required(),
        vatRate: Joi.number().positive().required(),
        totalPriceHT: Joi.number().positive().required(),
        totalPriceTTC: Joi.number().positive().required(),
      }),
      orderItemUpdateSchema: Joi.object({
        productId: Joi.number().integer().positive().optional(),
        quantity: Joi.number().integer().positive().optional(),
        unitPriceHT: Joi.number().positive().optional(),
        unitPriceTTC: Joi.number().positive().optional(),
        vatRate: Joi.number().positive().optional(),
        totalPriceHT: Joi.number().positive().optional(),
        totalPriceTTC: Joi.number().positive().optional(),
      }),

      // CreditNote schemas
      creditNoteCreateSchema: Joi.object({
        customerId: Joi.number().integer().positive().required(),
        orderId: Joi.number().integer().positive().optional(),
        reason: Joi.string().required(),
        description: Joi.string().optional(),
        totalAmountHT: Joi.number().positive().required(),
        totalAmountTTC: Joi.number().positive().required(),
        paymentMethod: Joi.string().required(),
        notes: Joi.string().optional(),
      }),
      creditNoteUpdateSchema: Joi.object({
        reason: Joi.string().optional(),
        description: Joi.string().optional(),
        totalAmountHT: Joi.number().positive().optional(),
        totalAmountTTC: Joi.number().positive().optional(),
        paymentMethod: Joi.string().optional(),
        notes: Joi.string().optional(),
      }),

      // CreditNoteItem schemas
      creditNoteItemCreateSchema: Joi.object({
        creditNoteId: Joi.number().integer().positive().required(),
        productId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
        unitPriceHT: Joi.number().positive().required(),
        unitPriceTTC: Joi.number().positive().required(),
        vatRate: Joi.number().positive().required(),
        totalPriceHT: Joi.number().positive().required(),
        totalPriceTTC: Joi.number().positive().required(),
      }),
      creditNoteItemUpdateSchema: Joi.object({
        productId: Joi.number().integer().positive().optional(),
        quantity: Joi.number().integer().positive().optional(),
        unitPriceHT: Joi.number().positive().optional(),
        unitPriceTTC: Joi.number().positive().optional(),
        vatRate: Joi.number().positive().optional(),
        totalPriceHT: Joi.number().positive().optional(),
        totalPriceTTC: Joi.number().positive().optional(),
      }),

      // OrderAddress schemas
      orderAddressCreateSchema: Joi.object({
        orderId: Joi.number().integer().positive().required(),
        addressType: Joi.string().required(),
        addressSnapshot: Joi.object().required(),
      }),
      orderAddressUpdateSchema: Joi.object({
        addressType: Joi.string().optional(),
        addressSnapshot: Joi.object().optional(),
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

    // ===== ROUTES DES ARTICLES DE COMMANDE =====
    app.post(
      "/api/order-items",
      this.validateRequest(schemas.orderItemCreateSchema),
      (req: Request, res: Response) => {
        this.orderItemController.createOrderItem(req, res);
      }
    );

    app.get("/api/order-items/:id", (req: Request, res: Response) => {
      this.orderItemController.getOrderItemById(req, res);
    });

    app.put(
      "/api/order-items/:id",
      this.validateRequest(schemas.orderItemUpdateSchema),
      (req: Request, res: Response) => {
        this.orderItemController.updateOrderItem(req, res);
      }
    );

    app.delete("/api/order-items/:id", (req: Request, res: Response) => {
      this.orderItemController.deleteOrderItem(req, res);
    });

    app.get("/api/orders/:orderId/items", (req: Request, res: Response) => {
      this.orderItemController.getOrderItemsByOrderId(req, res);
    });

    // ===== ROUTES DES AVOIRS =====
    app.post(
      "/api/credit-notes",
      this.validateRequest(schemas.creditNoteCreateSchema),
      (req: Request, res: Response) => {
        this.creditNoteController.createCreditNote(req, res);
      }
    );

    app.get("/api/credit-notes/:id", (req: Request, res: Response) => {
      this.creditNoteController.getCreditNoteById(req, res);
    });

    app.put(
      "/api/credit-notes/:id",
      this.validateRequest(schemas.creditNoteUpdateSchema),
      (req: Request, res: Response) => {
        this.creditNoteController.updateCreditNote(req, res);
      }
    );

    app.delete("/api/credit-notes/:id", (req: Request, res: Response) => {
      this.creditNoteController.deleteCreditNote(req, res);
    });

    app.get(
      "/api/customers/:customerId/credit-notes",
      (req: Request, res: Response) => {
        this.creditNoteController.getCreditNotesByCustomerId(req, res);
      }
    );

    // ===== ROUTES DES ARTICLES D'AVOIRS =====
    app.post(
      "/api/credit-note-items",
      this.validateRequest(schemas.creditNoteItemCreateSchema),
      (req: Request, res: Response) => {
        this.creditNoteItemController.createCreditNoteItem(req, res);
      }
    );

    app.get("/api/credit-note-items/:id", (req: Request, res: Response) => {
      this.creditNoteItemController.getCreditNoteItemById(req, res);
    });

    app.put(
      "/api/credit-note-items/:id",
      this.validateRequest(schemas.creditNoteItemUpdateSchema),
      (req: Request, res: Response) => {
        this.creditNoteItemController.updateCreditNoteItem(req, res);
      }
    );

    app.delete("/api/credit-note-items/:id", (req: Request, res: Response) => {
      this.creditNoteItemController.deleteCreditNoteItem(req, res);
    });

    app.get(
      "/api/credit-notes/:creditNoteId/items",
      (req: Request, res: Response) => {
        this.creditNoteItemController.getCreditNoteItemsByCreditNoteId(
          req,
          res
        );
      }
    );

    // ===== ROUTES DES ADRESSES DE COMMANDE =====
    app.post(
      "/api/order-addresses",
      this.validateRequest(schemas.orderAddressCreateSchema),
      (req: Request, res: Response) => {
        this.orderAddressController.createOrderAddress(req, res);
      }
    );

    app.get("/api/order-addresses/:id", (req: Request, res: Response) => {
      this.orderAddressController.getOrderAddressById(req, res);
    });

    app.put(
      "/api/order-addresses/:id",
      this.validateRequest(schemas.orderAddressUpdateSchema),
      (req: Request, res: Response) => {
        this.orderAddressController.updateOrderAddress(req, res);
      }
    );

    app.delete("/api/order-addresses/:id", (req: Request, res: Response) => {
      this.orderAddressController.deleteOrderAddress(req, res);
    });

    app.get("/api/orders/:orderId/addresses", (req: Request, res: Response) => {
      this.orderAddressController.getOrderAddressesByOrderId(req, res);
    });

    // ===== ROUTES DES STATISTIQUES =====
    app.get("/api/statistics/orders", (req: Request, res: Response) => {
      this.orderStatisticsController.getOrderStatistics(req, res);
    });

    app.get(
      "/api/customers/:customerId/statistics/orders",
      (req: Request, res: Response) => {
        this.orderStatisticsController.getOrderStatisticsByCustomer(req, res);
      }
    );

    app.get(
      "/api/statistics/orders/date-range/:startDate/:endDate",
      (req: Request, res: Response) => {
        this.orderStatisticsController.getOrderStatisticsByDateRange(req, res);
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
