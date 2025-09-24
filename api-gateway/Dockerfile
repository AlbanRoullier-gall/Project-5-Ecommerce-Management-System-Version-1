# API Gateway - TypeScript (Production)
FROM node:18-alpine

# Installer curl pour les health checks
RUN apk add --no-cache curl

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./

# Installer toutes les dépendances
RUN npm ci

# Créer le répertoire pour les types partagés
RUN mkdir -p shared-types

# Copier le code source
COPY src/ ./src/

# Compiler TypeScript
RUN npm run build

# Supprimer les dépendances de développement
RUN npm prune --production

# Exposer le port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Commande de démarrage
CMD ["npm", "start"]
