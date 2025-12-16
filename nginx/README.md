# Configuration Nginx

Ce dossier contient les configurations nginx pour le développement local avec Docker Compose.

## Structure

- `nginx.conf` : Configuration principale nginx
- `Dockerfile` : Image Docker pour nginx
- `conf.d/routing.dev.conf` : Configuration de routing pour développement local

## Architecture

Nginx sert de point d'entrée unique pour toute l'application en développement local :

- `localhost/` → Frontend Next.js
- `localhost/api/*` → API Gateway
- `localhost/admin` → Backoffice Next.js

## Utilisation

Le service nginx est configuré dans `docker-compose.dev.yml` et utilise `routing.dev.conf` monté en volume.

```bash
docker-compose -f docker-compose.dev.yml up nginx
```

Ou pour démarrer tous les services :

```bash
docker-compose -f docker-compose.dev.yml up
```

Accès :

- Frontend : http://localhost/
- Backoffice : http://localhost/admin (ou directement sur port 3009)
- API : http://localhost/api/\*

## Variables d'Environnement

Le service nginx dans `docker-compose.dev.yml` utilise :

```
FRONTEND_URL=http://frontend:3000
BACKOFFICE_URL=http://backoffice:3009
API_GATEWAY_URL=http://api-gateway:3020
```

## Rate Limiting

Le rate limiting est géré par l'API Gateway (plus flexible et précis avec Redis) :

- **Global** : 100 requêtes / 15 minutes par IP
- **Auth Login** : 5 tentatives / 15 minutes par IP
- **Payment** : 10 requêtes / minute par utilisateur
- **Admin** : 50 requêtes / minute par utilisateur
- **Stockage** : Redis

## Avantages

1. ✅ **Séparation claire des responsabilités** : nginx = réseau, Next.js = pages, API Gateway = métier
2. ✅ **Point d'entrée unique** : Gestion simplifiée des routes
3. ✅ **Meilleure performance** : Reverse proxy avant Node.js
4. ✅ **Architecture standard** : Pattern classique et professionnel
