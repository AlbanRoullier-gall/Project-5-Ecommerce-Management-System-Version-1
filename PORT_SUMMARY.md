# Référentiel des Ports - Architecture E-commerce

## 📋 **Vue d'ensemble de l'architecture**

Cette documentation présente la configuration complète des ports pour l'architecture microservices de la plateforme e-commerce.

### 🏗️ **Architecture des ports**

- **Services applicatifs** : Ports 13000-13010 (externes)
- **Bases de données** : Ports 15432-15439 (externes)
- **Cache Redis** : Port 16379 (externe)
- **Ports internes** : 3000-3008 pour les services, 5432 pour PostgreSQL, 6379 pour Redis

---

## 🔌 **Services Applicatifs**

### **API Gateway** - Point d'entrée principal

- **Port externe** : `13000`
- **Port interne** : `3000`
- **URL** : `http://localhost:13000`
- **Fonction** : Proxy central vers tous les microservices
- **TypeScript** : ✅ Migré vers TypeScript

### **Microservices Backend**

| Service              | Port Externe | Port Interne | URL                      | Fonction              |
| -------------------- | ------------ | ------------ | ------------------------ | --------------------- |
| **Customer Service** | 13001        | 3001         | `http://localhost:13001` | Gestion des clients   |
| **Product Service**  | 13002        | 3002         | `http://localhost:13002` | Gestion des produits  |
| **Order Service**    | 13003        | 3003         | `http://localhost:13003` | Gestion des commandes |
| **Cart Service**     | 13004        | 3004         | `http://localhost:13004` | Gestion du panier     |
| **Website Content**  | 13005        | 3005         | `http://localhost:13005` | Contenu du site       |
| **Payment Service**  | 13006        | 3006         | `http://localhost:13006` | Gestion des paiements |
| **Email Service**    | 13007        | 3007         | `http://localhost:13007` | Envoi d'emails        |
| **Auth Service**     | 13008        | 3008         | `http://localhost:13008` | Authentification      |

### **Interfaces Utilisateur**

| Interface      | Port Externe | Port Interne | URL                      | Fonction         |
| -------------- | ------------ | ------------ | ------------------------ | ---------------- |
| **Frontend**   | 13010        | 3000         | `http://localhost:13010` | Interface client |
| **Backoffice** | 13009        | 3000         | `http://localhost:13009` | Interface admin  |

---

## 🗄️ **Bases de Données**

### **PostgreSQL - Bases de données métier**

| Base de données | Port Externe | Port Interne | URL de connexion                                                                |
| --------------- | ------------ | ------------ | ------------------------------------------------------------------------------- |
| **Customer DB** | 15432        | 5432         | `postgresql://customer_user:customer_password@localhost:15432/customer_db`      |
| **Product DB**  | 15433        | 5432         | `postgresql://product_user:product_password@localhost:15433/product_db`         |
| **Order DB**    | 15434        | 5432         | `postgresql://order_user:order_password@localhost:15434/order_db`               |
| **Cart DB**     | 15435        | 5432         | `postgresql://cart_user:cart_password@localhost:15435/cart_db`                  |
| **Content DB**  | 15436        | 5432         | `postgresql://content_user:content_password@localhost:15436/website_content_db` |
| **Payment DB**  | 15437        | 5432         | `postgresql://payment_user:payment_password@localhost:15437/payment_db`         |
| **Email DB**    | 15438        | 5432         | `postgresql://email_user:email_password@localhost:15438/email_db`               |
| **Auth DB**     | 15439        | 5432         | `postgresql://auth_user:auth_password@localhost:15439/auth_db`                  |

### **Redis - Cache et sessions**

| Service   | Port Externe | Port Interne | URL de connexion          |
| --------- | ------------ | ------------ | ------------------------- |
| **Redis** | 16379        | 6379         | `redis://localhost:16379` |

---

## 🔗 **Communication Inter-Services**

### **URLs de communication (Docker Compose)**

```yaml
# Communication interne entre conteneurs
AUTH_SERVICE_URL=http://auth-service:3008
PRODUCT_SERVICE_URL=http://product-service:3002
EMAIL_SERVICE_URL=http://email-service:3007
CUSTOMER_SERVICE_URL=http://customer-service:3001
ORDER_SERVICE_URL=http://order-service:3003
CART_SERVICE_URL=http://cart-service:3004
WEBSITE_CONTENT_SERVICE_URL=http://website-content-service:3005
PAYMENT_SERVICE_URL=http://payment-service:3006
```

