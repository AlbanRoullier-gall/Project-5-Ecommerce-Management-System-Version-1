# Portail E-commerce - Nature de Pierre

## 🏗️ Architecture Microservices

Ce projet est une plateforme e-commerce complète construite avec une architecture microservices, incluant :

### 🛍️ Frontend
- **Frontend Client** (Next.js) - Interface utilisateur
- **Back Office Admin** (Next.js) - Interface d'administration

### 🔧 Services Backend
- **API Gateway** - Point d'entrée unique
- **Customer Service** - Gestion des clients
- **Product Service** - Gestion des produits
- **Order Service** - Gestion des commandes
- **Cart Service** - Gestion du panier
- **Payment Service** - Gestion des paiements
- **Email Service** - Envoi d'emails et notifications
- **Website Content Service** - Gestion du contenu

### 🗄️ Infrastructure
- **PostgreSQL** - Base de données pour chaque service
- **Redis** - Cache et stockage de session
- **Docker** - Containerisation
- **Docker Compose** - Orchestration des services

## 🚀 Démarrage Rapide

### Prérequis
- Docker & Docker Compose
- Node.js 18+
- npm ou yarn

### Installation

1. **Cloner le repository**
```bash
git clone <votre-repo-gitlab>
cd PORTAIL\ ECOMMERCE2
```

2. **Démarrer en mode développement**
```bash
./scripts/dev.sh
```

3. **Accéder aux interfaces**
- Frontend Client: http://localhost:13008
- Back Office: http://localhost:13009
- API Gateway: http://localhost:13000

## 📧 Système de Contact

Le système de contact est entièrement fonctionnel avec :
- ✅ Formulaire de contact sur le frontend
- ✅ Envoi d'emails automatiques
- ✅ Confirmation de réception pour les clients
- ✅ Templates HTML professionnels

## 🛠️ Développement

### Services disponibles
- API Gateway: http://localhost:13000
- Customer Service: http://localhost:13001
- Product Service: http://localhost:13002
- Order Service: http://localhost:13003
- Cart Service: http://localhost:13004
- Website Content Service: http://localhost:13005
- Payment Service: http://localhost:13006
- Email Service: http://localhost:13007

### Commandes utiles
```bash
# Démarrer tous les services
./scripts/dev.sh

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f

# Arrêter les services
docker-compose -f docker-compose.dev.yml down

# Reconstruire un service
docker-compose -f docker-compose.dev.yml build <service-name>
```

## 📁 Structure du Projet

```
├── api-gateway/           # Point d'entrée API
├── frontend/             # Interface client
├── backoffice/           # Interface admin
├── services/             # Microservices
│   ├── customer-service/
│   ├── product-service/
│   ├── order-service/
│   ├── cart-service/
│   ├── payment-service/
│   ├── email-service/
│   └── website-content-service/
├── shared-types/         # Types TypeScript partagés
├── scripts/             # Scripts de déploiement
└── docker-compose.dev.yml
```

## 🔧 Configuration

Les variables d'environnement sont configurées dans `docker-compose.dev.yml` :
- URLs des services
- Configuration des bases de données
- Clés API (Stripe, Gmail, etc.)

## 📝 License

Projet privé - Nature de Pierre