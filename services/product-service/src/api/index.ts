/**
 * Routeur API
 * Configuration centralisée des routes pour le service produit
 *
 * Architecture : Pattern Routeur
 * - Gestion centralisée des routes
 * - Intégration des middlewares
 * - Validation des requêtes
 */

import express, { Request, Response, NextFunction, Application } from "express";
import { Pool } from "pg";
import ProductService from "../services/ProductService";
import {
  HealthController,
  ProductController,
  CategoryController,
  ProductImageController,
} from "./controller";
import { ResponseMapper, ProductMapper } from "./mapper";
import { ProductImageData } from "../models/ProductImage";
import cors from "cors";
import helmet from "helmet";
import Joi from "joi";
import morgan from "morgan";
// multer n'est plus utilisé - les uploads utilisent maintenant base64 via DTOs
const path = require("path");
const fs = require("fs");

export class ApiRouter {
  private healthController: HealthController;
  private productController: ProductController;
  private categoryController: CategoryController;
  private productImageController: ProductImageController;
  private productService: ProductService;

  constructor(pool: Pool) {
    this.productService = new ProductService(pool);
    this.healthController = new HealthController(pool);
    this.productController = new ProductController(this.productService);
    this.categoryController = new CategoryController(this.productService);
    this.productImageController = new ProductImageController(
      this.productService
    );
  }

