# ===== IMAGE DE BASE =====
FROM node:18-alpine

# ===== MÉTADONNÉES =====
LABEL maintainer="order-service"
LABEL description="Order Microservice with Auto-Migrations"
LABEL version="1.0.0"

# ===== CONFIGURATION DE L'ENVIRONNEMENT =====
WORKDIR /app

# ===== INSTALLATION DES DÉPENDANCES SYSTÈME =====
# Installation de curl pour les healthchecks
RUN apk add --no-cache curl

# ===== COPIE DES TYPES PARTAGÉS =====
# Copier les types partagés depuis la racine du projet
COPY shared-types/ ./shared-types/

# ===== GESTION DES DÉPENDANCES NODE.JS =====
# Copier les fichiers de configuration
COPY services/order-service/package*.json ./
COPY services/order-service/tsconfig.json ./

# Installer toutes les dépendances (dev + prod pour la compilation TypeScript)
RUN npm ci --only=production=false

# ===== COPIE DU CODE SOURCE =====
# Copier le code source TypeScript
COPY services/order-service/src/ ./src/

# ===== COMPILATION TYPESCRIPT =====
# Compiler le TypeScript vers JavaScript
RUN npm run build

# ===== COPIER LES FICHIERS SQL DE MIGRATION =====
# Les fichiers SQL ne sont pas copiés par TypeScript, il faut les copier manuellement
# Le code de migration utilise __dirname qui pointe vers dist/src/migrations/
RUN mkdir -p dist/src/migrations && \
    cp -r src/migrations/*.sql dist/src/migrations/ 2>/dev/null || (echo "Warning: No SQL files found in src/migrations/" && true)

# ===== OPTIMISATION DE L'IMAGE =====
# Supprimer les dépendances de développement pour réduire la taille
RUN npm prune --production

# ===== SÉCURITÉ =====
# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Changer la propriété du répertoire de l'application
RUN chown -R nodejs:nodejs /app
USER nodejs

# ===== CONFIGURATION DU RÉSEAU =====
EXPOSE 3003

# ===== HEALTHCHECK =====
# Vérification de santé du service
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3003/api/health || exit 1

# ===== COMMANDE DE DÉMARRAGE =====
# Le service exécute automatiquement les migrations au démarrage
CMD ["npm", "start"]
