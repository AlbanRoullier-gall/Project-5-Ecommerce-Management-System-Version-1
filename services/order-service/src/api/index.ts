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
   * Middleware d'authentification pour les routes admin
   * Vérifie les headers transmis par l'API-Gateway
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
   * Setup validation schemas
   */
  private setupValidationSchemas() {
    return {
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

      // CreditNoteItem schemas
      creditNoteItemCreateSchema: Joi.object({
        creditNoteId: Joi.number().integer().positive().required(),
        productId: Joi.number().integer().positive().required(),
        productName: Joi.string().required(),
        quantity: Joi.number().integer().positive().required(),
        unitPriceHT: Joi.number().positive().required(),
        unitPriceTTC: Joi.number().positive().required(),
        vatRate: Joi.number().positive().required(),
        totalPriceHT: Joi.number().positive().required(),
        totalPriceTTC: Joi.number().positive().required(),
      }),

      // Order from checkout schema
      orderFromCartSchema: Joi.object({
        cart: Joi.object({
          id: Joi.string().required(),
          sessionId: Joi.string().required(),
          items: Joi.array()
            .items(
              Joi.object({
                id: Joi.string().required(),
                productId: Joi.number().required(),
                productName: Joi.string().required(),
                description: Joi.any().optional(),
                imageUrl: Joi.any().optional(),
                quantity: Joi.number().positive().required(),
                unitPriceHT: Joi.number().required(),
                unitPriceTTC: Joi.number().required(),
                vatRate: Joi.number().required(),
                totalPriceHT: Joi.number().required(),
                totalPriceTTC: Joi.number().required(),
                addedAt: Joi.any().optional(),
              }).unknown(true)
            )
            .min(1)
            .required(),
          subtotal: Joi.number().required(),
          tax: Joi.number().required(),
          total: Joi.number().required(),
          createdAt: Joi.any().optional(),
          updatedAt: Joi.any().optional(),
          expiresAt: Joi.any().optional(),
        })
          .unknown(true)
          .required(),
        customerId: Joi.number().optional(),
        customerSnapshot: Joi.object().unknown(true).optional(),
        customerData: Joi.object({
          email: Joi.string().email().required(),
          firstName: Joi.string().optional(),
          lastName: Joi.string().optional(),
          phoneNumber: Joi.string().optional(),
        })
          .unknown(true)
          .required(),
        addressData: Joi.object({
          shipping: Joi.object({
            address: Joi.string().optional(),
            postalCode: Joi.string().optional(),
            city: Joi.string().optional(),
            countryName: Joi.string().optional(),
            addressType: Joi.any().optional(),
            firstName: Joi.string().optional(),
            lastName: Joi.string().optional(),
          })
            .unknown(true)
            .optional(),
          billing: Joi.object({
            address: Joi.string().optional(),
            postalCode: Joi.string().optional(),
            city: Joi.string().optional(),
            countryName: Joi.string().optional(),
            addressType: Joi.any().optional(),
            firstName: Joi.string().optional(),
            lastName: Joi.string().optional(),
          })
            .unknown(true)
            .optional(),
          useSameBillingAddress: Joi.boolean().required(),
        })
          .unknown(true)
          .required(),
        paymentIntentId: Joi.string().optional(),
        paymentMethod: Joi.string().required(),
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

    // ===== ROUTES PUBLIQUES (SANS AUTHENTIFICATION) =====

    // Routes publiques pour les commandes
    // Créer une commande depuis un panier
    app.post(
      "/api/orders/create-from-cart",
      this.validateRequest(schemas.orderFromCartSchema),
      (req: Request, res: Response) => {
        this.orderController.createOrderFromCart(req, res);
      }
    );

    app.get("/api/orders/:id", (req: Request, res: Response) => {
      this.orderController.getOrderById(req, res);
    });

    app.get("/api/orders", (req: Request, res: Response) => {
      this.orderController.listOrders(req, res);
    });

    // Routes publiques pour les articles de commande
    app.get("/api/orders/:orderId/items", (req: Request, res: Response) => {
      this.orderItemController.getOrderItemsByOrderId(req, res);
    });

    // Routes publiques pour les adresses de commande
    app.get("/api/orders/:orderId/addresses", (req: Request, res: Response) => {
      this.orderAddressController.getOrderAddressesByOrderId(req, res);
    });

    // Routes publiques pour les avoirs
    app.get(
      "/api/customers/:customerId/credit-notes",
      (req: Request, res: Response) => {
        this.creditNoteController.getCreditNotesByCustomerId(req, res);
      }
    );

    // Routes publiques pour les statistiques
    app.get("/api/statistics/orders", (req: Request, res: Response) => {
      this.orderStatisticsController.getOrderStatistics(req, res);
    });

    // ===== ROUTES ADMIN (AVEC AUTHENTIFICATION) =====

    // Routes admin pour les commandes
    app.delete(
      "/api/admin/orders/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.orderController.deleteOrder(req, res);
      }
    );

    app.get(
      "/api/admin/orders",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.orderController.listOrders(req, res);
      }
    );

    // Routes admin pour récupérer les items et adresses d'une commande
    // IMPORTANT: Ces routes doivent être AVANT /api/admin/orders/:id pour éviter les conflits
    // Express matche les routes dans l'ordre, donc les routes spécifiques doivent être en premier
    app.get(
      "/api/admin/orders/:orderId/items",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.orderItemController.getOrderItemsByOrderId(req, res);
      }
    );

    app.get(
      "/api/admin/orders/:orderId/addresses",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.orderAddressController.getOrderAddressesByOrderId(req, res);
      }
    );

    app.get(
      "/api/admin/orders/year/:year/export-data",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.orderController.getYearExportData(req, res);
      }
    );

    app.get(
      "/api/admin/orders/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.orderController.getOrderById(req, res);
      }
    );

    app.patch(
      "/api/admin/orders/:id/delivery-status",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.orderController.updateDeliveryStatus(req, res);
      }
    );

    // Routes admin pour les articles de commande
    app.get(
      "/api/admin/order-items/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.orderItemController.getOrderItemById(req, res);
      }
    );

    app.delete(
      "/api/admin/order-items/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.orderItemController.deleteOrderItem(req, res);
      }
    );

    // Routes admin pour les avoirs
    app.post(
      "/api/admin/credit-notes",
      this.requireAuth,
      this.validateRequest(schemas.creditNoteCreateSchema),
      (req: Request, res: Response) => {
        this.creditNoteController.createCreditNote(req, res);
      }
    );

    app.get(
      "/api/admin/credit-notes",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.creditNoteController.listCreditNotes(req, res);
      }
    );

    app.get(
      "/api/admin/credit-notes/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.creditNoteController.getCreditNoteById(req, res);
      }
    );

    app.delete(
      "/api/admin/credit-notes/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.creditNoteController.deleteCreditNote(req, res);
      }
    );

    app.patch(
      "/api/admin/credit-notes/:id/status",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.orderController.updateCreditNoteStatus(req, res);
      }
    );

    // Routes admin pour les articles d'avoirs
    app.post(
      "/api/admin/credit-note-items",
      this.requireAuth,
      this.validateRequest(schemas.creditNoteItemCreateSchema),
      (req: Request, res: Response) => {
        this.creditNoteItemController.createCreditNoteItem(req, res);
      }
    );

    app.get(
      "/api/admin/credit-note-items/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.creditNoteItemController.getCreditNoteItemById(req, res);
      }
    );

    app.delete(
      "/api/admin/credit-note-items/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.creditNoteItemController.deleteCreditNoteItem(req, res);
      }
    );

    app.get(
      "/api/admin/credit-notes/:creditNoteId/items",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.creditNoteItemController.getCreditNoteItemsByCreditNoteId(
          req,
          res
        );
      }
    );

    // Routes admin pour les adresses de commande
    app.get(
      "/api/admin/order-addresses/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.orderAddressController.getOrderAddressById(req, res);
      }
    );

    app.delete(
      "/api/admin/order-addresses/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.orderAddressController.deleteOrderAddress(req, res);
      }
    );

    // Routes admin pour les statistiques
    app.get(
      "/api/admin/statistics/orders",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.orderStatisticsController.getOrderStatistics(req, res);
      }
    );

    app.get(
      "/api/admin/statistics/dashboard",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.orderStatisticsController.getDashboardStatistics(req, res);
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
