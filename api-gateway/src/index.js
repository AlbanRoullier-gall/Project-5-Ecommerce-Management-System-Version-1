/**
 * ===========================================
 * API GATEWAY - E-COMMERCE PLATFORM
 * ===========================================
 *
 * Point d'entrée central pour toutes les requêtes de l'application e-commerce.
 * Ce service fait office de proxy entre les clients (frontend/backoffice) et les microservices.
 *
 * Services proxifiés :
 * - Auth Service (port 3008) : Authentification et gestion des utilisateurs
 * - Product Service (port 13002) : Gestion des produits et catégories
 * - Email Service (port 13007) : Envoi d'emails (contact)
 *
 * @author E-commerce Platform Team
 * @version 1.0.0
 */

// ===========================================
// IMPORTS ET CONFIGURATION
// ===========================================

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const axios = require("axios");
require("dotenv").config();

// ===========================================
// INITIALISATION DE L'APPLICATION
// ===========================================

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================================
// CONFIGURATION DES SERVICES
// ===========================================

/**
 * URLs des microservices
 * Ces URLs pointent vers les services backend correspondants
 */
const SERVICE_URLS = {
  EMAIL: process.env.EMAIL_SERVICE_URL || "http://localhost:13007",
  PRODUCT: process.env.PRODUCT_SERVICE_URL || "http://localhost:13002",
  AUTH: process.env.AUTH_SERVICE_URL || "http://localhost:3008",
};

// ===========================================
// MIDDLEWARE GLOBAL
// ===========================================

/**
 * Configuration de sécurité avec Helmet
 * Protège contre les vulnérabilités courantes (XSS, clickjacking, etc.)
 */
app.use(helmet());

/**
 * Configuration CORS
 * Autorise les requêtes cross-origin depuis les applications frontend
 */
