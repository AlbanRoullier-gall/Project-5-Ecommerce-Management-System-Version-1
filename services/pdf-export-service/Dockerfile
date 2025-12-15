# ===== IMAGE DE BASE =====
FROM node:18-alpine

# ===== MÉTADONNÉES =====
LABEL maintainer="pdf-export-service"
LABEL description="PDF Export Service"
LABEL version="1.0.0"

# ===== CONFIGURATION DE L'ENVIRONNEMENT =====
WORKDIR /app

# ===== INSTALLATION DES DÉPENDANCES SYSTÈME =====
# Installation de curl pour les healthchecks
RUN apk add --no-cache curl

# Install dependencies needed for Puppeteer/Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to use the installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# ===== COPIE DES TYPES PARTAGÉS =====
# Copier les types partagés depuis la racine du projet
COPY shared-types/ ./shared-types/

# ===== GESTION DES DÉPENDANCES NODE.JS =====
# Copier les fichiers de configuration
COPY services/pdf-export-service/package*.json ./
COPY services/pdf-export-service/tsconfig.json ./

# Installer toutes les dépendances (dev + prod pour la compilation TypeScript)
RUN npm ci --only=production=false

# ===== COPIE DU CODE SOURCE =====
# Copier le code source TypeScript
COPY services/pdf-export-service/src/ ./src/

# ===== COMPILATION TYPESCRIPT =====
# Compiler le TypeScript vers JavaScript
RUN npm run build

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
EXPOSE 3040

# ===== HEALTHCHECK =====
# Vérification de santé du service
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3040/api/health || exit 1

# ===== COMMANDE DE DÉMARRAGE =====
CMD ["npm", "start"]
