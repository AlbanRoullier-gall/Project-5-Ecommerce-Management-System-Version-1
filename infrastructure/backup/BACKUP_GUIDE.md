# 🗄️ Guide du Système de Backup - Bases de Données Microservices

## 📋 Vue d'ensemble

Ce système de backup est spécialement adapté pour sauvegarder **toutes les 4 bases de données PostgreSQL** de votre architecture microservices e-commerce.

### **🎯 Bases de Données Sauvegardées**

| Service                     | Base de Données      | Conteneur Docker                  | Utilisateur     |
| --------------------------- | -------------------- | --------------------------------- | --------------- |
| **Customer Service**        | `customer_db`        | `portailecommerce2-customer-db-1` | `customer_user` |
| **Product Service**         | `product_db`         | `portailecommerce2-product-db-1`  | `product_user`  |
| **Order Service**           | `order_db`           | `portailecommerce2-order-db-1`    | `order_user`    |
| **Website Content Service** | `website_content_db` | `portailecommerce2-content-db-1`  | `content_user`  |

## 🚀 Utilisation Rapide

### **1. Test du Système**

Avant d'utiliser le système de backup, testez-le :

```bash
cd infrastructure/backup
./test-backup.sh
```

Ce script vérifie :

- ✅ Docker est en cours d'exécution
- ✅ Tous les conteneurs PostgreSQL sont actifs
- ✅ Connexion aux bases de données
- ✅ Permissions de backup

### **2. Créer un Backup**

```bash
./backup-docker.sh
```

**Ce qui se passe :**

- 📦 Sauvegarde des 4 bases PostgreSQL
- 📁 Création d'un répertoire avec timestamp
- 🗜️ Archive complète (tar.gz)
- 🧹 Nettoyage automatique (garde 5 backups)
- ✅ Vérification de l'intégrité

### **3. Lister les Backups**

```bash
./restore-docker.sh --list
```

### **4. Restaurer un Backup**

```bash
# Restaurer un backup spécifique
./restore-docker.sh ./backups/20250922_140933

# Restaurer en mode force (écrase les données)
./restore-docker.sh --force ./backups/20250922_140933
```

### **5. Vérifier les Backups**

```bash
./verify-backup.sh
```

## 🔧 Scripts Disponibles

| Script                 | Description             | Utilisation                |
| ---------------------- | ----------------------- | -------------------------- |
| `test-backup.sh`       | Test complet du système | Diagnostic et vérification |
| `backup-docker.sh`     | Créer un backup complet | Sauvegarde des 4 bases     |
| `restore-docker.sh`    | Restaurer un backup     | Restauration avec options  |
| `verify-backup.sh`     | Vérifier l'intégrité    | Validation des backups     |
| `detect-containers.sh` | Détecter les conteneurs | Diagnostic Docker          |

## 📁 Structure des Backups

```
infrastructure/backup/backups/
├── 20250922_140933/                    # Backup avec timestamp
│   ├── customer_db_20250922_140933.sql
│   ├── product_db_20250922_140933.sql
│   ├── order_db_20250922_140933.sql
│   ├── website_content_db_20250922_140933.sql
│   └── microservices_backup_20250922_140933.tar.gz
└── 20250922_135038/                    # Backup précédent
    └── ...
```

## ⚙️ Configuration

### **Noms des Conteneurs**

Le système détecte automatiquement les conteneurs avec le préfixe `portailecommerce2-*-db-1`.

Si les noms changent, utilisez :

```bash
./detect-containers.sh
```

### **Variables d'Environnement**

Les scripts utilisent les informations de connexion définies dans `docker-compose.dev.yml` :

```yaml
environment:
  - POSTGRES_DB=customer_db
  - POSTGRES_USER=customer_user
  - POSTGRES_PASSWORD=customer_password
```

## 🔄 Workflow Recommandé

### **Backup Quotidien**

```bash
# 1. Tester le système
./test-backup.sh

# 2. Créer le backup
./backup-docker.sh

# 3. Vérifier l'intégrité
./verify-backup.sh
```

### **Avant un Déploiement**

```bash
# 1. Backup de sécurité
./backup-docker.sh

# 2. Lister les backups
./restore-docker.sh --list

# 3. Noter le timestamp du backup
```

### **Après un Problème**

```bash
# 1. Lister les backups disponibles
./restore-docker.sh --list

# 2. Restaurer le backup le plus récent
./restore-docker.sh ./backups/20250922_140933

# 3. Redémarrer les services
docker-compose restart
```

## 🚨 Dépannage

### **Conteneurs Non Détectés**

```bash
# Vérifier que Docker Compose est démarré
docker-compose ps

# Démarrer les services
docker-compose up -d

# Redémarrer le test
./test-backup.sh
```

### **Erreurs de Connexion**

```bash
# Vérifier les logs des conteneurs
docker-compose logs customer-db

# Vérifier les variables d'environnement
docker exec portailecommerce2-customer-db-1 env | grep POSTGRES
```

### **Permissions Insuffisantes**

```bash
# Vérifier les permissions des scripts
ls -la *.sh

# Rendre exécutables si nécessaire
chmod +x *.sh
```

## 📊 Monitoring

### **Vérification Régulière**

```bash
# Test complet hebdomadaire
./test-backup.sh

# Vérification des backups
./verify-backup.sh

# Nettoyage automatique (garde 5 backups)
```

### **Logs et Historique**

Les scripts génèrent des logs détaillés avec :

- ✅ Statut de chaque opération
- 📊 Taille des fichiers créés
- ⏱️ Temps d'exécution
- 🔍 Messages d'erreur détaillés

## 🔒 Sécurité

### **Stockage des Backups**

- 📁 Backups stockés localement dans `./backups/`
- 🔐 Utilisation des mots de passe Docker Compose
- 🗜️ Compression pour réduire l'espace disque
- 🧹 Nettoyage automatique des anciens backups

### **Restauration Sécurisée**

- ⚠️ Mode `--force` pour écraser les données
- ✅ Vérification de l'intégrité avant restauration
- 🔍 Validation des conteneurs actifs

## 💡 Conseils

1. **Testez régulièrement** : Utilisez `./test-backup.sh` avant chaque backup important
2. **Vérifiez les logs** : Les scripts fournissent des informations détaillées
3. **Gardez plusieurs backups** : Le système garde automatiquement 5 backups
4. **Documentez les restaurations** : Notez quand et pourquoi vous restaurez
5. **Surveillez l'espace disque** : Les backups peuvent prendre de l'espace

## 🆘 Support

En cas de problème :

1. **Exécutez le test** : `./test-backup.sh`
2. **Vérifiez les logs** : `docker-compose logs`
3. **Consultez la documentation** : `infrastructure/README.md`
4. **Utilisez la détection** : `./detect-containers.sh`

---

> **💡 Note :** Ce système est optimisé pour votre architecture microservices avec 4 bases PostgreSQL distinctes. Il s'adapte automatiquement aux noms de conteneurs Docker Compose.
