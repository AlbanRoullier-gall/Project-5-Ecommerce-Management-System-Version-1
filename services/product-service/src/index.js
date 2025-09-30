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

const app = express();
const PORT = process.env.PORT || 3002;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Initialize service
const productService = new ProductService(pool);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// Authentication middleware
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

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// File upload configuration
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

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Memory storage for API Gateway proxy
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Validation schemas
const categorySchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().optional(),
});

const productSchema = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().optional(),
  price: Joi.number().positive().precision(2).required(),
  vatRate: Joi.number().min(0).max(100).precision(2).required(),
  categoryId: Joi.number().integer().required(),
  isActive: Joi.boolean().optional(),
});

const imageSchema = Joi.object({
  altText: Joi.string().max(255).optional(),
  description: Joi.string().optional(),
  orderIndex: Joi.number().integer().min(0).optional(),
});

// Routes

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "product-service" });
});

// Public routes
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

app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productService.getProductById(parseInt(id));

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Get product images
    const images = await productService.listImages(parseInt(id));
    product.images = images.map((image) => image.toPublicDTO());

    res.json(product.toPublicDTO());
  } catch (error) {
    console.error("Product details error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await productService.listCategories();
    res.json(categories.map((category) => category.toPublicDTO()));
  } catch (error) {
    console.error("Categories list error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin routes
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

      res.json(result);
    } catch (error) {
      console.error("Admin products list error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Admin products top - MUST be before /:id route
app.get(
  "/api/admin/products/top",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { limit = 5 } = req.query;
      // For now, return a simple response for testing
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

// Development endpoints for product status toggle with authentication
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

      // Get product images
      const images = await productService.listImages(parseInt(id));
      product.images = images.map((image) => image.toPublicDTO());

      res.json(product.toPublicDTO());
    } catch (error) {
      console.error("Admin product details error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

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

// Create product with images
app.post(
  "/api/admin/products/with-images",
  authenticateToken,
  authenticateAdmin,
  memoryUpload.array("images", 3),
  async (req, res) => {
    try {
      // Validate product data
      const { error, value } = productSchema.validate(req.body);
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
          const uploadDir = "uploads/products";
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

// Image upload
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

// Routes dupliquées supprimées - les routes admin sont déjà définies plus haut

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});
