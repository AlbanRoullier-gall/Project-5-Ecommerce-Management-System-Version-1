/**
 * API Router
 * Centralized route configuration for product-service
 *
 * Architecture : Router pattern
 * - Centralized route management
 * - Middleware integration
 * - Request validation
 */

import express, { Request, Response, NextFunction } from "express";
import { Pool } from "pg";
import cors from "cors";
import helmet from "helmet";
import Joi from "joi";
import morgan from "morgan";
import multer from "multer";
import path from "path";
import fs from "fs";
import ProductService from "../services/ProductService";
import {
  HealthController,
  ProductController,
  CategoryController,
  ProductImageController,
} from "./controller";
import { ResponseMapper } from "./mapper";

export class ApiRouter {
  private healthController: HealthController;
  private productController: ProductController;
  private categoryController: CategoryController;
  private productImageController: ProductImageController;

  constructor(pool: Pool) {
    const productService = new ProductService(pool);
    this.healthController = new HealthController(pool);
    this.productController = new ProductController(productService);
    this.categoryController = new CategoryController(productService);
    this.productImageController = new ProductImageController(productService);
  }

  /**
   * Setup middlewares
   */
  private setupMiddlewares(app: express.Application): void {
    app.use(helmet());
    app.use(cors());
    app.use(morgan("combined"));
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ extended: true, limit: "50mb" }));

    // Serve static files (product images)
    app.use("/uploads", express.static("uploads"));
    app.use("/uploads/products", express.static("uploads/products"));
  }

  /**
   * Setup validation schemas
   */
  private setupValidationSchemas() {
    return {
      // Product schemas
      productCreateSchema: Joi.object({
        name: Joi.string().max(255).required(),
        description: Joi.string().optional(),
        price: Joi.number().positive().precision(2).required(),
        vatRate: Joi.number().min(0).max(100).precision(2).required(),
        categoryId: Joi.number().integer().positive().required(),
        isActive: Joi.boolean().optional(),
      }),
      productUpdateSchema: Joi.object({
        name: Joi.string().max(255).optional(),
        description: Joi.string().optional(),
        price: Joi.number().positive().precision(2).optional(),
        vatRate: Joi.number().min(0).max(100).precision(2).optional(),
        categoryId: Joi.number().integer().positive().optional(),
        isActive: Joi.boolean().optional(),
      }),

      // Category schemas
      categoryCreateSchema: Joi.object({
        name: Joi.string().max(100).required(),
        description: Joi.string().optional(),
      }),
      categoryUpdateSchema: Joi.object({
        name: Joi.string().max(100).optional(),
        description: Joi.string().optional(),
      }),

      // ProductImage schemas
      productImageCreateSchema: Joi.object({
        productId: Joi.number().integer().positive().required(),
        filename: Joi.string().max(255).required(),
        filePath: Joi.string().max(500).required(),
        orderIndex: Joi.number().integer().min(0).optional(),
      }),
      productImageUpdateSchema: Joi.object({
        filename: Joi.string().max(255).optional(),
        filePath: Joi.string().max(500).optional(),
        orderIndex: Joi.number().integer().min(0).optional(),
      }),
    };
  }

  /**
   * Setup file upload configuration
   */
  private setupFileUpload() {
    // Create uploads directory if it doesn't exist
    const uploadDir = "uploads/products";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
      destination: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
      ) => {
        cb(null, uploadDir);
      },
      filename: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void
      ) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
          null,
          file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
        );
      },
    });

    return multer({
      storage: storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (
        req: Request,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback
      ) => {
        if (file.mimetype.startsWith("image/")) {
          cb(null, true);
        } else {
          cb(new Error("Only image files are allowed"));
        }
      },
    });
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
   * Middleware pour vérifier l'authentification admin
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
   * Configuration des routes
   */
  setupRoutes(app: express.Application): void {
    this.setupMiddlewares(app);
    const schemas = this.setupValidationSchemas();
    const upload = this.setupFileUpload();

    // ===== ROUTES DE SANTÉ =====
    app.get("/api/health", (req: Request, res: Response) => {
      this.healthController.healthCheck(req, res);
    });

    app.get("/api/health/detailed", (req: Request, res: Response) => {
      this.healthController.detailedHealthCheck(req, res);
    });

    // ===== ROUTES PUBLIQUES =====
    // Ces routes sont accessibles sans authentification
    // Elles permettent la consultation des données pour le frontend public

    // Lister tous les produits (public)
    app.get("/api/products", (req: Request, res: Response) => {
      this.productController.listProducts(req, res);
    });

    // Récupérer un produit spécifique (public)
    app.get("/api/products/:id", (req: Request, res: Response) => {
      this.productController.getProductById(req, res);
    });

    // Lister toutes les catégories (public)
    app.get("/api/categories", (req: Request, res: Response) => {
      this.categoryController.listCategories(req, res);
    });

    // ===== ROUTES D'ADMINISTRATION =====
    // Ces routes nécessitent une authentification admin
    // Elles permettent la gestion complète des produits, catégories et images
    // === GESTION DES PRODUITS (ADMIN) ===
    // Créer un nouveau produit (admin)
    app.post(
      "/api/admin/products",
      this.requireAuth,
      this.validateRequest(schemas.productCreateSchema),
      (req: Request, res: Response) => {
        this.productController.createProduct(req, res);
      }
    );

    // Lister tous les produits (admin)
    app.get(
      "/api/admin/products",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.productController.listProducts(req, res);
      }
    );

    // Récupérer un produit spécifique (admin)
    app.get(
      "/api/admin/products/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.productController.getProductById(req, res);
      }
    );

    // Modifier un produit (admin)
    app.put(
      "/api/admin/products/:id",
      this.requireAuth,
      this.validateRequest(schemas.productUpdateSchema),
      (req: Request, res: Response) => {
        this.productController.updateProduct(req, res);
      }
    );

    // Supprimer un produit (admin)
    app.delete(
      "/api/admin/products/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.productController.deleteProduct(req, res);
      }
    );

    // Activer/désactiver un produit (admin)
    app.patch(
      "/api/admin/products/:id/toggle",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.productController.toggleProductStatus(req, res);
      }
    );

    // Activer un produit (admin)
    app.post(
      "/api/admin/products/:id/activate",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.productController.activateProduct(req, res);
      }
    );

    // Désactiver un produit (admin)
    app.post(
      "/api/admin/products/:id/deactivate",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.productController.deactivateProduct(req, res);
      }
    );

    // Créer un produit avec images (admin)
    app.post(
      "/api/admin/products/with-images",
      this.requireAuth,
      upload.array("images", 10),
      (req: Request, res: Response) => {
        // This would need special handling for file uploads
        res.status(501).json(ResponseMapper.internalServerError());
      }
    );

    // === GESTION DES CATÉGORIES (ADMIN) ===
    // Créer une nouvelle catégorie (admin)
    app.post(
      "/api/admin/categories",
      this.requireAuth,
      this.validateRequest(schemas.categoryCreateSchema),
      (req: Request, res: Response) => {
        this.categoryController.createCategory(req, res);
      }
    );

    // Lister toutes les catégories (admin)
    app.get(
      "/api/admin/categories",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.categoryController.listCategories(req, res);
      }
    );

    // Récupérer une catégorie spécifique (admin)
    app.get(
      "/api/admin/categories/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.categoryController.getCategoryById(req, res);
      }
    );

    // Modifier une catégorie (admin)
    app.put(
      "/api/admin/categories/:id",
      this.requireAuth,
      this.validateRequest(schemas.categoryUpdateSchema),
      (req: Request, res: Response) => {
        this.categoryController.updateCategory(req, res);
      }
    );

    // Supprimer une catégorie (admin)
    app.delete(
      "/api/admin/categories/:id",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.categoryController.deleteCategory(req, res);
      }
    );

    // === GESTION DES IMAGES DE PRODUITS (ADMIN) ===
    // Ajouter une image à un produit (admin)
    app.post(
      "/api/admin/products/:id/images",
      this.requireAuth,
      upload.single("image"),
      (req: Request, res: Response) => {
        // This would need special handling for file uploads
        res.status(501).json(ResponseMapper.internalServerError());
      }
    );

    // Lister les images d'un produit (admin)
    app.get(
      "/api/admin/products/:id/images",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.productImageController.listProductImages(req, res);
      }
    );

    // Récupérer une image spécifique (admin)
    app.get(
      "/api/admin/images/:imageId",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.productImageController.getProductImageById(req, res);
      }
    );

    // Modifier une image (admin)
    app.put(
      "/api/admin/images/:imageId",
      this.requireAuth,
      this.validateRequest(schemas.productImageUpdateSchema),
      (req: Request, res: Response) => {
        this.productImageController.updateProductImage(req, res);
      }
    );

    // Supprimer une image d'un produit (admin)
    app.delete(
      "/api/admin/products/:id/images/:imageId",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.productImageController.deleteProductImage(req, res);
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