### **URLs de communication (Développement local)**

```typescript
// API Gateway - Configuration des services
const SERVICE_URLS = {
  EMAIL: "http://localhost:13007",
  PRODUCT: "http://localhost:13002",
  AUTH: "http://localhost:13008",
};
```

---

## 🚀 **Commandes de Démarrage**

### **Développement**

```bash
# Démarrer tous les services
docker-compose -f docker-compose.dev.yml up

# Démarrer un service spécifique
docker-compose -f docker-compose.dev.yml up api-gateway

# Démarrer en arrière-plan
docker-compose -f docker-compose.dev.yml up -d
```

### **Production**

```bash
# Démarrer tous les services
docker-compose up

# Démarrer avec rebuild
docker-compose up --build
```

---

## 🧪 **Tests et Vérification**

### **Health Checks**

```bash
# API Gateway
curl http://localhost:13000/health

# Services backend
curl http://localhost:13001/health  # Customer
curl http://localhost:13002/health  # Product
curl http://localhost:13003/health  # Order
curl http://localhost:13004/health  # Cart
curl http://localhost:13005/health  # Website Content
curl http://localhost:13006/health  # Payment
curl http://localhost:13007/health  # Email
curl http://localhost:13008/health  # Auth

# Interfaces utilisateur
curl http://localhost:13009/health  # Backoffice
curl http://localhost:13010/health  # Frontend
```

### **Scripts de vérification**

```bash
# Vérifier tous les ports
./scripts/verify-ports.sh

# Tester l'API Gateway TypeScript
./scripts/test-api-gateway-typescript.sh

# Test d'intégration complet
./scripts/test-dev.sh
```

---

## 📊 **Résumé des Ports**

### **Ports Externes (Accès depuis l'extérieur)**

| Plage           | Usage                       | Exemples                             |
| --------------- | --------------------------- | ------------------------------------ |
| **13000-13010** | Services applicatifs        | 13000 (API Gateway), 13008 (Auth)    |
| **15432-15439** | Bases de données PostgreSQL | 15432 (Customer DB), 15439 (Auth DB) |
| **16379**       | Redis Cache                 | 16379 (Redis)                        |

### **Ports Internes (Communication Docker)**

| Plage         | Usage                 | Exemples                        |
| ------------- | --------------------- | ------------------------------- |
| **3000-3008** | Services applicatifs  | 3000 (API Gateway), 3008 (Auth) |
| **5432**      | PostgreSQL (standard) | Toutes les bases de données     |
| **6379**      | Redis (standard)      | Cache et sessions               |

---

## 🔧 **Configuration des Variables d'Environnement**

### **Fichier `.env` recommandé**

```env
# API Gateway
API_GATEWAY_PORT=13000

# Services Backend
CUSTOMER_SERVICE_PORT=13001
PRODUCT_SERVICE_PORT=13002
ORDER_SERVICE_PORT=13003
CART_SERVICE_PORT=13004
WEBSITE_CONTENT_SERVICE_PORT=13005
PAYMENT_SERVICE_PORT=13006
EMAIL_SERVICE_PORT=13007
AUTH_SERVICE_PORT=13008

# Interfaces
FRONTEND_PORT=13010
BACKOFFICE_PORT=13009

# Bases de données
CUSTOMER_DB_PORT=15432
PRODUCT_DB_PORT=15433
ORDER_DB_PORT=15434
CART_DB_PORT=15435
CONTENT_DB_PORT=15436
PAYMENT_DB_PORT=15437
EMAIL_DB_PORT=15438
AUTH_DB_PORT=15439

# Cache
REDIS_PORT=16379
```

---

## 📝 **Notes Importantes**

### **Cohérence des Ports**

- ✅ Tous les ports externes suivent une logique claire (13000+)
- ✅ Aucun conflit de ports détecté
- ✅ Configuration identique entre dev et prod
- ✅ URLs cohérentes dans tout le code

### **Sécurité**

- 🔒 Ports internes non exposés à l'extérieur
- 🔒 Communication inter-services via Docker network
- 🔒 Bases de données accessibles uniquement via ports externes configurés

### **Maintenabilité**

- 📚 Documentation centralisée
- 🧪 Scripts de vérification automatique
- 🔄 Configuration versionnée dans Docker Compose
- 📊 Monitoring des health checks

---

**Ce référentiel est la source de vérité pour la configuration des ports de l'architecture e-commerce.**
