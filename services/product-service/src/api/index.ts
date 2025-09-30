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
        filename: Joi.string().required(),
        filePath: Joi.string().required(),
        fileSize: Joi.number().positive().required(),
        mimeType: Joi.string().required(),
        width: Joi.number().min(0).optional(),
        height: Joi.number().min(0).optional(),
        altText: Joi.string().optional(),
        description: Joi.string().optional(),
        orderIndex: Joi.number().integer().min(0).optional(),
      }),
      productImageUpdateSchema: Joi.object({
        filename: Joi.string().optional(),
        filePath: Joi.string().optional(),
        fileSize: Joi.number().positive().optional(),
        mimeType: Joi.string().optional(),
        width: Joi.number().min(0).optional(),
        height: Joi.number().min(0).optional(),
        altText: Joi.string().optional(),
        description: Joi.string().optional(),
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
    // List products (public)
    app.get("/api/products", (req: Request, res: Response) => {
      this.productController.listProducts(req, res);
    });

    // Get product by ID (public)
    app.get("/api/products/:id", (req: Request, res: Response) => {
      this.productController.getProductById(req, res);
    });

    // List categories (public)
    app.get("/api/categories", (req: Request, res: Response) => {
      this.categoryController.listCategories(req, res);
    });

    // ===== ROUTES D'ADMINISTRATION =====
    // Product management
    app.post(
      "/api/admin/products",
      this.validateRequest(schemas.productCreateSchema),
      (req: Request, res: Response) => {
        this.productController.createProduct(req, res);
      }
    );

    app.get("/api/admin/products", (req: Request, res: Response) => {
      this.productController.listProducts(req, res);
    });

    app.get("/api/admin/products/:id", (req: Request, res: Response) => {
      this.productController.getProductById(req, res);
    });

    app.put(
      "/api/admin/products/:id",
      this.validateRequest(schemas.productUpdateSchema),
      (req: Request, res: Response) => {
        this.productController.updateProduct(req, res);
      }
    );

    app.delete("/api/admin/products/:id", (req: Request, res: Response) => {
      this.productController.deleteProduct(req, res);
    });

    app.patch(
      "/api/admin/products/:id/toggle",
      (req: Request, res: Response) => {
        this.productController.toggleProductStatus(req, res);
      }
    );

    app.post(
      "/api/admin/products/:id/activate",
      (req: Request, res: Response) => {
        this.productController.activateProduct(req, res);
      }
    );

    app.post(
      "/api/admin/products/:id/deactivate",
      (req: Request, res: Response) => {
        this.productController.deactivateProduct(req, res);
      }
    );

    // Product with images
    app.post(
      "/api/admin/products/with-images",
      upload.array("images", 10),
      (req: Request, res: Response) => {
        // This would need special handling for file uploads
        res.status(501).json(ResponseMapper.internalServerError());
      }
    );

    // Category management
    app.post(
      "/api/admin/categories",
      this.validateRequest(schemas.categoryCreateSchema),
      (req: Request, res: Response) => {
        this.categoryController.createCategory(req, res);
      }
    );

    app.get("/api/admin/categories", (req: Request, res: Response) => {
      this.categoryController.listCategories(req, res);
    });

    app.get("/api/admin/categories/:id", (req: Request, res: Response) => {
      this.categoryController.getCategoryById(req, res);
    });

    app.put(
      "/api/admin/categories/:id",
      this.validateRequest(schemas.categoryUpdateSchema),
      (req: Request, res: Response) => {
        this.categoryController.updateCategory(req, res);
      }
    );

    app.delete("/api/admin/categories/:id", (req: Request, res: Response) => {
      this.categoryController.deleteCategory(req, res);
    });

    // Product image management
    app.post(
      "/api/admin/products/:id/images",
      upload.single("image"),
      (req: Request, res: Response) => {
        // This would need special handling for file uploads
        res.status(501).json(ResponseMapper.internalServerError());
      }
    );

    app.get("/api/admin/products/:id/images", (req: Request, res: Response) => {
      this.productImageController.listProductImages(req, res);
    });

    app.get("/api/admin/images/:imageId", (req: Request, res: Response) => {
      this.productImageController.getProductImageById(req, res);
    });

    app.put(
      "/api/admin/images/:imageId",
      this.validateRequest(schemas.productImageUpdateSchema),
      (req: Request, res: Response) => {
        this.productImageController.updateProductImage(req, res);
      }
    );

    app.delete(
      "/api/admin/products/:id/images/:imageId",
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
