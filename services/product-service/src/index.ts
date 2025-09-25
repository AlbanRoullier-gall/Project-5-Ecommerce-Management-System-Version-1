/**
 * Service Produit - Gestion des produits et catégories
 *
 * Ce service gère :
 * - La gestion des produits (CRUD)
 * - La gestion des catégories (CRUD)
 * - L'upload et traitement des images
 * - La recherche et filtrage des produits
 * - L'administration des produits (admin uniquement)
 */

// ===== IMPORTS ET CONFIGURATION =====
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import Joi from "joi";
import morgan from "morgan";
import multer from "multer";
import path from "path";
import fs from "fs";
import ProductService from "./services/ProductService";
import { AuthenticatedRequest, ProductListOptions } from "./types";
import dotenv from "dotenv";

dotenv.config();

// Configuration du serveur Express
const app = express();
const PORT = process.env.PORT || 3002;

/**
 * Configuration de la connexion à la base de données PostgreSQL
 * SSL activé en production pour la sécurité
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Initialisation du service produit
const productService = new ProductService(pool);

// ===== MIDDLEWARES =====
/**
 * Configuration des middlewares de sécurité et de logging
 */
app.use(helmet()); // Sécurité HTTP

/**
 * Configuration CORS pour permettre l'accès depuis les frontends
 * Inclut les ports de développement et de production
 */
app.use(
  cors({
    origin: [
      "http://localhost:13008",
      "http://localhost:13009",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Configuration des limites de taille pour les uploads d'images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("combined")); // Logging des requêtes

/**
 * Servir les fichiers statiques (images de produits)
 * Permet l'accès direct aux images via l'URL /uploads/
 */
app.use("/uploads", express.static("uploads"));

/**
 * Route spécifique pour servir les images de produits
 * Permet l'accès aux images via l'URL /uploads/products/
 */
app.use("/uploads/products", express.static("uploads/products"));

/**
 * Configuration du secret JWT pour la signature des tokens
 * Utilise une variable d'environnement ou une valeur par défaut
 */
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// ===== MIDDLEWARES D'AUTHENTIFICATION =====
/**
 * Middleware d'authentification JWT
 * Vérifie la validité du token dans l'en-tête Authorization
 * Ajoute les informations utilisateur à req.user si valide
 */
const authenticateToken = (
  req: any,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && typeof authHeader === "string"
      ? authHeader.split(" ")[1]
      : undefined;

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      res.status(403).json({ error: "Invalid or expired token" });
      return;
    }
    req.user = user as AuthenticatedRequest["user"];
    next();
  });
};

/**
 * Middleware de vérification des droits administrateur
 * Doit être utilisé après authenticateToken
 * Vérifie que l'utilisateur a le rôle "admin"
 */
const authenticateAdmin = (
  req: any,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
};

// ===== CONFIGURATION DES UPLOADS D'IMAGES =====
/**
 * Configuration du stockage disque pour les uploads d'images
 * Crée automatiquement le dossier de destination si nécessaire
 * Génère des noms de fichiers uniques pour éviter les conflits
 */
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadDir = "uploads/products";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
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

/**
 * Configuration Multer pour les uploads directs (stockage disque)
 * Limite la taille à 10MB et filtre les types de fichiers
 */
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
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

/**
 * Configuration Multer pour les uploads via API Gateway (stockage mémoire)
 * Utilisé pour les requêtes proxy depuis l'API Gateway
 * Traite les images en mémoire avant sauvegarde
 */
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
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

// ===== SCHÉMAS DE VALIDATION JOI =====
/**
 * Schéma de validation pour les catégories
 */
const categorySchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().optional(),
});

/**
 * Schéma de validation pour les produits
 */
const productSchema = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().optional(),
  price: Joi.number().positive().precision(2).required(),
  vatRate: Joi.number().min(0).max(100).precision(2).required(),
  categoryId: Joi.number().integer().required(),
  isActive: Joi.boolean().optional(),
});

