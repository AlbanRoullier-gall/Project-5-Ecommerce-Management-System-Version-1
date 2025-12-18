#!/bin/bash

# =====================================================
# ENTRYPOINT - SERVICE DE BACKUP
# Démarre cron et configure l'environnement
# =====================================================

set -e

echo "🚀 Démarrage du service de backup automatique"
echo "📅 Date: $(date)"
echo ""

# Créer le répertoire de backups s'il n'existe pas
mkdir -p /backups
chmod 755 /backups

# Configurer BACKUP_BASE_DIR pour les scripts
export BACKUP_BASE_DIR=/backups

# Afficher la configuration
echo "📁 Répertoire de backups: $BACKUP_BASE_DIR"
echo "⏰ Rétention: ${BACKUP_RETENTION_DAYS:-7} jours"
echo ""

# Vérifier que les outils sont disponibles
if ! command -v pg_dump &> /dev/null; then
    echo "❌ pg_dump n'est pas disponible"
    exit 1
fi

if ! command -v cron &> /dev/null; then
    echo "❌ cron n'est pas disponible"
    exit 1
fi

# Afficher la configuration cron
echo "📋 Configuration cron:"
cat /etc/cron.d/backup-cron
echo ""

# Créer le fichier de log
touch /var/log/backup.log
chmod 666 /var/log/backup.log

# Démarrer cron en mode foreground
echo "✅ Service de backup prêt"
echo "🔄 Cron démarré en mode foreground"
echo ""

exec "$@"
