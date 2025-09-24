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
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const Joi = require("joi");
const morgan = require("morgan");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const ProductService = require("./services/ProductService");
require("dotenv").config();

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
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

/**
 * Middleware de vérification des droits administrateur
 * Doit être utilisé après authenticateToken
 * Vérifie que l'utilisateur a le rôle "admin"
 */
const authenticateAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
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
  destination: (req, file, cb) => {
    const uploadDir = "uploads/products";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
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
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
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
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
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
app.get("/health", (req, res) => {
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
app.get("/api/products", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      categoryId,
      search = "",
      activeOnly = true,
    } = req.query;

    const result = await productService.listProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      search,
      activeOnly: activeOnly === "true",
    });

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
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productService.getProductById(parseInt(id));

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Récupération des images du produit
    const images = await productService.listImages(parseInt(id));
    product.images = images.map((image) => image.toPublicDTO());

    res.json(product.toPublicDTO());
  } catch (error) {
    console.error("Product details error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Route pour lister toutes les catégories (publique)
 *
 * @returns {Array} Liste des catégories
 */
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await productService.listCategories();
    res.json(categories.map((category) => category.toPublicDTO()));
  } catch (error) {
    console.error("Categories list error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        categoryId,
        search = "",
        activeOnly = false,
      } = req.query;

      const result = await productService.listProducts({
        page: parseInt(page),
        limit: parseInt(limit),
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        search,
        activeOnly: activeOnly === "true",
      });

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
          const images = await productService.listImages(product.id);
          console.log(
            `[DEBUG] Found ${images.length} images for product ${product.id}`
          );
          product.images = images.map((image) => image.toPublicDTO());
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
  async (req, res) => {
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
  async (req, res) => {
    console.log("Toggle status endpoint called for product ID:", req.params.id);
    try {
      const { id } = req.params;

      const product = await productService.toggleProductStatus(parseInt(id));

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json({
        message: "Product status updated successfully",
        product: product.toPublicDTO(),
      });
    } catch (error) {
      console.error("Product status toggle error:", error);
      if (error.message === "Product not found") {
        return res.status(404).json({ error: error.message });
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
  async (req, res) => {
    try {
      const { id } = req.params;

      const product = await productService.getProductById(parseInt(id));

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Récupération des images du produit
      const images = await productService.listImages(parseInt(id));
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
  async (req, res) => {
    try {
      const { error, value } = categorySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const category = await productService.createCategory(value);

      res.status(201).json({
        message: "Category created successfully",
        category: category.toPublicDTO(),
      });
    } catch (error) {
      console.error("Category creation error:", error);
      if (error.message === "Category with this name already exists") {
        return res.status(409).json({ error: error.message });
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
  async (req, res) => {
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
  async (req, res) => {
    try {
      const { id } = req.params;
      const { error, value } = categorySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const category = await productService.updateCategory(parseInt(id), value);

      res.json({
        message: "Category updated successfully",
        category: category.toPublicDTO(),
      });
    } catch (error) {
      console.error("Category update error:", error);
      if (error.message === "Category not found") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "Category name already exists") {
        return res.status(409).json({ error: error.message });
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
  async (req, res) => {
    try {
      const { id } = req.params;

      const success = await productService.deleteCategory(parseInt(id));

      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }

      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Category deletion error:", error);
      if (error.message === "Category not found") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "Cannot delete category with existing products") {
        return res.status(409).json({ error: error.message });
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
  async (req, res) => {
    try {
      const { error, value } = productSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const product = await productService.createProduct(value);

      res.status(201).json({
        message: "Product created successfully",
        product: product.toPublicDTO(),
      });
    } catch (error) {
      console.error("Product creation error:", error);
      if (error.message === "Product with this name already exists") {
        return res.status(409).json({ error: error.message });
      }
      if (error.message === "Category not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour créer un produit avec des images (admin uniquement)
 * Traite et optimise les images avec Sharp avant sauvegarde
 *
 * @param {Object} req.body - Données du produit (form-data)
 * @param {Array} req.files - Fichiers images à uploader (max 3)
 * @returns {Object} Produit créé avec ses images
 */
app.post(
  "/api/admin/products/with-images",
  authenticateToken,
  authenticateAdmin,
  memoryUpload.array("images", 3),
  async (req, res) => {
    try {
      console.log("=== PRODUCT SERVICE: Creating product with images ===");
      console.log("Files received:", req.files?.length || 0);
      console.log(
        "Files details:",
        req.files?.map((f) => ({
          fieldname: f.fieldname,
          originalname: f.originalname,
          mimetype: f.mimetype,
          size: f.size,
          hasBuffer: !!f.buffer,
        }))
      );
      console.log("Body:", req.body);
      console.log("Content-Type:", req.headers["content-type"]);

      // Convert string values to appropriate types for validation
      const productData = {
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.price),
        vatRate: parseFloat(req.body.vatRate),
        categoryId: parseInt(req.body.categoryId),
        isActive: req.body.isActive === "true",
      };

      // Validate product data
      const { error, value } = productSchema.validate(productData);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Create the product first
      const product = await productService.createProduct(value);

      // Process uploaded images
      const imageResults = [];
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];

          // Process image with Sharp
          const processedImage = await sharp(file.buffer)
            .resize(800, 600, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 90 })
            .toBuffer();

          // Get image metadata
          const metadata = await sharp(processedImage).metadata();

          // Generate filename
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const filename = `image-${uniqueSuffix}.jpg`;
          const uploadDir = "/app/uploads/products";
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const filePath = path.join(uploadDir, filename);

          // Save processed image
          fs.writeFileSync(filePath, processedImage);

          // Save to database
          const result = await pool.query(
            `INSERT INTO product_images (product_id, filename, file_path, file_size, mime_type, width, height, 
                                     alt_text, description, is_active, order_index, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10, NOW(), NOW())
           RETURNING id, filename, file_path, file_size, mime_type, width, height, alt_text, description, order_index, created_at`,
            [
              product.id,
              filename,
              filePath,
              processedImage.length,
              "image/jpeg",
              metadata.width,
              metadata.height,
              `Image ${i + 1} du produit ${product.name}`,
              `Image ${i + 1} du produit ${product.name}`,
              i,
            ]
          );

          imageResults.push(result.rows[0]);
        }
      }

      // Get the product with images
      const images = await productService.listImages(product.id);
      product.images = images.map((image) => image.toPublicDTO());

      console.log("Product created with", imageResults.length, "images");
      console.log(
        "Image results:",
        imageResults.map((img) => ({ id: img.id, filename: img.filename }))
      );

      res.status(201).json({
        message: "Product created successfully with images",
        product: product.toPublicDTO(),
        images: imageResults,
      });
    } catch (error) {
      console.error("Product creation with images error:", error);
      if (error.message === "Product with this name already exists") {
        return res.status(409).json({ error: error.message });
      }
      if (error.message === "Category not found") {
        return res.status(404).json({ error: error.message });
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
 * @param {string} req.body.name - Nouveau nom du produit
 * @param {string} [req.body.description] - Nouvelle description
 * @param {number} req.body.price - Nouveau prix
 * @param {number} req.body.vatRate - Nouveau taux de TVA
 * @param {number} req.body.categoryId - Nouvelle catégorie
 * @param {boolean} [req.body.isActive] - Nouveau statut actif
 * @returns {Object} Produit mis à jour
 */
app.put(
  "/api/admin/products/:id",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { error, value } = productSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { name, description, price, vatRate, categoryId, isActive } = value;

      const result = await pool.query(
        `UPDATE products 
       SET name = $1, description = $2, price = $3, vat_rate = $4, category_id = $5, is_active = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING id, name, description, price, vat_rate, category_id, is_active, updated_at`,
        [name, description, price, vatRate, categoryId, isActive, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json({
        message: "Product updated successfully",
        product: result.rows[0],
      });
    } catch (error) {
      console.error("Product update error:", error);
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
  async (req, res) => {
    try {
      const { id } = req.params;

      const success = await productService.deleteProduct(parseInt(id));

      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Product deletion error:", error);
      if (error.message === "Product not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour activer un produit (admin uniquement)
 *
 * @param {string} req.params.id - ID du produit à activer
 * @returns {Object} Produit activé
 */
app.post(
  "/api/admin/products/:id/activate",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const success = await productService.activateProduct(parseInt(id));

      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Récupérer le produit mis à jour pour le retourner
      const updatedProduct = await productService.getProductById(parseInt(id));
      res.json({
        message: "Product activated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Product activation error:", error);
      if (error.message === "Product not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour désactiver un produit (admin uniquement)
 *
 * @param {string} req.params.id - ID du produit à désactiver
 * @returns {Object} Produit désactivé
 */
app.post(
  "/api/admin/products/:id/deactivate",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const success = await productService.deactivateProduct(parseInt(id));

      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Récupérer le produit mis à jour pour le retourner
      const updatedProduct = await productService.getProductById(parseInt(id));
      res.json({
        message: "Product deactivated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Product deactivation error:", error);
      if (error.message === "Product not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ===== GESTION DES IMAGES =====
/**
 * Route pour récupérer les images d'un produit (admin uniquement)
 *
 * @param {string} req.params.id - ID du produit
 * @returns {Array} Liste des images du produit
 */
app.get(
  "/api/admin/products/:id/images",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const images = await productService.listImages(id);
      res.json(images.map((image) => image.toPublicDTO()));
    } catch (error) {
      console.error("Error fetching product images:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour ajouter des images à un produit existant (admin uniquement)
 * Traite et optimise les images avec Sharp avant sauvegarde
 *
 * @param {string} req.params.productId - ID du produit
 * @param {Array} req.files - Fichiers images à uploader (max 5)
 * @returns {Object} Liste des images ajoutées avec succès
 */
app.post(
  "/api/admin/products/:productId/add-images",
  authenticateToken,
  authenticateAdmin,
  memoryUpload.array("newImages", 5),
  async (req, res) => {
    try {
      console.log("=== ADD IMAGES REQUEST ===");
      console.log("Product ID:", req.params.productId);
      console.log("Files received:", req.files?.length || 0);

      const { productId } = req.params;

      // Vérifier que le produit existe
      const product = await productService.getProductById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No images provided" });
      }

      const imageResults = [];
      const uploadDir = "/app/uploads/products";

      // Créer le dossier s'il n'existe pas
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Traitement des images uploadées (même logique que la création de produit)
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        // Traitement de l'image avec Sharp (redimensionnement et optimisation)
        const processedImage = await sharp(file.buffer)
          .resize(800, 600, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer();

        // Récupération des métadonnées de l'image
        const metadata = await sharp(processedImage).metadata();

        // Génération d'un nom de fichier unique
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = `image-${uniqueSuffix}.jpg`;
        const filePath = path.join(uploadDir, filename);

        // Sauvegarde de l'image traitée
        fs.writeFileSync(filePath, processedImage);

        // Sauvegarde en base de données (même logique que la création de produit)
        const result = await pool.query(
          `INSERT INTO product_images (product_id, filename, file_path, file_size, mime_type, width, height, 
                                     alt_text, description, is_active, order_index, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10, NOW(), NOW())
           RETURNING id, filename, file_path, file_size, mime_type, width, height, alt_text, description, order_index, created_at`,
          [
            productId,
            filename,
            filePath,
            processedImage.length,
            "image/jpeg",
            metadata.width,
            metadata.height,
            file.originalname,
            `Image ${i + 1}`,
            i,
          ]
        );

        imageResults.push(result.rows[0]);
      }

      console.log(`Images ajoutées avec succès: ${imageResults.length}`);

      res.json({
        message: `Images added successfully`,
        images: imageResults.map((img) => ({
          id: img.id,
          productId: img.product_id,
          filename: img.filename,
          filePath: img.file_path,
          fileSize: img.file_size,
          altText: img.alt_text,
          createdAt: img.created_at,
        })),
      });
    } catch (error) {
      console.error("Error adding images to product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour supprimer une image de produit (admin uniquement)
 * Supprime à la fois le fichier physique et l'entrée en base de données
 *
 * @param {string} req.params.productId - ID du produit
 * @param {string} req.params.imageId - ID de l'image à supprimer
 * @returns {Object} Message de confirmation de suppression
 */
app.delete(
  "/api/admin/products/:productId/images/:imageId",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      console.log("=== DELETE IMAGE REQUEST ===");
      console.log("Product ID:", req.params.productId);
      console.log("Image ID:", req.params.imageId);
      const { productId, imageId } = req.params;

      // Vérifier que l'image appartient au produit
      const images = await productService.listImages(productId);
      const imageToDelete = images.find((img) => img.id === parseInt(imageId));

      if (!imageToDelete) {
        return res.status(404).json({ error: "Image not found" });
      }

      // Supprimer le fichier physique du serveur
      const fs = require("fs");
      const path = require("path");
      const filePath = path.join("/app", imageToDelete.filePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
      }

      // Supprimer l'entrée de la base de données
      await pool.query("DELETE FROM product_images WHERE id = $1", [imageId]);

      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * Route pour uploader une image pour un produit (admin uniquement)
 * Utilise le stockage disque et traite l'image avec Sharp
 *
 * @param {string} req.params.id - ID du produit
 * @param {File} req.file - Fichier image à uploader
 * @param {string} [req.body.altText] - Texte alternatif de l'image
 * @param {string} [req.body.description] - Description de l'image
 * @param {number} [req.body.orderIndex] - Index d'ordre de l'image
 * @returns {Object} Image uploadée avec succès
 */
app.post(
  "/api/admin/products/:id/images",
  authenticateToken,
  authenticateAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { altText, description, orderIndex } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const { error } = imageSchema.validate({
        altText,
        description,
        orderIndex,
      });
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Process image with Sharp
      const processedImage = await sharp(req.file.path)
        .resize(800, 600, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();

      // Save processed image
      const processedPath = req.file.path.replace(".", "_processed.");
      fs.writeFileSync(processedPath, processedImage);

      // Get image metadata
      const metadata = await sharp(processedImage).metadata();

      // Save to database
      const result = await pool.query(
        `INSERT INTO product_images (product_id, filename, file_path, file_size, mime_type, width, height, 
                                 alt_text, description, is_active, order_index, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10, NOW(), NOW())
       RETURNING id, filename, file_path, file_size, mime_type, width, height, alt_text, description, order_index, created_at`,
        [
          id,
          req.file.filename,
          processedPath,
          processedImage.length,
          "image/jpeg",
          metadata.width,
          metadata.height,
          altText,
          description,
          orderIndex || 0,
        ]
      );

      // Clean up original file
      fs.unlinkSync(req.file.path);

      res.status(201).json({
        message: "Image uploaded successfully",
        image: result.rows[0],
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ===== GESTION DES ERREURS GLOBALES =====
/**
 * Middleware de gestion des erreurs globales
 * Capture toutes les erreurs non gérées dans l'application
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

/**
 * Handler pour les routes non trouvées (404)
 * Doit être placé en dernier pour capturer toutes les routes non définies
 */
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ===== DÉMARRAGE DU SERVEUR =====
/**
 * Démarrage du serveur sur le port configuré
 */
app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});
