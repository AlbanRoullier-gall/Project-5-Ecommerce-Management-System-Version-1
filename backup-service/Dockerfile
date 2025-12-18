# =====================================================
# DOCKERFILE - SERVICE DE BACKUP AUTOMATIQUE
# Service de backup avec cron pour bases de données PostgreSQL
# =====================================================

FROM postgres:15

# Installer cron et outils nécessaires
RUN apt-get update && \
    apt-get install -y \
    cron \
    bash \
    gzip \
    tar \
    && rm -rf /var/lib/apt/lists/*

# Créer le répertoire de travail
WORKDIR /app

# Copier les scripts de backup
COPY backup-service/backup.sh /app/backup.sh
COPY backup-service/restore.sh /app/restore.sh
COPY backup-service/scripts /app/scripts

# Rendre les scripts exécutables
RUN chmod +x /app/backup.sh /app/restore.sh /app/scripts/*.sh

# Créer le répertoire de backups
RUN mkdir -p /backups && chmod 755 /backups

# Copier le crontab
COPY backup-service/crontab /etc/cron.d/backup-cron

# Donner les permissions au crontab
RUN chmod 0644 /etc/cron.d/backup-cron && \
    crontab /etc/cron.d/backup-cron

# Créer le script d'entrypoint
COPY backup-service/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Exposer le volume de backups
VOLUME ["/backups"]

# Point d'entrée
ENTRYPOINT ["/app/entrypoint.sh"]

# Commande par défaut (démarre cron)
CMD ["cron", "-f"]
