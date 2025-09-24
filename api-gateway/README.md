# API Gateway - TypeScript

Point d'entrée central pour toutes les requêtes de l'application e-commerce, entièrement migré vers TypeScript.

## 🚀 Fonctionnalités

- **Proxy intelligent** vers les microservices (Auth, Product, Email)
- **Validation des données** avec types stricts
- **Type safety** complet avec les types partagés
- **Gestion d'erreurs** robuste
- **Sécurité** avec Helmet et CORS

## 📁 Structure

```
api-gateway/
├── src/
│   ├── index.ts              # Point d'entrée principal
│   ├── types.ts              # Types partagés (copie locale)
│   └── middlewares/
│       └── validation.ts     # Middlewares de validation
├── dist/                     # Code JavaScript compilé
├── tsconfig.json             # Configuration TypeScript
└── package.json              # Dépendances
```

## 🛠️ Scripts disponibles

```bash
# Développement avec rechargement automatique
npm run dev

# Compilation TypeScript
npm run build

# Compilation en mode watch
npm run build:watch

# Démarrage en production
npm start
```

## 🔧 Configuration

### Variables d'environnement

```env
PORT=3000
AUTH_SERVICE_URL=http://localhost:13008
PRODUCT_SERVICE_URL=http://localhost:13002
EMAIL_SERVICE_URL=http://localhost:13007
```

### Services proxifiés

- **Auth Service** (port 3008) : Authentification et gestion des utilisateurs
- **Product Service** (port 13002) : Gestion des produits et catégories
- **Email Service** (port 13007) : Envoi d'emails de contact

## 📋 Routes disponibles

### Authentification

- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/profile` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour profil
- `POST /api/auth/logout` - Déconnexion

### Produits

- `GET /api/admin/products` - Liste des produits
- `POST /api/admin/products` - Création produit
- `PUT /api/admin/products/:id` - Mise à jour produit
- `DELETE /api/admin/products/:id` - Suppression produit

### Catégories

- `GET /api/admin/categories` - Liste des catégories
- `POST /api/admin/categories` - Création catégorie
- `PUT /api/admin/categories/:id` - Mise à jour catégorie
- `DELETE /api/admin/categories/:id` - Suppression catégorie

### Contact

- `POST /api/contact` - Envoi de message de contact

## 🔍 Validation

Toutes les routes sont protégées par des middlewares de validation TypeScript qui vérifient :

- Format des emails
- Longueur des mots de passe
- Types des données (string, number, etc.)
- Champs obligatoires

## 🚀 Démarrage rapide

```bash
# Installation des dépendances
npm install

# Développement
npm run dev

# Production
npm run build
npm start
```

## 📝 Types partagés

L'API Gateway utilise les types partagés de l'application pour assurer la cohérence entre les services et les frontends.
