# API Gateway v2.0 - E-commerce Platform

## 🎯 Vue d'ensemble

API Gateway refactorisé avec une architecture modulaire, propre et maintenable. Ce gateway sert de point d'entrée unique pour tous les microservices de la plateforme e-commerce.

## 🏗️ Architecture

```
api-gateway/
├── src/
│   ├── index.ts                    # Point d'entrée (100 lignes)
│   ├── config/
│   │   └── services.config.ts      # Configuration centralisée
│   ├── clients/
│   │   └── ServiceClient.ts        # Client HTTP générique
│   ├── middlewares/
│   │   ├── errorHandler.ts         # Gestion d'erreurs
│   │   └── validation.ts           # Validation (existant)
│   ├── routes/
│   │   ├── index.ts                # Router principal
│   │   ├── auth.routes.ts          # Routes authentification
│   │   ├── products.routes.ts      # Routes produits
│   │   ├── orders.routes.ts        # Routes commandes
│   │   ├── cart.routes.ts          # Routes panier
│   │   ├── customers.routes.ts     # Routes clients
│   │   ├── payments.routes.ts      # Routes paiements
│   │   ├── email.routes.ts         # Routes emails
│   │   └── content.routes.ts       # Routes contenu web
│   ├── utils/
│   │   └── logger.ts               # Logger Winston
│   └── types/
│       └── index.ts                # Types TypeScript
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Fonctionnalités

### ✅ Implémenté

- **Architecture modulaire** : Séparation claire des responsabilités
- **ServiceClient générique** : Un seul client pour tous les services
- **Configuration centralisée** : Tous les services configurés dans un fichier
- **Routes modulaires** : Un fichier par domaine métier
- **Gestion d'erreurs centralisée** : Erreurs standardisées et cohérentes
- **Logging structuré** : Winston avec logs détaillés
- **Health checks** : Vérification de l'état de tous les services
- **Timeouts configurables** : Par service
- **TypeScript** : Typage complet

### 🔗 Services Connectés (8/8)

| Service                     | Port  | Description                      |
| --------------------------- | ----- | -------------------------------- |
| **auth-service**            | 13008 | Authentification et utilisateurs |
| **product-service**         | 13002 | Produits et catégories           |
| **order-service**           | 13003 | Gestion des commandes            |
| **cart-service**            | 13004 | Panier d'achat                   |
| **customer-service**        | 13001 | Données clients                  |
| **payment-service**         | 13006 | Paiements et Stripe              |
| **email-service**           | 13007 | Envoi d'emails                   |
| **website-content-service** | 13005 | Contenu du site                  |

## 📦 Installation

```bash
# Installer les dépendances
cd api-gateway
npm install

# Build TypeScript
npm run build

# Démarrer en mode développement
npm run dev

# Démarrer en production
npm start
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Gateway
PORT=3000
NODE_ENV=development
JWT_SECRET=your-jwt-secret-key
LOG_LEVEL=info

# Services URLs
AUTH_SERVICE_URL=http://localhost:13008
PRODUCT_SERVICE_URL=http://localhost:13002
ORDER_SERVICE_URL=http://localhost:13003
CART_SERVICE_URL=http://localhost:13004
CUSTOMER_SERVICE_URL=http://localhost:13001
PAYMENT_SERVICE_URL=http://localhost:13006
EMAIL_SERVICE_URL=http://localhost:13007
WEBSITE_CONTENT_SERVICE_URL=http://localhost:13005
```

## 📚 Endpoints

### Health & Info

- `GET /` - Informations de base
- `GET /api/health` - Health check du gateway
- `GET /api/health/services` - Health check de tous les services
- `GET /api/info` - Informations détaillées

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour profil
- `POST /api/auth/logout` - Déconnexion

### Produits

- `GET /api/products` - Liste des produits (public)
- `GET /api/products/:id` - Détail produit (public)
- `POST /api/admin/products` - Créer un produit
- `PUT /api/admin/products/:id` - Modifier un produit
- `DELETE /api/admin/products/:id` - Supprimer un produit

### Catégories

- `GET /api/categories` - Liste des catégories (public)
- `POST /api/admin/categories` - Créer une catégorie
- `PUT /api/admin/categories/:id` - Modifier une catégorie
- `DELETE /api/admin/categories/:id` - Supprimer une catégorie

### Commandes

- `GET /api/orders/my-orders` - Mes commandes
- `GET /api/orders/:id` - Détail commande
- `POST /api/orders` - Créer une commande
- `POST /api/orders/:id/cancel` - Annuler une commande

### Panier

- `GET /api/cart` - Récupérer le panier
- `POST /api/cart/items` - Ajouter un article
- `PUT /api/cart/items/:itemId` - Modifier quantité
- `DELETE /api/cart/items/:itemId` - Retirer un article

### Paiements

- `POST /api/payments/create-payment-intent` - Créer intention de paiement
- `POST /api/payments/confirm` - Confirmer un paiement
- `GET /api/payments/history` - Historique des paiements

### Clients

- `GET /api/customers/me` - Mes informations
- `PUT /api/customers/me` - Mettre à jour mes informations
- `GET /api/customers/me/addresses` - Mes adresses
- `POST /api/customers/me/addresses` - Ajouter une adresse

### Email

- `POST /api/contact` - Formulaire de contact

### Contenu Web

- `GET /api/content/pages` - Liste des pages
- `GET /api/content/pages/:slug` - Page par slug
- `GET /api/content/settings` - Paramètres du site

## 🔍 Gestion des Erreurs

### Erreurs Gérées

| Code    | Type                  | Description                       |
| ------- | --------------------- | --------------------------------- |
| **404** | Not Found             | Route non trouvée                 |
| **500** | Internal Server Error | Erreur interne du gateway         |
| **503** | Service Unavailable   | Service microservice indisponible |
| **504** | Gateway Timeout       | Timeout de communication          |

### Format des Erreurs

```json
{
  "error": "Service Unavailable",
  "message": "product-service is currently unavailable",
  "timestamp": "2025-10-01T10:30:00Z",
  "statusCode": 503
}
```

## 📊 Logging

### Niveaux de Log

- `error` : Erreurs critiques
- `warn` : Avertissements
- `info` : Informations importantes
- `debug` : Informations de débogage

### Exemple de Logs

```
2025-10-01 10:30:00 [info]: Request completed { method: 'GET', path: '/api/products', statusCode: 200, duration: '45ms', service: 'product-service' }

