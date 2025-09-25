# API Gateway - Multi-stage build avec contexte partagé
# Étape 1 : Build
FROM node:18 AS builder
WORKDIR /app

# Copier shared-types depuis la racine du projet
COPY shared-types/ ./shared-types/

# Copier la configuration de l'api-gateway
COPY api-gateway/package*.json ./
COPY api-gateway/tsconfig.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY api-gateway/src/ ./src/

# Compiler TypeScript
RUN npm run build

# Étape 2 : Runtime
FROM node:18-alpine AS runtime

# Installer curl pour les health checks
RUN apk add --no-cache curl

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers compilés depuis l'étape builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared-types ./shared-types

# Copier package.json pour les dépendances de production
COPY api-gateway/package*.json ./

# Installer seulement les dépendances de production
RUN npm ci --only=production

# Exposer le port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Commande de démarrage
CMD ["node", "dist/src/index.js"]
