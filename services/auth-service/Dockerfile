# ===== IMAGE DE BASE =====
FROM node:18-alpine

# ===== MÉTADONNÉES =====
LABEL maintainer="auth-service"
LABEL description="Authentication Microservice with Auto-Migrations"
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
COPY services/auth-service/package*.json ./
COPY services/auth-service/tsconfig.json ./

# Installer toutes les dépendances (dev + prod pour la compilation TypeScript)
RUN npm ci --only=production=false

# ===== COPIE DU CODE SOURCE =====
# Copier le code source TypeScript
COPY services/auth-service/src/ ./src/

# ===== COMPILATION TYPESCRIPT =====
# Compiler le TypeScript vers JavaScript avec affichage des erreurs
RUN echo "=== Building TypeScript ===" && npm run build 2>&1 | tee /tmp/build.log || (echo "Build failed! Log:" && cat /tmp/build.log && exit 1)

# ===== VÉRIFICATION DU BUILD =====
# Vérifier que le build a créé les fichiers (TypeScript préserve la structure, donc dist/src/index.js)
RUN echo "=== Checking dist folder ===" && ls -la dist/ && echo "=== Files in dist ===" && find dist/ -type f | head -10
RUN test -f dist/src/index.js || (echo "ERROR: dist/src/index.js not found!" && echo "Files in dist/src:" && ls -la dist/src/ 2>/dev/null || echo "dist/src/ does not exist" && exit 1)

# ===== COPIER LES FICHIERS SQL DE MIGRATION =====
# Les fichiers SQL ne sont pas copiés par TypeScript, il faut les copier manuellement
# Le code de migration utilise __dirname qui pointe vers dist/src/migrations/
RUN echo "=== Copying SQL migration files ===" && \
    mkdir -p dist/src/migrations && \
    ls -la src/migrations/*.sql 2>/dev/null | head -5 && \
    cp src/migrations/*.sql dist/src/migrations/ && \
    echo "=== SQL files copied ===" && \
    ls -la dist/src/migrations/*.sql 2>/dev/null | head -5 || \
    (echo "ERROR: Failed to copy SQL files!" && exit 1)

# ===== OPTIMISATION DE L'IMAGE =====
# Supprimer les dépendances de développement pour réduire la taille
# IMPORTANT: Ne pas supprimer dist/ avec npm prune
RUN npm prune --production

# ===== SÉCURITÉ =====
# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Changer la propriété du répertoire de l'application
RUN chown -R nodejs:nodejs /app
USER nodejs

# ===== CONFIGURATION DU RÉSEAU =====
EXPOSE 3008

# ===== HEALTHCHECK =====
# Vérification de santé du service
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3008/api/health || exit 1

# ===== COMMANDE DE DÉMARRAGE =====
# Le service exécute automatiquement les migrations au démarrage
CMD ["npm", "start"]