app.use(
  cors({
    origin: [
      "http://localhost:13008", // Backoffice
      "http://localhost:13009", // Frontend
      "http://localhost:3000", // API Gateway (dev)
      "http://localhost:3001", // Autres services (dev)
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

/**
 * Middleware de parsing des requêtes
 * Limite la taille des requêtes à 10MB pour supporter les uploads d'images
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * Middleware de logging
 * Enregistre toutes les requêtes HTTP pour le debugging
 */
app.use(morgan("combined"));

// ===========================================
// ROUTES UTILITAIRES
// ===========================================

/**
 * Health Check Endpoint
 * Utilisé par les scripts de monitoring et Docker
 * @route GET /health
 */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Information sur l'API Gateway
 * @route GET /api/info
 */
app.get("/api/info", (req, res) => {
  res.json({
    message: "API Gateway - E-commerce Platform",
    version: "1.0.0",
    status: "Ready for development",
  });
});

// ===========================================
// FONCTIONS UTILITAIRES DE PROXY
// ===========================================

/**
 * Fonction générique de proxy vers le service d'email
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {string} path - Chemin de l'endpoint dans le service email
 */
const proxyToEmailService = async (req, res, path = "") => {
  try {
    const method = req.method;
    const url = `${SERVICE_URLS.EMAIL}/api${path}`;
    const headers = {
      "Content-Type": "application/json",
      ...req.headers,
    };
    delete headers.host; // Supprimer le header host pour éviter les conflits

    const config = {
      method,
      url,
      headers,
      timeout: 30000, // Timeout de 30 secondes
    };

    // Ajouter le body pour les requêtes POST, PUT, PATCH
    if (["POST", "PUT", "PATCH"].includes(method)) {
      config.data = req.body;
    }

    // Ajouter les paramètres de requête
    if (Object.keys(req.query).length > 0) {
      config.params = req.query;
    }

    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error proxying to email service:", error.message);

    // Transmettre l'erreur originale du service si disponible
    if (error.response && error.response.data) {
      return res.status(error.response.status).json(error.response.data);
    }

    // Sinon, message générique
    res.status(error.response?.status || 500).json({
      error: "Email service temporarily unavailable",
      message: error.message,
    });
  }
};

/**
 * Fonction générique de proxy vers le service d'authentification
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {string} path - Chemin de l'endpoint dans le service auth
 */
const proxyToAuthService = async (req, res, path = "") => {
  try {
    const method = req.method;
    const url = `${SERVICE_URLS.AUTH}/api${path}`;
    const headers = {
      "Content-Type": "application/json",
      ...req.headers,
    };
    delete headers.host; // Supprimer le header host pour éviter les conflits

    const config = {
      method,
      url,
      headers,
      timeout: 30000, // Timeout de 30 secondes
    };

    // Ajouter le body pour les requêtes POST, PUT, PATCH
    if (["POST", "PUT", "PATCH"].includes(method)) {
      config.data = req.body;
    }

    // Ajouter les paramètres de requête
    if (Object.keys(req.query).length > 0) {
      config.params = req.query;
    }

    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error proxying to auth service:", error.message);

    // Transmettre l'erreur originale du service si disponible
    if (error.response && error.response.data) {
      return res.status(error.response.status).json(error.response.data);
    }

    // Sinon, message générique
    res.status(error.response?.status || 500).json({
      error: "Auth service temporarily unavailable",
      message: error.message,
    });
  }
};

/**
 * Fonction générique de proxy vers le service de produits
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {string} path - Chemin de l'endpoint dans le service product
 */
const proxyToProductService = async (req, res, path = "") => {
  try {
    const method = req.method;
    const url = `${SERVICE_URLS.PRODUCT}/api${path}`;

    // Headers essentiels uniquement
    const headers = {
      Authorization: req.headers.authorization,
      Accept: req.headers.accept || "application/json",
    };

    // Supprimer les headers undefined
    Object.keys(headers).forEach((key) => {
      if (headers[key] === undefined) {
        delete headers[key];
      }
    });

    const config = {
      method,
      url,
      headers,
      timeout: 30000,
    };

    // Ajouter le body pour les requêtes POST, PUT, PATCH
    if (["POST", "PUT", "PATCH"].includes(method)) {
      config.data = req.body || {};
      config.headers["Content-Type"] = "application/json";
    }

    // Ajouter les paramètres de requête
    if (Object.keys(req.query).length > 0) {
      config.params = req.query;
    }

    console.log(`Proxying ${method} ${path} to product service`);
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error proxying to product service:", error.message);
    console.error("Error details:", error.response?.data);

    // Transmettre l'erreur originale du service si disponible
    if (error.response && error.response.data) {
      return res.status(error.response.status).json(error.response.data);
    }

    // Sinon, message générique
    res.status(error.response?.status || 500).json({
      error: "Product service temporarily unavailable",
      message: error.message,
    });
  }
};

// ===========================================
// ROUTES D'AUTHENTIFICATION
// ===========================================

/**
 * Routes publiques d'authentification (sans token requis)
 */

// Inscription d'un nouvel utilisateur
app.post("/api/auth/register", (req, res) =>
  proxyToAuthService(req, res, "/auth/register")
);

// Connexion d'un utilisateur
app.post("/api/auth/login", (req, res) =>
  proxyToAuthService(req, res, "/auth/login")
);

// Demande de réinitialisation de mot de passe
app.post("/api/auth/forgot-password", (req, res) =>
  proxyToAuthService(req, res, "/auth/forgot-password")
);

// Réinitialisation de mot de passe avec token
app.post("/api/auth/reset-password", (req, res) =>
  proxyToAuthService(req, res, "/auth/reset-password")
);

/**
 * Routes protégées d'authentification (token requis)
 */

// Récupération du profil utilisateur
app.get("/api/auth/profile", (req, res) =>
  proxyToAuthService(req, res, "/auth/profile")
);

// Mise à jour du profil utilisateur
app.put("/api/auth/profile", (req, res) =>
  proxyToAuthService(req, res, "/auth/profile")
);

// Changement de mot de passe
app.post("/api/auth/change-password", (req, res) =>
  proxyToAuthService(req, res, "/auth/change-password")
);

// Récupération des sessions actives
app.get("/api/auth/sessions", (req, res) =>
  proxyToAuthService(req, res, "/auth/sessions")
);

// Suppression d'une session spécifique
app.delete("/api/auth/sessions/:sessionId", (req, res) =>
  proxyToAuthService(req, res, `/auth/sessions/${req.params.sessionId}`)
);

// Déconnexion de l'utilisateur
app.post("/api/auth/logout", (req, res) =>
  proxyToAuthService(req, res, "/auth/logout")
);

// ===========================================
// ROUTES DE GESTION DES EMAILS
// ===========================================

/**
 * Endpoint de contact
 * Proxy vers le service d'email pour l'envoi de messages
 * @route POST /api/contact
 */
app.post("/api/contact", (req, res) =>
  proxyToEmailService(req, res, "/contact")
);

// ===========================================
// ROUTES DE GESTION DES PRODUITS
// ===========================================

/**
 * Service d'images de produits
 * Proxy vers le service de produits pour servir les images
 * @route GET /api/products/images/:filename
 */
app.get("/api/products/images/:filename", (req, res) => {
  // Rediriger directement vers le service product pour les images
  const imageUrl = `${SERVICE_URLS.PRODUCT}/uploads/products/${req.params.filename}`;
  res.redirect(imageUrl);
});

/**
 * Récupération des produits avec leurs images
 * Proxy vers le service de produits qui gère la logique des images
 * @route GET /api/admin/products
 */
app.get("/api/admin/products", (req, res) =>
  proxyToProductService(req, res, "/admin/products")
);

/**
 * Routes CRUD pour les produits (avec authentification)
 */

// Récupération d'un produit spécifique
app.get("/api/admin/products/:id", (req, res) =>
  proxyToProductService(req, res, `/admin/products/${req.params.id}`)
);

// Création d'un nouveau produit
app.post("/api/admin/products", (req, res) =>
  proxyToProductService(req, res, "/admin/products")
);

// Mise à jour d'un produit existant
app.put("/api/admin/products/:id", (req, res) =>
  proxyToProductService(req, res, `/admin/products/${req.params.id}`)
);

// Suppression d'un produit
app.delete("/api/admin/products/:id", (req, res) =>
  proxyToProductService(req, res, `/admin/products/${req.params.id}`)
);

// Activation d'un produit
app.post("/api/admin/products/:id/activate", (req, res) =>
  proxyToProductService(req, res, `/admin/products/${req.params.id}/activate`)
);

// Désactivation d'un produit
app.post("/api/admin/products/:id/deactivate", (req, res) =>
  proxyToProductService(req, res, `/admin/products/${req.params.id}/deactivate`)
);

// ===========================================
// ROUTES DE GESTION DES CATÉGORIES
// ===========================================

/**
 * Routes CRUD pour les catégories (avec authentification)
 */

// Récupération de toutes les catégories
app.get("/api/admin/categories", (req, res) =>
  proxyToProductService(req, res, "/admin/categories")
);

// Création d'une nouvelle catégorie
app.post("/api/admin/categories", (req, res) =>
  proxyToProductService(req, res, "/admin/categories")
);

// Mise à jour d'une catégorie existante
app.put("/api/admin/categories/:id", (req, res) =>
  proxyToProductService(req, res, `/admin/categories/${req.params.id}`)
);

// Suppression d'une catégorie
app.delete("/api/admin/categories/:id", (req, res) =>
  proxyToProductService(req, res, `/admin/categories/${req.params.id}`)
);

// ===========================================
// MIDDLEWARE DE GESTION D'ERREURS
// ===========================================

/**
 * Middleware global de gestion des erreurs
 * Capture toutes les erreurs non gérées
 */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: "An unexpected error occurred",
  });
});

/**
 * Middleware de gestion des routes non trouvées
 * Retourne une erreur 404 pour toutes les routes non définies
 */
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The requested route ${req.method} ${req.originalUrl} does not exist`,
  });
});

// ===========================================
// DÉMARRAGE DU SERVEUR
// ===========================================

/**
 * Démarrage du serveur API Gateway
 * Écoute sur le port configuré et affiche les informations de démarrage
 */
app.listen(PORT, () => {
  console.log("🚀 API Gateway démarré avec succès !");
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log("🔗 Services connectés:");
  console.log(`   • Auth Service: ${SERVICE_URLS.AUTH}`);
  console.log(`   • Product Service: ${SERVICE_URLS.PRODUCT}`);
  console.log(`   • Email Service: ${SERVICE_URLS.EMAIL}`);
  console.log("✅ Gateway prêt pour les intégrations futures");
});