  /**
   * Configuration des middlewares
   */
  private setupMiddlewares(app: Application): void {
    app.use(helmet());
    app.use(cors());
    app.use(morgan("combined"));
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ extended: true, limit: "50mb" }));

    // Servir les fichiers statiques (images de produits)
    app.use("/uploads", express.static("uploads"));
    app.use("/uploads/products", express.static("uploads/products"));
  }

  /**
   * Configuration des schémas de validation
   */
  private setupValidationSchemas() {
    return {
      // Schémas de produit
      productCreateSchema: Joi.object({
        name: Joi.string().max(255).required(),
        description: Joi.string().optional(),
        price: Joi.number().positive().precision(2).required(),
        vatRate: Joi.number().min(0).max(100).precision(2).required(),
        categoryId: Joi.number().integer().positive().required(),
        isActive: Joi.boolean().optional(),
        stock: Joi.number().integer().min(0).optional(),
      }),
      productUpdateSchema: Joi.object({
        name: Joi.string().max(255).optional(),
        description: Joi.string().optional(),
        price: Joi.number().positive().precision(2).optional(),
        vatRate: Joi.number().min(0).max(100).precision(2).optional(),
        categoryId: Joi.number().integer().positive().optional(),
        isActive: Joi.boolean().optional(),
        stock: Joi.number().integer().min(0).optional(),
      }),

      // Schémas de catégorie
      categoryCreateSchema: Joi.object({
        name: Joi.string().max(100).required(),
        description: Joi.string().optional(),
      }),
      categoryUpdateSchema: Joi.object({
        name: Joi.string().max(100).optional(),
        description: Joi.string().optional(),
      }),
    };
  }

  // setupFileUpload supprimée - les uploads utilisent maintenant base64 via DTOs

  /**
   * Middleware de validation
   */
  private validateRequest = (schema: any) => {
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
  setupRoutes(app: Application): void {
    this.setupMiddlewares(app);
    const schemas = this.setupValidationSchemas();
    // upload n'est plus utilisé - les uploads utilisent maintenant base64 via DTOs

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

    // Servir une image de produit (public)
    app.get("/api/images/:imageId", (req: Request, res: Response) => {
      this.productImageController.serveProductImageFile(req, res);
    });

    // ===== ROUTES D'ADMINISTRATION =====
    // Ces routes nécessitent une authentification admin
    // Elles permettent la gestion complète des produits, catégories et images
    // === GESTION DES PRODUITS (ADMIN) ===
    // Valider les données produit (publique, sans authentification)
    // Note: Pas de middleware Joi ici car on veut retourner toutes les erreurs structurées par champ
    app.post("/api/products/validate", (req: Request, res: Response) => {
      this.productController.validateProductData(req, res);
    });

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

    // Créer un produit (admin) - Endpoint JSON
    app.post(
      "/api/admin/products",
      this.requireAuth,
      this.validateRequest(schemas.productCreateSchema),
      (req: Request, res: Response) => {
        this.productController.createProduct(req, res);
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

    // Routes admin pour les statistiques
    app.get(
      "/api/admin/statistics/dashboard",
      this.requireAuth,
      (req: Request, res: Response) => {
        this.productController.getDashboardStatistics(req, res);
      }
    );

    // === GESTION DES CATÉGORIES (ADMIN) ===
    // Valider les données catégorie (publique, sans authentification)
    // Note: Pas de middleware Joi ici car on veut retourner toutes les erreurs structurées par champ
    app.post("/api/categories/validate", (req: Request, res: Response) => {
      this.categoryController.validateCategoryData(req, res);
    });

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
    // IMPORTANT: La route /upload doit être définie AVANT /images pour qu'Express la matche correctement
    // Ajouter des images à un produit existant via DTO (admin) - Nouvelle route avec base64
    app.post(
      "/api/admin/products/:id/images/upload",
      this.requireAuth,
      express.json({ limit: "50mb" }), // Limite augmentée pour les images base64
      async (req: Request, res: Response) => {
        try {
          const productId = parseInt(req.params.id);
          if (isNaN(productId)) {
            res
              .status(400)
              .json(ResponseMapper.validationError("Invalid product ID"));
            return;
          }

          // Vérifier que le produit existe
          const product = await this.productService.getProductById(productId);
          if (!product) {
            res.status(404).json(ResponseMapper.notFoundError("Product"));
            return;
          }

          // Valider le body (peut être un tableau ou un seul objet)
          const uploadDTOs = Array.isArray(req.body) ? req.body : [req.body];

          if (uploadDTOs.length === 0) {
            res
              .status(400)
              .json(ResponseMapper.validationError("No images provided"));
            return;
          }

          // Récupérer le nombre d'images existantes
          const existingImages = await this.productService.listImages(
            productId
          );

          // Limiter à 5 images total
          if (existingImages.length + uploadDTOs.length > 5) {
            res
              .status(400)
              .json(
                ResponseMapper.validationError(
                  `Cannot add ${uploadDTOs.length} images. Product already has ${existingImages.length} image(s). Maximum is 5.`
                )
              );
            return;
          }

          // Créer le dossier uploads s'il n'existe pas
          const uploadsDir = path.join(process.cwd(), "uploads", "products");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          // Traiter chaque image
          const images = [];
          for (let i = 0; i < uploadDTOs.length; i++) {
            const uploadDTO = uploadDTOs[i];

            // Valider les champs requis
            if (
              !uploadDTO.filename ||
              !uploadDTO.base64Data ||
              !uploadDTO.mimeType
            ) {
              res
                .status(400)
                .json(
                  ResponseMapper.validationError(
                    `Image ${
                      i + 1
                    }: filename, base64Data, and mimeType are required`
                  )
                );
              return;
            }

            // Décoder le base64
            let imageBuffer: Buffer;
            try {
              // Supprimer le préfixe data:image/...;base64, s'il existe
              const base64Data = uploadDTO.base64Data.replace(
                /^data:image\/[a-z]+;base64,/,
                ""
              );
              imageBuffer = Buffer.from(base64Data, "base64");
            } catch (error) {
              res
                .status(400)
                .json(
                  ResponseMapper.validationError(
                    `Image ${i + 1}: Invalid base64 data`
                  )
                );
              return;
            }

            // Générer un nom de fichier unique
            const ext = path.extname(uploadDTO.filename) || ".jpg";
            const uniqueFilename = `${Date.now()}-${Math.random()
              .toString(36)
              .substring(7)}${ext}`;
            const filePath = path.join(uploadsDir, uniqueFilename);

            // Sauvegarder le fichier
            fs.writeFileSync(filePath, imageBuffer);

            // Créer l'image dans la base de données
            const orderIndex =
              uploadDTO.orderIndex ?? existingImages.length + i;
            const imageData: Partial<ProductImageData> = {
              product_id: productId,
              filename: uploadDTO.filename,
              file_path: `uploads/products/${uniqueFilename}`,
              order_index: orderIndex,
            };

            const image = await this.productService.createImage(imageData);
            images.push(ProductMapper.productImageToPublicDTO(image));
          }

          res.status(201).json({
            success: true,
            message: `${images.length} image(s) ajoutée(s) avec succès`,
            images: images,
          });
        } catch (error: any) {
          console.error("Upload product images error:", error);
          res.status(500).json(ResponseMapper.internalServerError());
        }
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

    // (Routes admin /api/admin/images/:imageId supprimées)

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
