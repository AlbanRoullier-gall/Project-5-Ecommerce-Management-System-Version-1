/**
 * Routeur API - Version simplifiée pour Panier Redis
 * Configuration centralisée des routes pour cart-service
 */

import { Request, Response, NextFunction } from "express";
import CartService from "../services/CartService";
import { HealthController, CartController } from "./controller";
import { ResponseMapper } from "./mapper";
import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import helmet from "helmet";
import Joi from "joi";
import morgan from "morgan";

export class ApiRouter {
  private healthController: HealthController;
  private cartController: CartController;

  constructor() {
    const cartService = new CartService();
    this.healthController = new HealthController();
    this.cartController = new CartController(cartService);
  }

  /**
   * Configuration des middlewares
   */
  private setupMiddlewares(app: Application): void {
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
      // Schéma de création d'article de panier
      // Harmonisé avec OrderItemCreateDTO - productName est requis
      cartItemCreateSchema: Joi.object({
        productId: Joi.number().positive().required(),
        productName: Joi.string().min(1).required(), // Requis et non vide
        description: Joi.string().allow(null, "").optional(),
        imageUrl: Joi.string().allow(null, "").optional(),
        quantity: Joi.number().positive().required(),
        unitPriceTTC: Joi.number().positive().required(),
        vatRate: Joi.number().min(0).max(100).required(),
      }),

      // Schéma de mise à jour d'article de panier
      cartItemUpdateSchema: Joi.object({
        quantity: Joi.number().positive().required(),
      }),

      // Schéma de vidage de panier
      cartClearSchema: Joi.object({
        sessionId: Joi.string().required(),
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
              error.details[0]?.message || "Erreur de validation"
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

    // ===== ROUTES DE PANIER =====
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
    app.delete(
      "/api/cart",
      this.validateRequest(schemas.cartClearSchema),
      (req: Request, res: Response) => {
        this.cartController.clearCart(req, res);
      }
    );

    // ===== ROUTES CHECKOUT DATA =====
    // Mettre à jour les données checkout
    app.post("/api/cart/checkout-data", (req: Request, res: Response) => {
      this.cartController.updateCheckoutData(req, res);
    });

    // Récupérer les données checkout
    app.get("/api/cart/checkout-data", (req: Request, res: Response) => {
      this.cartController.getCheckoutData(req, res);
    });

    // Supprimer les données checkout
    app.delete("/api/cart/checkout-data", (req: Request, res: Response) => {
      this.cartController.clearCheckoutData(req, res);
    });

    // ===== GESTION DES ERREURS =====
    app.use((req: Request, res: Response) => {
      res.status(404).json(ResponseMapper.notFoundError("Route"));
    });

    app.use((error: any, req: Request, res: Response, next: NextFunction) => {
      console.error("Erreur non gérée:", error);
      res.status(500).json(ResponseMapper.internalServerError());
    });
  }
}
