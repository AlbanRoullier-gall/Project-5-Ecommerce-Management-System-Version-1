# 🏗️ Infrastructure - Architecture Microservices E-commerce

Ce dossier contient l'infrastructure et la configuration pour l'architecture microservices e-commerce basée sur **Docker Compose**.

## 📁 Structure

```
infrastructure/
├── backup/                    # Système de backup/restore
│   ├── backup-docker.sh      # Backup adapté pour Docker
│   ├── restore-docker.sh     # Restauration avec options
│   ├── verify-backup.sh      # Vérification des backups
│   └── backups/              # Dossier des sauvegardes
├── env.example               # Variables d'environnement de référence
└── README.md                 # Ce fichier
```

## 🚀 Architecture Actuelle

Cette infrastructure est optimisée pour une **architecture microservices** avec **4 services métier** et leurs bases de données PostgreSQL dédiées (Customer, Product, Order, Website Content).

### **🐳 Docker Compose Services**

| Service                     | Port Externe | Port Interne | Base de Données | Port DB |
| --------------------------- | ------------ | ------------ | --------------- | ------- |
| **API Gateway**             | 13000        | 3000         | -               | -       |
| **Customer Service**        | 13001        | 3001         | customer-db     | 15432   |
| **Product Service**         | 13002        | 3002         | product-db      | 15433   |
| **Order Service**           | 13003        | 3003         | order-db        | 15434   |
| **Website Content Service** | 13005        | 3005         | content-db      | 15436   |
| **Redis**                   | 6379         | 6379         | -               | -       |

### **🗄️ Bases de Données PostgreSQL**

Chaque microservice a sa propre base de données PostgreSQL :

- **customer_db** : Données clients, adresses, entreprises
- **product_db** : Catalogue produits, catégories, images
- **order_db** : Commandes, factures, avoirs
- **website_content_db** : Contenu du site web

### **🎯 Avantages de l'Architecture**

- ✅ **Séparation des données** : Chaque service a sa propre base PostgreSQL
- ✅ **Isolation** : Utilisateurs et permissions séparés par service
- ✅ **Scalabilité** : Services indépendants et déployables séparément
- ✅ **Maintenance** : Backup et restauration par service
- ✅ **Sécurité** : Accès limité aux données par service
- ✅ **Performance** : Optimisation individuelle des bases de données

## 🔧 Configuration

### **Variables d'Environnement**

Copiez `env.example` vers `.env` et ajustez les valeurs :

```bash
cp infrastructure/env.example .env
```

### **Configuration Docker**

L'infrastructure utilise Docker Compose avec :

- **4 microservices** Node.js
- **4 bases PostgreSQL** (une par service)
- **1 Redis** pour le cache
- **Health checks** automatiques
- **Réseau Docker** interne

## 💾 Système de Backup

### **Backup Automatique**

```bash
# Sauvegarder toutes les bases de données
cd infrastructure/backup
./backup-docker.sh
```

**Fonctionnalités :**

- ✅ Backup de toutes les 4 bases PostgreSQL des services
- ✅ Archive complète (tar.gz)
- ✅ Nettoyage automatique des anciens backups
- ✅ Vérification de l'intégrité
- ✅ Détection automatique des conteneurs

### **Restauration**

```bash
# Lister les backups disponibles
./restore-docker.sh --list

# Restaurer un backup spécifique
./restore-docker.sh ./backups/20250922_135038

# Restaurer en mode force (écrase les données)
./restore-docker.sh --force ./backups/20250922_135038
```

### **Vérification**

```bash
# Vérifier tous les backups
./verify-backup.sh
```

### **Tests et Diagnostic**

```bash
# Tester le système de backup complet
./test-backup.sh

# Détecter automatiquement les conteneurs
./detect-containers.sh
```

## 🚀 Utilisation

### **Démarrage Complet**

```bash
# Démarrer tous les services
docker-compose -f docker-compose.dev.yml up -d

# Vérifier le statut
docker-compose -f docker-compose.dev.yml ps
```

### **Accès aux Services**

| Service                     | URL                    | Description                |
| --------------------------- | ---------------------- | -------------------------- |
| **API Gateway**             | http://localhost:13000 | Point d'entrée principal   |
| **Frontend**                | http://localhost:13008 | Interface utilisateur      |
| **Backoffice**              | http://localhost:13009 | Interface d'administration |
| **Customer Service**        | http://localhost:13001 | API clients                |
| **Product Service**         | http://localhost:13002 | API produits               |
| **Order Service**           | http://localhost:13003 | API commandes              |
| **Cart Service**            | http://localhost:13004 | API panier                 |
| **Website Content Service** | http://localhost:13005 | API contenu                |

