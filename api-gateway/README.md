# API Gateway - Architecture Modulaire

## 📁 Structure du Projet

```
src/
├── index.ts              # Point d'entrée principal
├── config.ts             # Configuration centralisée
├── auth.ts               # Module d'authentification
├── proxy.ts              # Module de proxy vers les services
├── middleware.ts         # Middlewares globaux
├── routes-handler.ts     # Gestionnaire de routes
└── routes/                    # Routes organisées par service
    ├── index.ts               # Index des routes
    ├── auth-routes.ts         # Routes d'authentification
    ├── product-routes.ts      # Routes des produits
    ├── order-routes.ts        # Routes des commandes
    ├── cart-routes.ts         # Routes du panier
    ├── customer-routes.ts      # Routes des clients
    ├── payment-routes.ts      # Routes des paiements
    ├── email-routes.ts         # Routes des emails
    └── website-content-routes.ts # Routes du contenu du site
```

## 🚀 Fonctionnalités

- **Architecture modulaire** : Code organisé en modules séparés
- **Proxy intelligent** : Routage automatique vers les microservices
- **Authentification JWT** : Gestion des tokens pour les routes admin
- **Gestion d'erreurs** : Retour d'erreurs appropriées
- **Configuration flexible** : Support développement/Docker

## 🔧 Services Supportés

- **Auth Service** (port 3008) : Authentification et gestion des utilisateurs
- **Product Service** (port 3002) : Gestion des produits et catégories
- **Order Service** (port 3003) : Gestion des commandes
- **Cart Service** (port 3004) : Gestion des paniers
- **Customer Service** (port 3001) : Gestion des clients
- **Payment Service** (port 3007) : Gestion des paiements
- **Email Service** (port 3006) : Envoi d'emails
- **Website Content Service** (port 3005) : Contenu du site

## 📝 Utilisation

### Développement

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t api-gateway .
docker run -p 3020:3020 api-gateway
```

## 🔐 Authentification

Les routes `/admin/*` nécessitent un token JWT valide dans le header `Authorization: Bearer <token>`.

## 📊 Monitoring

- **Health Check** : `GET /api/health`
- **Info** : `GET /`

## 🛠️ Configuration

Variables d'environnement :

- `PORT` : Port du serveur (défaut: 3020)
- `JWT_SECRET` : Secret pour les tokens JWT
- `NODE_ENV` : Environnement (development/production)
- `DOCKER_ENV` : Indicateur Docker
