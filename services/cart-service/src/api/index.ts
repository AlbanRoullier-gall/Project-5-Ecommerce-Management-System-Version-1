/**
 * API Router - Version simplifiée pour Redis Cart
 * Configuration centralisée des routes pour cart-service
 */

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import Joi from "joi";
import morgan from "morgan";
import CartService from "../services/CartService";
import { HealthController, CartController } from "./controller";
import { ResponseMapper } from "./mapper";

export class ApiRouter {
  private healthController: HealthController;
  private cartController: CartController;

  constructor() {
    const cartService = new CartService();
    this.healthController = new HealthController();
    this.cartController = new CartController(cartService);
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
      // Cart create schema
      cartCreateSchema: Joi.object({
        sessionId: Joi.string().required(),
      }),

      // Cart item create schema
      cartItemCreateSchema: Joi.object({
        productId: Joi.number().positive().required(),
        quantity: Joi.number().positive().required(),
        price: Joi.number().positive().required(),
        vatRate: Joi.number().min(0).max(100).required(),
      }),

      // Cart item update schema
      cartItemUpdateSchema: Joi.object({
        quantity: Joi.number().positive().required(),
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

    // ===== ROUTES DE PANIER =====
    // Créer un panier
    app.post(
      "/api/cart",
      this.validateRequest(schemas.cartCreateSchema),
      (req: Request, res: Response) => {
        this.cartController.createCart(req, res);
      }
    );

    // Récupérer un panier
    app.get("/api/cart", (req: Request, res: Response) => {
      this.cartController.getCart(req, res);
    });

    // Ajouter un article au panier
    app.post(
      "/api/cart/items",
      this.validateRequest(schemas.cartItemCreateSchema),
      (req: Request, res: Response) => {
        this.cartController.addItem(req, res);
      }
    );

    // Mettre à jour la quantité d'un article
    app.put(
      "/api/cart/items/:productId",
      this.validateRequest(schemas.cartItemUpdateSchema),
      (req: Request, res: Response) => {
        this.cartController.updateItemQuantity(req, res);
      }
    );

    // Supprimer un article du panier
    app.delete("/api/cart/items/:productId", (req: Request, res: Response) => {
      this.cartController.removeItem(req, res);
    });

    // Vider le panier
    app.delete("/api/cart", (req: Request, res: Response) => {
      this.cartController.clearCart(req, res);
    });

    // Valider un panier
    app.get("/api/cart/validate", (req: Request, res: Response) => {
      this.cartController.validateCart(req, res);
    });

    // Statistiques des paniers
    app.get("/api/cart/stats", (req: Request, res: Response) => {
      this.cartController.getCartStats(req, res);
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
