/**
 * API GATEWAY - VERSION ULTRA-SIMPLE SANS ERREURS TYPESCRIPT
 */

import express, { Request, Response } from "express";
import axios from "axios";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";

const app = express();
const PORT = parseInt(process.env["PORT"] || "3020", 10);

// ===== CONFIGURATION JWT =====
const JWT_SECRET = process.env["JWT_SECRET"] || "your-jwt-secret-key";

// ===== CONFIGURATION DES SERVICES =====
// Configuration automatique selon l'environnement
const isDevelopment =
  process.env["NODE_ENV"] === "development" || !process.env["DOCKER_ENV"];

const SERVICES = {
  auth: isDevelopment ? "http://localhost:3008" : "http://auth-service:3008",
  product: isDevelopment
    ? "http://localhost:3002"
    : "http://product-service:3002",
  order: isDevelopment ? "http://localhost:3003" : "http://order-service:3003",
  cart: isDevelopment ? "http://localhost:3004" : "http://cart-service:3004",
  customer: isDevelopment
    ? "http://localhost:3001"
    : "http://customer-service:3001",
  payment: isDevelopment
    ? "http://localhost:3007"
    : "http://payment-service:3007",
  email: isDevelopment ? "http://localhost:3006" : "http://email-service:3006",
  websiteContent: isDevelopment
    ? "http://localhost:3005"
    : "http://website-content-service:3005",
} as const;

// ===== MAPPING ROUTES =====
const ROUTES: Record<string, keyof typeof SERVICES> = {
  // === AUTH SERVICE ===
  // Routes publiques (sans authentification)
  "/auth/register": "auth", // POST: Inscription utilisateur
  "/auth/login": "auth", // POST: Connexion utilisateur
  "/auth/validate-password": "auth", // POST: Valider mot de passe

  // Routes admin (avec authentification)
  "/admin/auth/profile": "auth", // GET: Profil utilisateur, PUT: Modifier profil
  "/admin/auth/change-password": "auth", // PUT: Changer mot de passe
  "/admin/auth/logout": "auth", // POST: Déconnexion

  // === PRODUCT SERVICE ===
  // Routes publiques
  "/products": "product", // GET: Liste des produits, POST: Créer produit
  "/categories": "product", // GET: Liste des catégories, POST: Créer catégorie
  "/products/search": "product", // GET: Rechercher des produits

  // Routes admin
  "/admin/products": "product", // GET: Liste produits, PUT: Modifier produit, DELETE: Supprimer produit
  "/admin/categories": "product", // GET: Liste catégories, PUT: Modifier catégorie, DELETE: Supprimer catégorie

  // === ORDER SERVICE ===
  // Routes publiques
  "/orders": "order", // POST: Créer commande, GET: Récupérer commandes client
  "/orders/:id": "order", // GET: Récupérer une commande spécifique
  "/orders/:orderId/items": "order", // GET: Récupérer articles d'une commande
  "/orders/:orderId/addresses": "order", // GET: Récupérer adresses d'une commande
  "/customers/:customerId/credit-notes": "order", // GET: Récupérer avoirs d'un client
  "/customers/:customerId/statistics/orders": "order", // GET: Statistiques d'un client
  "/statistics/orders": "order", // GET: Statistiques générales des commandes
  "/statistics/orders/date-range/:startDate/:endDate": "order", // GET: Statistiques par période

  // Routes admin
  "/admin/orders": "order", // GET: Liste toutes les commandes, PUT: Modifier commande, DELETE: Supprimer commande
  "/admin/orders/:id": "order", // GET: Voir commande admin, PUT: Modifier commande admin, DELETE: Supprimer commande admin
  "/admin/order-items": "order", // POST: Créer article de commande
  "/admin/order-items/:id": "order", // GET: Voir article, PUT: Modifier article, DELETE: Supprimer article
  "/admin/credit-notes": "order", // POST: Créer avoir, GET: Liste avoirs
  "/admin/credit-notes/:id": "order", // GET: Voir avoir, PUT: Modifier avoir, DELETE: Supprimer avoir
  "/admin/credit-note-items": "order", // POST: Créer article d'avoir
  "/admin/credit-note-items/:id": "order", // GET: Voir article avoir, PUT: Modifier article avoir, DELETE: Supprimer article avoir
  "/admin/credit-notes/:creditNoteId/items": "order", // GET: Articles d'un avoir
  "/admin/order-addresses": "order", // POST: Créer adresse de commande
  "/admin/order-addresses/:id": "order", // GET: Voir adresse, PUT: Modifier adresse, DELETE: Supprimer adresse
  "/admin/statistics/orders": "order", // GET: Statistiques admin des commandes
  "/admin/customers/:customerId/statistics/orders": "order", // GET: Statistiques commandes d'un client

  // === CART SERVICE ===
  // Routes publiques
  "/cart": "cart", // GET: Récupérer panier, POST: Créer panier, DELETE: Vider panier
  "/cart/items": "cart", // POST: Ajouter article au panier
  "/cart/items/:productId": "cart", // PUT: Modifier quantité, DELETE: Supprimer article
  "/cart/validate": "cart", // GET: Valider le panier
  "/cart/stats": "cart", // GET: Statistiques des paniers

  // === CUSTOMER SERVICE ===
  // Routes publiques
  "/customers": "customer", // POST: Créer un client
  "/customers/:id": "customer", // GET: Récupérer un client spécifique
  "/customers/:customerId/addresses": "customer", // POST: Ajouter une adresse
  "/customers/:customerId/addresses/:id": "customer", // GET: Récupérer une adresse spécifique
  "/customers/:customerId/companies": "customer", // POST: Ajouter une entreprise
  "/customers/:customerId/companies/:id": "customer", // GET: Récupérer une entreprise spécifique

  // Routes admin
  "/admin/customers": "customer", // GET: Liste des clients, PUT: Mettre à jour client, DELETE: Supprimer client
  "/admin/customers/:id": "customer", // GET: Récupérer client, PUT: Modifier client, DELETE: Supprimer client
  "/admin/customers/:customerId/addresses": "customer", // GET: Liste des adresses d'un client
  "/admin/customers/:customerId/addresses/:id": "customer", // PUT: Modifier adresse, DELETE: Supprimer adresse
  "/admin/customers/:customerId/companies": "customer", // GET: Liste des entreprises d'un client
  "/admin/customers/:customerId/companies/:id": "customer", // PUT: Modifier entreprise, DELETE: Supprimer entreprise

  // === PAYMENT SERVICE (PUBLIQUES) ===
  "/payment/create": "payment", // POST: Créer un paiement Stripe
  "/payment/confirm": "payment", // POST: Confirmer un paiement
  "/payment/:paymentId": "payment", // GET: Récupérer un paiement par ID

  // === PAYMENT SERVICE (ADMIN) ===
  "/admin/payment/refund": "payment", // POST: Rembourser un paiement (admin)
  "/admin/payment/stats": "payment", // GET: Statistiques de paiement (admin)

  // === EMAIL SERVICE (PUBLIQUES) ===
  "/email/send": "email", // POST: Envoyer un email au client
  "/email/confirmation": "email", // POST: Envoyer confirmation à l'admin

  // === WEBSITE CONTENT SERVICE ===
  // Routes publiques
  "/content": "websiteContent", // GET: Récupérer contenu du site

  // Routes admin
  "/admin/content": "websiteContent", // GET: Liste contenu, POST: Créer contenu, PUT: Modifier contenu, DELETE: Supprimer contenu
} as const;