/**
 * Schéma de validation pour les images de produits
 */
const imageSchema = Joi.object({
  altText: Joi.string().max(255).optional(),
  description: Joi.string().optional(),
  orderIndex: Joi.number().integer().min(0).optional(),
});

// ===== ROUTES =====

/**
 * Route de santé du service
 * Permet de vérifier que le service produit fonctionne correctement
 */
app.get("/health", (req: Request, res: Response): void => {
  res.json({ status: "OK", service: "product-service" });
});

// ===== ROUTES PUBLIQUES =====
/**
 * Route pour lister les produits (publique)
 * Supporte la pagination, le filtrage par catégorie et la recherche
 *
 * @param {number} [req.query.page=1] - Numéro de page
 * @param {number} [req.query.limit=10] - Nombre d'éléments par page
 * @param {number} [req.query.categoryId] - ID de la catégorie pour filtrer
 * @param {string} [req.query.search=""] - Terme de recherche
 * @param {boolean} [req.query.activeOnly=true] - Afficher seulement les produits actifs
 *
 * @returns {Object} Liste paginée des produits
 */
app.get("/api/products", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      categoryId,
      search = "",
      activeOnly = true,
    } = req.query;

    const result = await productService.listProducts({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      categoryId: categoryId ? parseInt(categoryId as string) : undefined,
      search: search as string,
      activeOnly: activeOnly === "true",
    } as ProductListOptions);

    res.json(result);
  } catch (error) {
    console.error("Products list error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Route pour récupérer les détails d'un produit (publique)
 * Inclut les images associées au produit
 *
 * @param {string} req.params.id - ID du produit
 * @returns {Object} Détails du produit avec ses images
 */
app.get(
  "/api/products/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const product = await productService.getProductById(parseInt(id || "0"));

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      // Récupération des images du produit
      const images = await productService.listImages(parseInt(id || "0"));
      product.images = images.map((image) => image.toPublicDTO());

      res.json(product.toPublicDTO());
    } catch (error) {
      console.error("Product details error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour lister toutes les catégories (publique)
 *
 * @returns {Array} Liste des catégories
 */
app.get(
  "/api/categories",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await productService.listCategories();
      res.json(categories.map((category) => category.toPublicDTO()));
    } catch (error) {
      console.error("Categories list error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ===== ROUTES D'ADMINISTRATION =====
/**
 * Route pour lister les produits (admin uniquement)
 * Inclut tous les produits (actifs et inactifs) avec leurs images
 *
 * @param {number} [req.query.page=1] - Numéro de page
 * @param {number} [req.query.limit=10] - Nombre d'éléments par page
 * @param {number} [req.query.categoryId] - ID de la catégorie pour filtrer
 * @param {string} [req.query.search=""] - Terme de recherche
 * @param {boolean} [req.query.activeOnly=false] - Filtrer par statut actif
 *
 * @returns {Object} Liste paginée des produits avec images
 */
app.get(
  "/api/admin/products",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 10,
        categoryId,
        search = "",
        activeOnly = false,
      } = req.query;

      const result = await productService.listProducts({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        search: search as string,
        activeOnly: activeOnly === "true",
      } as ProductListOptions);

      // Ajout des images à chaque produit pour l'interface admin
      console.log(
        `[DEBUG] Admin products list - Found ${
          result.products ? result.products.length : 0
        } products`
      );
      if (result.products) {
        for (let product of result.products) {
          console.log(
            `[DEBUG] Fetching images for product ${product.id} (${product.name})`
          );
          const images = await productService.listImages(product.id!);
          console.log(
            `[DEBUG] Found ${images.length} images for product ${product.id}`
          );
          (product as any).images = images.map((image) => image.toPublicDTO());
        }
      }

      res.json(result);
    } catch (error) {
      console.error("Admin products list error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour récupérer les produits les plus populaires (admin uniquement)
 * Route spéciale qui doit être définie avant /:id pour éviter les conflits
 *
 * @param {number} [req.query.limit=5] - Nombre de produits à retourner
 * @returns {Object} Liste des produits populaires
 */
app.get(
  "/api/admin/products/top",
  authenticateToken,
  authenticateAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 5 } = req.query;
      // Pour l'instant, retourne une réponse simple pour les tests
      res.json({
        products: [
          {
            id: 1,
            name: "Produit Test 1",
            price: 29.99,
            isActive: true,
          },
          {
            id: 2,
            name: "Produit Test 2",
            price: 39.99,
            isActive: true,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching top products:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour basculer le statut d'un produit (admin uniquement)
 * Active/désactive un produit en un seul clic
 *
 * @param {string} req.params.id - ID du produit
 * @returns {Object} Produit mis à jour avec son nouveau statut
 */
app.patch(
  "/api/admin/toggle-product-status/:id",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response): Promise<void> => {
    console.log("Toggle status endpoint called for product ID:", req.params.id);
    try {
      const { id } = req.params;

      const product = await productService.toggleProductStatus(
        parseInt(id || "0")
      );

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.json({
        message: "Product status updated successfully",
        product: product.toPublicDTO(),
      });
    } catch (error) {
      console.error("Product status toggle error:", error);
      if ((error as Error).message === "Product not found") {
        res.status(404).json({ error: (error as Error).message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour récupérer les détails d'un produit (admin uniquement)
 * Inclut les images associées au produit
 *
 * @param {string} req.params.id - ID du produit
 * @returns {Object} Détails du produit avec ses images
 */
app.get(
  "/api/admin/products/:id",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const product = await productService.getProductById(parseInt(id || "0"));

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      // Récupération des images du produit
      const images = await productService.listImages(parseInt(id || "0"));
      product.images = images.map((image) => image.toPublicDTO());

      res.json(product.toPublicDTO());
    } catch (error) {
      console.error("Admin product details error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour créer une nouvelle catégorie (admin uniquement)
 *
 * @param {Object} req.body - Données de la catégorie
 * @param {string} req.body.name - Nom de la catégorie
 * @param {string} [req.body.description] - Description de la catégorie
 * @returns {Object} Catégorie créée
 */
app.post(
  "/api/admin/categories",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { error, value } = categorySchema.validate(req.body);
      if (error) {
        res
          .status(400)
          .json({ error: error.details[0]?.message || "Validation error" });
        return;
      }

      const category = await productService.createCategory(value);

      res.status(201).json({
        message: "Category created successfully",
        category: category.toPublicDTO(),
      });
    } catch (error) {
      console.error("Category creation error:", error);
      if (
        (error as Error).message === "Category with this name already exists"
      ) {
        res.status(409).json({ error: (error as Error).message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour lister toutes les catégories (admin uniquement)
 *
 * @returns {Array} Liste des catégories
 */
app.get(
  "/api/admin/categories",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response): Promise<void> => {
    try {
      const categories = await productService.listCategories();
      res.json(categories.map((category) => category.toPublicDTO()));
    } catch (error) {
      console.error("Admin categories list error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour mettre à jour une catégorie (admin uniquement)
 *
 * @param {string} req.params.id - ID de la catégorie
 * @param {Object} req.body - Nouvelles données de la catégorie
 * @param {string} req.body.name - Nouveau nom de la catégorie
 * @param {string} [req.body.description] - Nouvelle description
 * @returns {Object} Catégorie mise à jour
 */
app.put(
  "/api/admin/categories/:id",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { error, value } = categorySchema.validate(req.body);
      if (error) {
        res
          .status(400)
          .json({ error: error.details[0]?.message || "Validation error" });
        return;
      }

      const category = await productService.updateCategory(
        parseInt(id || "0"),
        value
      );

      res.json({
        message: "Category updated successfully",
        category: category.toPublicDTO(),
      });
    } catch (error) {
      console.error("Category update error:", error);
      if ((error as Error).message === "Category not found") {
        res.status(404).json({ error: (error as Error).message });
        return;
      }
      if ((error as Error).message === "Category name already exists") {
        res.status(409).json({ error: (error as Error).message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour supprimer une catégorie (admin uniquement)
 * Vérifie qu'aucun produit n'est associé à cette catégorie
 *
 * @param {string} req.params.id - ID de la catégorie à supprimer
 * @returns {Object} Message de confirmation de suppression
 */
app.delete(
  "/api/admin/categories/:id",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const success = await productService.deleteCategory(parseInt(id || "0"));

      if (!success) {
        res.status(404).json({ error: "Category not found" });
        return;
      }

      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Category deletion error:", error);
      if ((error as Error).message === "Category not found") {
        res.status(404).json({ error: (error as Error).message });
        return;
      }
      if (
        (error as Error).message ===
        "Cannot delete category with existing products"
      ) {
        res.status(409).json({ error: (error as Error).message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour créer un nouveau produit (admin uniquement)
 *
 * @param {Object} req.body - Données du produit
 * @param {string} req.body.name - Nom du produit
 * @param {string} [req.body.description] - Description du produit
 * @param {number} req.body.price - Prix du produit
 * @param {number} req.body.vatRate - Taux de TVA
 * @param {number} req.body.categoryId - ID de la catégorie
 * @param {boolean} [req.body.isActive] - Statut actif du produit
 * @returns {Object} Produit créé
 */
app.post(
  "/api/admin/products",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { error, value } = productSchema.validate(req.body);
      if (error) {
        res
          .status(400)
          .json({ error: error.details[0]?.message || "Validation error" });
        return;
      }

      const product = await productService.createProduct(value);

      res.status(201).json({
        message: "Product created successfully",
        product: product.toPublicDTO(),
      });
    } catch (error) {
      console.error("Product creation error:", error);
      if (
        (error as Error).message === "Product with this name already exists"
      ) {
        res.status(409).json({ error: (error as Error).message });
        return;
      }
      if ((error as Error).message === "Category not found") {
        res.status(404).json({ error: (error as Error).message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour créer un produit avec des images (admin uniquement)
 *
 * @param {Object} req.body - Données du produit
 * @param {string} req.body.name - Nom du produit
 * @param {string} [req.body.description] - Description du produit
 * @param {number} req.body.price - Prix du produit
 * @param {number} req.body.vatRate - Taux de TVA
 * @param {number} req.body.categoryId - ID de la catégorie
 * @param {boolean} [req.body.isActive] - Statut actif du produit
 * @param {File[]} req.files - Images du produit
 * @returns {Object} Produit créé avec ses images
 */
app.post(
  "/api/admin/products/with-images",
  authenticateToken,
  authenticateAdmin,
  upload.array("images", 10), // Maximum 10 images
  async (req: any, res: Response): Promise<void> => {
    try {
      console.log("Creating product with images...");
      console.log("Product data:", req.body);
      console.log("Files:", req.files);

      // Validation des données du produit
      const { error, value } = productSchema.validate(req.body);
      if (error) {
        res
          .status(400)
          .json({ error: error.details[0]?.message || "Validation error" });
        return;
      }

      // Créer le produit
      const product = await productService.createProduct(value);
      console.log("Product created:", product.id);

      // Traiter les images si elles existent
      if (req.files && req.files.length > 0) {
        console.log(`Processing ${req.files.length} images...`);
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          console.log(`Processing image ${i + 1}:`, file.originalname);
          try {
            // Créer l'image dans la base de données
            const imageData = {
              productId: product.id,
              filename: file.filename,
              filePath: file.path,
              fileSize: file.size,
              mimeType: file.mimetype,
              width: 0, // Sera calculé plus tard si nécessaire
              height: 0, // Sera calculé plus tard si nécessaire
              altText: req.body[`image_${i}_alt`] || "",
              description: req.body[`image_${i}_description`] || "",
              orderIndex: i,
            };

            const image = await productService.createImage(imageData);
            console.log(`Image ${i + 1} created:`, image.id);
          } catch (imageError) {
            console.error(`Error creating image ${i + 1}:`, imageError);
            // Continue avec les autres images même si une échoue
          }
        }
      }

      // Récupérer le produit avec ses images pour la réponse
      const productWithImages = await productService.getProductById(product.id);
      if (productWithImages) {
        const images = await productService.listImages(product.id);
        productWithImages.images = images.map((image) => image.toPublicDTO());
      }

      res.status(201).json({
        message: "Product created successfully with images",
        product: productWithImages?.toPublicDTO() || product.toPublicDTO(),
        images: productWithImages?.images || [],
      });
    } catch (error) {
      console.error("Product creation with images error:", error);
      if (
        (error as Error).message === "Product with this name already exists"
      ) {
        res.status(409).json({ error: (error as Error).message });
        return;
      }
      if ((error as Error).message === "Category not found") {
        res.status(404).json({ error: (error as Error).message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour mettre à jour un produit (admin uniquement)
 *
 * @param {string} req.params.id - ID du produit
 * @param {Object} req.body - Nouvelles données du produit
 * @returns {Object} Produit mis à jour
 */
app.put(
  "/api/admin/products/:id",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { error, value } = productSchema.validate(req.body);
      if (error) {
        res
          .status(400)
          .json({ error: error.details[0]?.message || "Validation error" });
        return;
      }

      const product = await productService.updateProduct(
        parseInt(id || "0"),
        value
      );

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.json({
        message: "Product updated successfully",
        product: product.toPublicDTO(),
      });
    } catch (error) {
      console.error("Product update error:", error);
      if ((error as Error).message === "Product not found") {
        res.status(404).json({ error: (error as Error).message });
        return;
      }
      if ((error as Error).message === "Product name already exists") {
        res.status(409).json({ error: (error as Error).message });
        return;
      }
      if ((error as Error).message === "Category not found") {
        res.status(404).json({ error: (error as Error).message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour supprimer un produit (admin uniquement)
 *
 * @param {string} req.params.id - ID du produit à supprimer
 * @returns {Object} Message de confirmation de suppression
 */
app.delete(
  "/api/admin/products/:id",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const success = await productService.deleteProduct(parseInt(id || "0"));

      if (!success) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Product deletion error:", error);
      if ((error as Error).message === "Product not found") {
        res.status(404).json({ error: (error as Error).message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour activer un produit (admin uniquement)
 *
 * @param {string} req.params.id - ID du produit
 * @returns {Object} Produit activé
 */
app.post(
  "/api/admin/products/:id/activate",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const product = await productService.activateProduct(parseInt(id || "0"));

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.json({
        message: "Product activated successfully",
        product: product.toPublicDTO(),
      });
    } catch (error) {
      console.error("Product activation error:", error);
      if ((error as Error).message === "Product not found") {
        res.status(404).json({ error: (error as Error).message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour désactiver un produit (admin uniquement)
 *
 * @param {string} req.params.id - ID du produit
 * @returns {Object} Produit désactivé
 */
app.post(
  "/api/admin/products/:id/deactivate",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const product = await productService.deactivateProduct(
        parseInt(id || "0")
      );

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.json({
        message: "Product deactivated successfully",
        product: product.toPublicDTO(),
      });
    } catch (error) {
      console.error("Product deactivation error:", error);
      if ((error as Error).message === "Product not found") {
        res.status(404).json({ error: (error as Error).message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour uploader une image pour un produit (admin uniquement)
 *
 * @param {string} req.params.id - ID du produit
 * @param {File} req.file - Image à uploader
 * @param {string} [req.body.altText] - Texte alternatif
 * @param {string} [req.body.description] - Description de l'image
 * @param {number} [req.body.orderIndex] - Index d'ordre
 * @returns {Object} Image créée
 */
app.post(
  "/api/admin/products/:id/images",
  authenticateToken,
  authenticateAdmin,
  upload.single("image"),
  async (req: any, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: "No image file provided" });
        return;
      }

      const imageData = {
        productId: parseInt(id || "0"),
        filename: file.filename,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        width: 0, // Sera calculé plus tard si nécessaire
        height: 0, // Sera calculé plus tard si nécessaire
        altText: req.body.altText || "",
        description: req.body.description || "",
        orderIndex: parseInt(req.body.orderIndex || "0"),
      };

      const image = await productService.createImage(imageData);

      res.status(201).json({
        message: "Image uploaded successfully",
        image: image.toPublicDTO(),
      });
    } catch (error) {
      console.error("Image upload error:", error);
      if ((error as Error).message === "Product not found") {
        res.status(404).json({ error: (error as Error).message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour supprimer une image d'un produit (admin uniquement)
 *
 * @param {string} req.params.id - ID du produit
 * @param {string} req.params.imageId - ID de l'image
 * @returns {Object} Message de confirmation de suppression
 */
app.delete(
  "/api/admin/products/:id/images/:imageId",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { id, imageId } = req.params;

      const success = await productService.deleteImage(
        parseInt(id || "0"),
        parseInt(imageId || "0")
      );

      if (!success) {
        res.status(404).json({ error: "Image not found" });
        return;
      }

      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Image deletion error:", error);
      if ((error as Error).message === "Image not found") {
        res.status(404).json({ error: (error as Error).message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour ajouter des images à un produit existant (admin uniquement)
 *
 * @param {string} req.params.id - ID du produit
 * @param {File[]} req.files - Images à ajouter
 * @returns {Object} Images ajoutées
 */
app.post(
  "/api/admin/products/:id/add-images",
  authenticateToken,
  authenticateAdmin,
  upload.array("newImages", 10), // Maximum 10 nouvelles images
  async (req: any, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const files = req.files;

      if (!files || files.length === 0) {
        res.status(400).json({ error: "No image files provided" });
        return;
      }

      console.log(`Adding ${files.length} images to product ${id}`);

      const addedImages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing image ${i + 1}:`, file.originalname);

        try {
          const imageData = {
            productId: parseInt(id || "0"),
            filename: file.filename,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype,
            width: 0, // Sera calculé plus tard si nécessaire
            height: 0, // Sera calculé plus tard si nécessaire
            altText: req.body[`image_${i}_alt`] || "",
            description: req.body[`image_${i}_description`] || "",
            orderIndex: i,
          };

          const image = await productService.createImage(imageData);
          addedImages.push(image.toPublicDTO());
          console.log(`Image ${i + 1} added:`, image.id);
        } catch (imageError) {
          console.error(`Error adding image ${i + 1}:`, imageError);
          // Continue avec les autres images même si une échoue
        }
      }

      res.status(201).json({
        message: "Images added successfully",
        images: addedImages,
        count: addedImages.length,
      });
    } catch (error) {
      console.error("Add images error:", error);
      if ((error as Error).message === "Product not found") {
        res.status(404).json({ error: (error as Error).message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour récupérer une catégorie (admin uniquement)
 *
 * @param {string} req.params.id - ID de la catégorie
 * @returns {Object} Détails de la catégorie
 */
app.get(
  "/api/admin/categories/:id",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const category = await productService.getCategoryById(
        parseInt(id || "0")
      );

      if (!category) {
        res.status(404).json({ error: "Category not found" });
        return;
      }

      res.json(category.toPublicDTO());
    } catch (error) {
      console.error("Category details error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ===== GESTION DES ERREURS GLOBALES =====
/**
 * Middleware de gestion des erreurs globales
 * Capture toutes les erreurs non gérées dans l'application
 */
app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

/**
 * Handler pour les routes non trouvées (404)
 * Doit être placé en dernier pour capturer toutes les routes non définies
 */
app.use("*", (req: Request, res: Response): void => {
  res.status(404).json({ error: "Route not found" });
});

// ===== DÉMARRAGE DU SERVEUR =====
/**
 * Démarrage du serveur sur le port configuré
 */
app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});
