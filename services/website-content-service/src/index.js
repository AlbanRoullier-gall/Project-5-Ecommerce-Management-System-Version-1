const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const Joi = require("joi");
const morgan = require("morgan");
const { marked } = require("marked");
const WebsiteContentService = require("./services/WebsiteContentService");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3005;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Initialize service
const websiteContentService = new WebsiteContentService(pool);

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

// Validation schemas
const pageSchema = Joi.object({
  pageSlug: Joi.string().max(100).required(),
  pageTitle: Joi.string().max(255).required(),
  markdownContent: Joi.string().required(),
});

const versionSchema = Joi.object({
  markdownContent: Joi.string().required(),
});

const updatePageSchema = Joi.object({
  pageSlug: Joi.string().max(100).optional(),
  pageTitle: Joi.string().max(255).optional(),
  markdownContent: Joi.string().optional(),
});

// Routes

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "website-content-service" });
});

// Public routes
app.get("/api/website-content/pages", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const result = await websiteContentService.listAllPages({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });

    res.json(result);
  } catch (error) {
    console.error("Get pages error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/website-content/pages/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await websiteContentService.getPageBySlug(slug);

    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.json(page);
  } catch (error) {
    console.error("Get page error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/website-content/slugs", async (req, res) => {
  try {
    const slugs = await websiteContentService.getAllPageSlugs();
    res.json({ slugs });
  } catch (error) {
    console.error("Get slugs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin routes
app.post(
  "/api/admin/website-content/pages",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { error, value } = pageSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { pageSlug, pageTitle, markdownContent } = value;

      const page = await websiteContentService.createPage(
        pageTitle,
        pageSlug,
        markdownContent
      );

      res.status(201).json({
        message: "Page created successfully",
        page: page,
      });
    } catch (error) {
      console.error("Create page error:", error);
      if (error.message === "Page with this slug already exists") {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.put(
  "/api/admin/website-content/pages/:slug",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { slug } = req.params;
      const { error, value } = updatePageSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const page = await websiteContentService.updatePage(slug, value);

      res.json({
        message: "Page updated successfully",
        page: page,
      });
    } catch (error) {
      console.error("Update page error:", error);
      if (error.message === "Page not found") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "Page with this slug already exists") {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.delete(
  "/api/admin/website-content/pages/:slug",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { slug } = req.params;

      const deleted = await websiteContentService.deletePage(slug);

      if (!deleted) {
        return res.status(404).json({ error: "Page not found" });
      }

      res.json({ message: "Page deleted successfully" });
    } catch (error) {
      console.error("Delete page error:", error);
      if (error.message === "Page not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.get(
  "/api/admin/website-content/pages/:slug/versions",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { slug } = req.params;

      const versions = await websiteContentService.listVersions(slug);

      res.json(versions);
    } catch (error) {
      console.error("Get versions error:", error);
      if (error.message === "Page not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.post(
  "/api/admin/website-content/pages/:slug/rollback",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { slug } = req.params;
      const { versionNumber } = req.body;

      if (!versionNumber) {
        return res.status(400).json({ error: "Version number is required" });
      }

      const page = await websiteContentService.rollbackPage(
        slug,
        versionNumber
      );

      res.json({
        message: "Page rolled back successfully",
        page: page,
      });
    } catch (error) {
      console.error("Rollback page error:", error);
      if (
        error.message === "Page not found" ||
        error.message === "Version not found"
      ) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.delete(
  "/api/admin/website-content/pages/:slug/versions/:versionNumber",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { slug, versionNumber } = req.params;

      const deleted = await websiteContentService.deleteVersion(
        slug,
        parseInt(versionNumber)
      );

      if (!deleted) {
        return res.status(404).json({ error: "Version not found" });
      }

      res.json({ message: "Version deleted successfully" });
    } catch (error) {
      console.error("Delete version error:", error);
      if (
        error.message === "Page not found" ||
        error.message === "Version not found" ||
        error.message === "Cannot delete the current version"
      ) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

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
  console.log(`Website Content Service running on port ${PORT}`);
});