### **Accès aux Bases de Données**

| Base                   | Host      | Port  | Utilisateur   | Mot de passe      |
| ---------------------- | --------- | ----- | ------------- | ----------------- |
| **customer_db**        | localhost | 15432 | customer_user | customer_password |
| **product_db**         | localhost | 15433 | product_user  | product_password  |
| **order_db**           | localhost | 15434 | order_user    | order_password    |
| **website_content_db** | localhost | 15436 | content_user  | content_password  |

## 🔍 Monitoring

### **Health Checks**

```bash
# Vérifier la santé des services
docker-compose -f docker-compose.dev.yml ps

# Logs en temps réel
docker-compose -f docker-compose.dev.yml logs -f

# Logs d'un service spécifique
docker-compose -f docker-compose.dev.yml logs -f customer-service
```

### **Métriques**

- **Connexions** : Chaque service expose `/health`
- **Logs** : Centralisés via Docker Compose
- **Performance** : Monitoring des bases PostgreSQL

## 🛠️ Maintenance

### **Backup Régulier**

```bash
# Backup quotidien (à automatiser avec cron)
cd infrastructure/backup
./backup-docker.sh
```

### **Nettoyage**

```bash
# Nettoyer les anciens backups
cd infrastructure/backup
./verify-backup.sh
```

### **Redémarrage**

```bash
# Redémarrer un service
docker-compose -f docker-compose.dev.yml restart customer-service

# Redémarrer toutes les bases de données
docker-compose -f docker-compose.dev.yml restart *-db
```

## 🔒 Sécurité

### **Configuration CORS**

Les services sont configurés pour accepter les connexions depuis :

- `http://localhost:13008` (Frontend)
- `http://localhost:13009` (Backoffice)
- `http://localhost:3000` (Développement)
- `http://localhost:3001` (Développement)

### **Authentification**

- **JWT** : Authentification centralisée
- **CORS** : Configuration sécurisée
- **Helmet** : Headers de sécurité

## 📊 Performance

### **Optimisations PostgreSQL**

- **Connexions** : 200 connexions max par base
- **Mémoire** : 256MB shared_buffers
- **Cache** : 1GB effective_cache_size
- **Logs** : Rotation automatique

### **Cache Redis**

- **Sessions** : Stockage des sessions utilisateur
- **Cache** : Mise en cache des requêtes fréquentes
- **Performance** : Réduction de la charge des bases

## 🆘 Dépannage

### **Services non démarrés**

```bash
# Vérifier les logs
docker-compose -f docker-compose.dev.yml logs

# Redémarrer un service
docker-compose -f docker-compose.dev.yml restart service-name
```

### **Bases de données inaccessibles**

```bash
# Vérifier la connectivité
docker exec -it portailecommerce2-customer-db-1 psql -U customer_user -d customer_db

# Vérifier les logs PostgreSQL
docker-compose -f docker-compose.dev.yml logs customer-db
```

### **Problèmes de backup**

```bash
# Vérifier les conteneurs
docker ps | grep postgres

# Tester la connectivité
cd infrastructure/backup
./verify-backup.sh
```

## 📝 Notes Importantes

1. **Architecture Microservices** : 4 services métier avec bases PostgreSQL dédiées (Customer, Product, Order, Website Content)
2. **Développement uniquement** : Cette configuration est optimisée pour le développement
3. **Production** : Pour la production, ajustez les paramètres de sécurité et performance
4. **Backup** : Système de backup automatisé pour les 4 bases de données
5. **Monitoring** : Surveillez les métriques de performance en continu
6. **Docker** : L'infrastructure est entièrement basée sur Docker Compose

## 🔗 Liens Utiles

- **Docker Compose** : https://docs.docker.com/compose/
- **PostgreSQL** : https://www.postgresql.org/docs/
- **Redis** : https://redis.io/documentation
- **Node.js** : https://nodejs.org/docs/

---

> **💡 Conseil :** Cette infrastructure est conçue pour le développement. Pour la production, consultez la documentation de déploiement et ajustez les paramètres de sécurité et performance.