2025-10-01 10:31:00 [error]: Service communication error { service: 'order-service', endpoint: '/api/orders', error: 'ECONNREFUSED' }
```

## 🛠️ Développement

### Ajouter un Nouveau Service

1. **Ajouter la configuration** dans `config/services.config.ts` :

```typescript
export const servicesConfig: ServiceRegistry = {
  // ... services existants
  newService: {
    name: "new-service",
    url: process.env["NEW_SERVICE_URL"] || "http://localhost:13011",
    timeout: 30000,
    healthEndpoint: "/api/health",
  },
};
```

2. **Créer le fichier de routes** `routes/newservice.routes.ts` :

```typescript
import { Router, Request, Response } from "express";
import { serviceClient } from "../clients/ServiceClient";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  serviceClient.proxy("newService", req, res, "/endpoint");
});

export default router;
```

3. **Monter les routes** dans `routes/index.ts` :

```typescript
import newServiceRoutes from "./newservice.routes";

router.use("/newservice", newServiceRoutes);
```

4. **Mettre à jour les types** dans `types/index.ts` :

```typescript
export interface ServiceRegistry {
  // ... services existants
  newService: ServiceConfig;
}
```

C'est tout ! 🎉

## 📈 Métriques et Monitoring

### Health Checks

Endpoint `/api/health/services` retourne l'état de tous les services :

```json
{
  "status": "OK",
  "timestamp": "2025-10-01T10:30:00Z",
  "services": {
    "auth": true,
    "product": true,
    "order": true,
    "cart": false,
    "customer": true,
    "payment": true,
    "email": true,
    "websiteContent": true
  }
}
```

## 🔐 Sécurité

- **Helmet.js** : Protection contre les vulnérabilités courantes
- **CORS** : Configuration stricte des origines autorisées
- **Timeouts** : Protection contre les services lents
- **Validation** : Headers et body validés

## 🚧 Améliorations Futures (Optionnelles)

- [ ] Circuit Breaker (avec Opossum)
- [ ] Retry Mechanism (avec axios-retry)
- [ ] Rate Limiting (avec express-rate-limit)
- [ ] Métriques Prometheus
- [ ] Tracing distribué (avec Jaeger)
- [ ] Cache Redis
- [ ] API Versioning

## 📝 Changelog

### Version 2.0.0 (2025-10-01)

**✨ Refactoring Complet**

- ✅ Architecture modulaire avec séparation des responsabilités
- ✅ ServiceClient générique (remplacement de 3 fonctions dupliquées)
- ✅ Configuration centralisée des 8 services
- ✅ Routes modulaires par domaine
- ✅ Gestion d'erreurs centralisée et standardisée
- ✅ Logging structuré avec Winston
- ✅ Health checks pour tous les services
- ✅ Réduction de 580 lignes à ~100 lignes dans index.ts
- ✅ TypeScript avec typage complet
- ✅ Documentation complète

## 👥 Contribution

Pour contribuer :

1. Respecter l'architecture modulaire
2. Ajouter les types TypeScript
3. Documenter les nouveaux endpoints
4. Tester avec tous les services

## 📞 Support

Pour toute question ou problème, consultez la documentation ou contactez l'équipe de développement.

---

**Développé avec ❤️ par l'équipe E-commerce Platform**