// ===== MIDDLEWARES GLOBAUX =====
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ===== FONCTIONS D'AUTHENTIFICATION =====
const isProtectedRoute = (path: string): boolean => {
  return path.includes("/admin/");
};

const verifyToken = (token: string): any | null => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// ===== ROUTE DE SANTÉ =====
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    service: "API Gateway",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ===== ROUTE RACINE =====
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "API Gateway - E-commerce Platform",
    version: "1.0.0",
    health: "/api/health",
  });
});

// ===== ROUTING AUTOMATIQUE =====
Object.entries(ROUTES).forEach(([route, service]) => {
  const fullRoute = `/api${route}`;
  console.log(`📝 Route enregistrée: ${fullRoute} -> ${service}`);
  app.all(fullRoute, async (req: Request, res: Response) => {
    console.log(`🚀 Route appelée: ${req.path} -> Service: ${service}`);

    try {
      // Utiliser le chemin de la route mappée au lieu de req.path
      const pathWithoutApi = route;
      console.log(
        `🔍 Vérification route: ${pathWithoutApi}, Protégée: ${isProtectedRoute(
          pathWithoutApi
        )}`
      );

      // Vérification de l'authentification pour les routes admin
      if (isProtectedRoute(pathWithoutApi)) {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
          console.log("❌ Token manquant pour route admin");
          res.status(401).json({
            error: "Token d'accès requis",
            message:
              "Vous devez fournir un token d'authentification pour accéder aux routes admin",
            code: "MISSING_TOKEN",
          });
          return;
        }

        const user = verifyToken(token);
        if (!user) {
          console.log("❌ Token invalide pour route admin");
          res.status(401).json({
            error: "Token invalide",
            message: "Le token d'authentification est invalide ou expiré",
            code: "INVALID_TOKEN",
          });
          return;
        }

        console.log(`🔐 Admin authentifié: ${user.email} (${user.userId})`);
        (req as any).user = user;
      }

      // Préparation de la requête vers le service
      const serviceUrl = SERVICES[service];
      const targetUrl = `${serviceUrl}${req.path}`;

      console.log(`📤 Envoi vers: ${targetUrl}`);

      // Headers à transmettre
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Ajouter l'utilisateur authentifié dans les headers si disponible
      if ((req as any).user) {
        headers["x-user-id"] = String((req as any).user.userId);
        headers["x-user-email"] = (req as any).user.email;
      }

      // Supprimer le header host pour éviter les conflits
      delete headers["host"];

      // Faire la requête vers le service
      const response = await axios({
        method: req.method,
        url: targetUrl,
        headers,
        data: req.body,
        params: req.query,
        timeout: 30000,
      });

      console.log(
        `✅ ${req.method} ${req.path} → ${service} (${response.status})`
      );
      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.log(`❌ ${req.method} ${req.path} → ${service} (500)`);

      if (axios.isAxiosError(error)) {
        const axiosError = error as any;
        if (axiosError.response) {
          res.status(axiosError.response.status).json(axiosError.response.data);
        } else {
          res.status(500).json({
            error: "Service Error",
            message: "Erreur de communication avec le service",
            service: service,
          });
        }
      } else {
        res.status(500).json({
          error: "Internal Server Error",
          message: "Erreur interne du serveur",
        });
      }
    }
  });
});

// ===== GESTION DES ERREURS =====
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: "Route non trouvée",
    path: req.path,
  });
});

// ===== DÉMARRAGE DU SERVEUR =====
app.listen(PORT, () => {
  console.log("╔════════════════════════════════════════╗");
  console.log("║   🚀 API GATEWAY - ULTRA SIMPLE v1.0   ║");
  console.log("╚════════════════════════════════════════╝");
  console.log("");
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(
    `🔧 Mode: ${
      isDevelopment ? "DEVELOPMENT (localhost)" : "DOCKER (containers)"
    }`
  );
  console.log(`🔗 Auth Service: ${SERVICES.auth}`);
  console.log("");
});
