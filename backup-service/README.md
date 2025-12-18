# 🗄️ Système de Backup Unifié

Système de backup automatique des bases de données PostgreSQL fonctionnant en **développement (Docker)** et **production (Railway)**.

## ✨ Caractéristiques

- ✅ **Unifié** : Même code pour dev et prod
- ✅ **Auto-détection** : Détecte automatiquement l'environnement
- ✅ **Automatique** : Backup quotidien via cron
- ✅ **Compression** : Backups compressés automatiquement
- ✅ **Rotation** : Nettoyage automatique des anciens backups
- ✅ **Vérification** : Vérification de l'intégrité des backups

## 📁 Structure

```
backup-service/
├── Dockerfile                   # Image Docker avec cron et pg_dump
├── entrypoint.sh                # Script de démarrage du service
├── crontab                      # Configuration cron
├── backup.sh                    # Script de backup unifié
├── restore.sh                   # Script de restauration unifié
├── scripts/
│   ├── common.sh               # Fonctions communes
│   └── detect-databases.sh    # Détection auto des bases
├── backups/                     # Répertoire des backups (créé automatiquement)
└── README.md                    # Cette documentation
```

## 🚀 Utilisation

### Backup manuel

```bash
# Depuis le conteneur Docker
docker-compose exec backup-service /app/backup.sh

# Ou depuis l'hôte (si scripts accessibles)
./backup-service/backup.sh

# Backup avec type spécifique
./backup-service/backup.sh daily
./backup-service/backup.sh weekly
```

### Restauration

```bash
# Lister les backups disponibles
docker-compose exec backup-service /app/restore.sh --list

# Restaurer un backup spécifique
docker-compose exec backup-service /app/restore.sh /backups/20250118_020000

# Restaurer avec force (écrase les données)
docker-compose exec backup-service /app/restore.sh --force /backups/20250118_020000
```

## 🔧 Configuration

### Variables d'environnement

- `BACKUP_BASE_DIR` : Répertoire de stockage des backups (défaut: `/backups` dans le conteneur)
- `BACKUP_RETENTION_DAYS` : Nombre de jours de rétention (défaut: `7`)

### Détection automatique

Le système détecte automatiquement les bases de données :

1. **Production (Railway)** : Utilise les variables `DATABASE_URL_*` ou `DATABASE_URL`
2. **Développement (Docker)** : Détecte depuis les conteneurs Docker Compose
3. **Fallback** : Détecte depuis les conteneurs PostgreSQL directement

## 🐳 Service Docker avec Cron

Le service `backup-service` dans `docker-compose.dev.yml` exécute automatiquement :

- **Backup quotidien** : Tous les jours à 2h du matin
- **Backup hebdomadaire** : Tous les dimanches à 3h
- **Nettoyage** : Tous les jours à 4h

### Démarrer le service

```bash
docker-compose -f docker-compose.dev.yml up -d backup-service
```

### Voir les logs

```bash
docker-compose -f docker-compose.dev.yml logs -f backup-service
```

### Tester manuellement

```bash
# Tester la détection des bases
docker-compose exec backup-service /app/scripts/detect-databases.sh

# Backup manuel
docker-compose exec backup-service /app/backup.sh
```

## 📊 Bases de données sauvegardées

- `customer_db` (Customer Service)
- `product_db` (Product Service)
- `order_db` (Order Service)
- `auth_db` (Auth Service)

## 🔒 Sécurité

- Les credentials sont lus depuis les variables d'environnement
- Les backups sont stockés localement (dev) ou sur volume Railway (prod)
- Compression automatique pour réduire l'espace disque
- Rotation automatique pour éviter le débordement

## 🆘 Dépannage

### Backup échoue

1. Vérifier que les bases de données sont accessibles
2. Vérifier les logs : `docker-compose logs backup-service`
3. Tester manuellement : `docker-compose exec backup-service /app/backup.sh`

### Bases non détectées

1. Vérifier les variables d'environnement
2. Vérifier que Docker est en cours d'exécution (dev)
3. Exécuter : `docker-compose exec backup-service /app/scripts/detect-databases.sh`

### Restauration échoue

1. Vérifier que le backup existe et est valide
2. Vérifier les permissions d'accès à la base
3. Utiliser `--force` si nécessaire (attention : écrase les données)

## 📝 Notes

- Les backups sont compressés automatiquement (`.sql.gz`)
- Les archives complètes sont créées (`.tar.gz`)
- Le système garde automatiquement les 7 derniers backups (configurable)
- Les logs sont disponibles dans `/var/log/backup.log` (dans le conteneur)
