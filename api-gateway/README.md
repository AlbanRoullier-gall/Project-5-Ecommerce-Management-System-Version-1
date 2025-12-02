# API Gateway - Architecture Modulaire v2.0

## 📁 Structure du Projet

```
src/
├── index.ts              # Point d'entrée principal
├── config.ts             # Configuration centralisée
├── auth.ts               # Module d'authentification
├── middleware.ts         # Middlewares globaux
├── core/                 # Cœur du système
│   ├── types.ts          # Types TypeScript pour la configuration
│   ├── proxy.ts          # Proxy générique simplifié
│   └── router.ts         # Router principal avec pipeline clair
├── routes/              # Configuration déclarative des routes
│   ├── simple/          # Routes proxy simples
│   │   └── index.ts    # Conversion automatique des anciennes routes
│   ├── orchestrated/    # Routes avec orchestration
│   │   └── index.ts    # Handlers custom (auth, payment, export)
│   ├── static/         # Routes statiques
│   │   └── index.ts    # Images, fichiers statiques
│   ├── index.ts        # Collection complète de toutes les routes
│   └── *.ts            # Définitions de routes par service (legacy)
├── handlers/            # Handlers spécialisés
│   ├── auth-handler.ts
│   ├── payment-handler.ts  # Orchestration création commande après paiement
│   └── export-handler.ts
```

## 🚀 Fonctionnalités

- **Architecture modulaire v2.0** : Configuration déclarative avec séparation claire des responsabilités
- **Router intelligent** : Pipeline clair et prévisible (Request → Middlewares → Handler)
- **Proxy générique** : Forwarding simplifié vers les microservices
- **Routes déclaratives** : Configuration TypeScript type-safe
- **Authentification JWT** : Gestion automatique des tokens pour les routes admin
- **Support upload** : Gestion automatique des uploads multipart/form-data
- **Routes orchestrées** : Handlers custom pour logique métier complexe
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

Les routes `/admin/*` nécessitent un token JWT valide dans un cookie httpOnly `auth_token`.
Le token est géré automatiquement par le navigateur et n'est pas accessible depuis JavaScript.

## 📊 Monitoring

- **Health Check** : `GET /api/health`
- **Info** : `GET /`

## 🛠️ Configuration

Variables d'environnement :

- `PORT` : Port du serveur (défaut: 3020)
- `JWT_SECRET` : Secret pour les tokens JWT
- `NODE_ENV` : Environnement (development/production)
- `DOCKER_ENV` : Indicateur Docker
