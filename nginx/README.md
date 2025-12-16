# Configuration Nginx

Ce dossier contient les configurations nginx pour l'architecture microservices avec nginx comme point d'entrée unique.

## Structure

- `nginx.conf` : Configuration principale nginx
- `Dockerfile` : Image Docker pour nginx
- `conf.d/routing.conf` : Configuration de routing pour production (par domaine)
- `conf.d/routing.dev.conf` : Configuration de routing pour développement local
- `conf.d/rate-limiting.conf` : Documentation du rate limiting (intégré dans routing.conf)

## Architecture

Nginx sert de point d'entrée unique pour toute l'application :

### Production

- `monsite.com/` → Frontend Next.js
- `monsite.com/api/*` → API Gateway
- `admin.monsite.com/` → Backoffice Next.js
- `admin.monsite.com/api/*` → API Gateway

### Développement Local

- `localhost/` → Frontend Next.js
- `localhost/api/*` → API Gateway
- `localhost/admin` → Backoffice Next.js

## Rate Limiting

### Nginx (Réseau)

- **Limite** : 200 requêtes / 15 minutes par IP
- **Objectif** : Protection réseau, bloquer les attaques DDoS massives
- **Exclusion** : `/api/health` (pour monitoring Railway)
- **Performance** : Très rapide (nginx en C)

### API Gateway (Métier)

- **Global** : 100 requêtes / 15 minutes par IP
- **Auth Login** : 5 tentatives / 15 minutes par IP
- **Payment** : 10 requêtes / minute par utilisateur
- **Admin** : 50 requêtes / minute par utilisateur
- **Stockage** : Redis

## Variables d'Environnement

### Nginx (Docker Compose)

```
FRONTEND_URL=http://frontend:3000
BACKOFFICE_URL=http://backoffice:3000
API_GATEWAY_URL=http://api-gateway:3020
```

### API Gateway (Rate Limiting)

```
REDIS_URL=redis://redis:6379
RATE_LIMIT_GLOBAL_ENABLED=true
RATE_LIMIT_GLOBAL_WINDOW_MS=900000
RATE_LIMIT_GLOBAL_MAX_REQUESTS=100
RATE_LIMIT_AUTH_LOGIN_ENABLED=true
RATE_LIMIT_AUTH_LOGIN_WINDOW_MS=900000
RATE_LIMIT_AUTH_LOGIN_MAX_REQUESTS=5
RATE_LIMIT_PAYMENT_ENABLED=true
RATE_LIMIT_PAYMENT_WINDOW_MS=60000
RATE_LIMIT_PAYMENT_MAX_REQUESTS=10
RATE_LIMIT_ADMIN_ENABLED=true
RATE_LIMIT_ADMIN_WINDOW_MS=60000
RATE_LIMIT_ADMIN_MAX_REQUESTS=50
```

## Utilisation

### Développement Local

Le service nginx est ajouté dans `docker-compose.dev.yml` et utilise `routing.dev.conf`.

```bash
docker-compose up nginx
```

Accès :

- Frontend : http://localhost/
- Backoffice : http://localhost/admin (ou directement sur port 3009)
- API : http://localhost/api/\*

### Production (Railway)

1. Créer un service nginx sur Railway
2. Configurer les domaines personnalisés :
   - `monsite.com` → nginx service
   - `admin.monsite.com` → nginx service
3. Configurer les variables d'environnement (voir ci-dessus)
4. Utiliser `routing.conf` pour la production

## Avantages

1. ✅ **Séparation claire des responsabilités** : nginx = réseau, Next.js = pages, API Gateway = métier
2. ✅ **Double protection** : Rate limiting réseau (nginx) + métier (API Gateway)
3. ✅ **Point d'entrée unique** : Gestion simplifiée des domaines
4. ✅ **Meilleure performance** : Rate limiting réseau avant Node.js
5. ✅ **Architecture standard** : Pattern classique et professionnel
