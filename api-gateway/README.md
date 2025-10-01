# 🚪 API Gateway - E-commerce Platform (Version Simplifiée)

Point d'entrée centralisé pour tous les microservices de la plateforme e-commerce.

## 🎯 Architecture Ultra-Simplifiée

### Structure du projet

```
api-gateway/
├── src/
│   ├── clients/
│   │   └── ServiceClient.ts    # Proxy HTTP vers les services
│   ├── config/
│   │   └── services.config.ts  # Configuration des services
│   ├── routes/
│   │   └── index.ts            # Routing automatique
│   └── index.ts                # Point d'entrée
├── package.json
└── tsconfig.json
```

**4 fichiers TypeScript seulement !** 🎉

## 🔌 Services connectés

| Service                     | Port  | Description                     |
| --------------------------- | ----- | ------------------------------- |
| **auth-service**            | 13008 | Authentification & utilisateurs |
| **customer-service**        | 13001 | Gestion clients                 |
| **product-service**         | 13002 | Produits & catégories           |
| **order-service**           | 13003 | Commandes                       |
| **cart-service**            | 13004 | Panier                          |
| **website-content-service** | 13005 | Contenu du site                 |
| **payment-service**         | 13006 | Paiements Stripe                |
| **email-service**           | 13007 | Envoi d'emails                  |

## 🚀 Démarrage rapide

```bash
# Installation
npm install

# Développement
npm run dev

# Production
npm run build
npm start
```

## 📡 Endpoints

### Health Checks

```
GET /api/health              # Gateway status
GET /api/health/services     # All services status
```

### Routes automatiquement proxifiées

Toutes les requêtes sont automatiquement routées vers le bon service :

```
/api/auth/*           → auth-service
/api/products/*       → product-service
/api/orders/*         → order-service
/api/cart/*           → cart-service
/api/customers/*      → customer-service
/api/payments/*       → payment-service
/api/contact/*        → email-service
/api/content/*        → website-content-service
```

### Exemples

```bash
# Connexion
POST /api/auth/login
Body: { "email": "user@test.com", "password": "123456" }

# Récupérer les produits
GET /api/products?page=1&limit=10

# Ajouter au panier
POST /api/cart/items
Body: { "productId": 1, "quantity": 2 }

# Créer une commande
POST /api/orders
Body: { "items": [...], "shippingAddress": {...} }
```

## 🛠️ Comment ça fonctionne ?

### 1. Routing automatique

Le fichier `routes/index.ts` contient un simple mapping :

```typescript
const SERVICE_ROUTES = {
  "/auth": "auth",
  "/products": "product",
  "/orders": "order",
  // ...
};
```

Chaque route est automatiquement proxifiée vers le service correspondant.

### 2. ServiceClient

La classe `ServiceClient` :

- Maintient un client Axios par service (pré-configuré au démarrage)
- Transmet les requêtes avec headers, body, query params
- Gère les erreurs (timeout, service down, erreurs HTTP)
- Retourne les réponses au client

### 3. Flux d'une requête

```
Client → API Gateway (port 3000)
         ↓
    routes/index.ts (identifie le service)
         ↓
    ServiceClient.proxy()
         ↓
    Axios → Microservice (ex: port 13008)
         ↓
    Réponse ← Microservice
         ↓
Client ← API Gateway
```

## ⚙️ Configuration

### Variables d'environnement (.env)

```bash
PORT=3000
NODE_ENV=development

# URLs des services (optionnel, défauts : localhost:130XX)
AUTH_SERVICE_URL=http://localhost:13008
PRODUCT_SERVICE_URL=http://localhost:13002
ORDER_SERVICE_URL=http://localhost:13003
# ...
```

### Personnalisation

**Ajouter un nouveau service :**

1. Ajoutez-le dans `config/services.config.ts` :

```typescript
const SERVICES = {
  // ...
  monNouveauService: { port: 13009 },
};
```

2. Ajoutez la route dans `routes/index.ts` :

```typescript
const SERVICE_ROUTES = {
  // ...
  "/mon-service": "monNouveauService",
};
```

C'est tout ! ✅

## 🔒 Sécurité

- ✅ **Helmet** : Headers de sécurité HTTP
- ✅ **CORS** : Configuré pour frontend/backoffice
- ✅ **Timeouts** : 30s par défaut, 45s pour orders/payments
- ✅ **Error handling** : Pas de fuite d'informations sensibles

## 📊 Gestion des erreurs

Le ServiceClient gère automatiquement :

| Erreur                     | Code HTTP | Description              |
| -------------------------- | --------- | ------------------------ |
| Service répond avec erreur | 4xx/5xx   | Retransmise telle quelle |
| Timeout                    | 504       | Gateway Timeout          |
| Service inaccessible       | 503       | Service Unavailable      |
| Erreur inconnue            | 500       | Internal Server Error    |

## 🧪 Tests

```bash
# Tester le health check
curl http://localhost:3000/api/health

# Tester le status des services
curl http://localhost:3000/api/health/services

# Tester un proxy (exemple avec auth)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

## 📈 Performance

- **Démarrage** : ~1 seconde
- **Latency overhead** : < 5ms (juste le proxy)
- **Mémoire** : ~50MB (Node.js + Express + Axios)
- **Concurrence** : Limité par Node.js event loop

## 🎓 Pourquoi cette architecture ?

**Avantages :**

- ✅ Point d'entrée unique (simplifie le déploiement)
- ✅ Gestion centralisée des erreurs
- ✅ CORS et sécurité centralisés
- ✅ Facile à monitorer (un seul point)
- ✅ Simplifie le frontend (1 seule URL)

**Quand l'utiliser :**

- Plusieurs microservices à orchestrer
- Frontend/mobile qui consomme les APIs
- Besoin de cacher la complexité interne

## 📝 Logs

En mode développement, chaque requête est loguée :

```
✅ POST /auth/login → auth (200) - 245ms
❌ GET /products → product (404) - 123ms
⏱️  POST /orders → order TIMEOUT - 30001ms
🔌 GET /payments → payment UNREACHABLE - 50ms
```

## 🚧 Limitations

- Pas de rate limiting (à ajouter si nécessaire)
- Pas de cache (chaque requête = appel au service)
- Pas d'authentification centralisée (délégué aux services)
- Pas de load balancing (1 instance par service)

## 📚 Documentation

- **Architecture complète** : Voir [SIMPLIFICATION.md](./SIMPLIFICATION.md)
- **Comparaison avant/après** : Voir [SIMPLIFICATION.md](./SIMPLIFICATION.md)

## 🤝 Contribution

Pour modifier l'API Gateway :

1. Modifiez le code dans `src/`
2. Testez avec `npm run dev`
3. Compilez avec `npm run build`
4. Committez les changements

## 📞 Support

En cas de problème :

1. Vérifiez que tous les services sont démarrés
2. Consultez les logs du gateway
3. Testez le endpoint `/api/health/services`

---

**Version** : 2.0.0-simplified  
**Dernière mise à jour** : Octobre 2025
