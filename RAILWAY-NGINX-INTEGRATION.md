# 🌐 Intégration Nginx + Redis dans Railway - Guide

Ce guide vous explique comment intégrer nginx comme point d'entrée unique et configurer Redis pour l'API Gateway dans votre architecture Railway existante.

## 📋 Prérequis

- ✅ Tous les services backend déployés (auth, customer, product, order, cart, payment, email, pdf-export)
- ✅ API Gateway déployé
- ✅ Frontend et Backoffice déployés
- ✅ Redis créé dans Railway
- ✅ Domaines configurés (optionnel, pour production)

---

## 🔧 Étape 1 : Mettre à jour l'API Gateway avec Redis

### 1.1 Variables d'environnement à ajouter/modifier dans l'API Gateway

Allez dans votre service **API Gateway** sur Railway → **Settings** → **Variables**

**Variables à ajouter/modifier :**

```bash
# Redis (déjà présent mais vérifiez)
REDIS_URL=${{Redis.REDIS_URL}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}

# Rate Limiting (ACTIVER en production)
RATE_LIMIT_GLOBAL_ENABLED=true
RATE_LIMIT_GLOBAL_WINDOW_MS=900000
RATE_LIMIT_GLOBAL_MAX_REQUESTS=200

RATE_LIMIT_AUTH_LOGIN_ENABLED=true
RATE_LIMIT_AUTH_LOGIN_WINDOW_MS=900000
RATE_LIMIT_AUTH_LOGIN_MAX_REQUESTS=5

RATE_LIMIT_PAYMENT_ENABLED=true
RATE_LIMIT_PAYMENT_WINDOW_MS=60000
RATE_LIMIT_PAYMENT_MAX_REQUESTS=10

RATE_LIMIT_ADMIN_ENABLED=true
RATE_LIMIT_ADMIN_WINDOW_MS=60000
RATE_LIMIT_ADMIN_MAX_REQUESTS=50

# CORS (mettre à jour avec vos domaines nginx)
ALLOWED_ORIGINS=https://VOTRE-DOMAINE-NGINX.up.railway.app,https://admin.VOTRE-DOMAINE-NGINX.up.railway.app
CORS_CREDENTIALS=true
```

**⚠️ Important :** Remplacez `VOTRE-DOMAINE-NGINX` par le domaine que vous obtiendrez à l'étape 2.4

---

## 🌐 Étape 2 : Créer le service Nginx

### 2.1 Créer le service

1. Dans Railway, cliquez sur **"+ New"** → **"GitHub Repo"**
2. Sélectionnez votre repository : `Project-5-Ecommerce-Management-System-Version-1`
3. Allez dans **Settings** → **Source** :

   - **Root Directory** : (vide - racine du projet)
   - **Dockerfile Path** : `nginx/Dockerfile.railway` (pour utiliser la config Railway)

   **OU** si vous avez des domaines personnalisés :

   - **Dockerfile Path** : `nginx/Dockerfile` (utilise routing.conf avec domaines personnalisés)

### 2.2 Variables d'environnement

Allez dans **Settings** → **Variables** et ajoutez :

```bash
# URLs des services (Railway Private Networking)
FRONTEND_URL=http://frontend.railway.internal:3000
BACKOFFICE_URL=http://backoffice.railway.internal:3000
API_GATEWAY_URL=http://api-gateway.railway.internal:3020
```

**⚠️ IMPORTANT :**

- Remplacez `frontend`, `backoffice`, et `api-gateway` par les **noms exacts** de vos services dans Railway
- Les noms de services dans Railway sont sensibles à la casse
- Utilisez le format `service-name.railway.internal:port` pour Railway Private Networking
- **Ces variables sont OBLIGATOIRES** - nginx ne démarrera pas si elles ne sont pas définies
- Le Dockerfile utilise `envsubst` pour remplacer les variables avant le démarrage de nginx

### 2.3 Configuration des domaines dans nginx

La configuration nginx (`nginx/conf.d/routing.conf`) utilise des variables d'environnement pour les domaines.

**⚠️ IMPORTANT :** Le fichier `routing.conf` est configuré pour des domaines personnalisés avec routing par domaine (`monsite.com` pour frontend, `admin.monsite.com` pour backoffice).

**Pour utiliser des domaines Railway générés automatiquement :**

Si vous utilisez les domaines Railway (`.up.railway.app`), vous devez modifier `routing.conf` pour utiliser un seul `server` block avec `server_name _;` et un routing par chemin (`/` pour frontend, `/admin` pour backoffice).

```nginx
# Configuration de routing pour Railway (domaines générés)
# Utilise un seul domaine avec des chemins différents

# Zone de rate limiting : 200 requêtes / 15 minutes par IP
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=13r/m;

# Upstream pour Frontend Next.js
upstream frontend {
    server ${FRONTEND_URL:-frontend:3000};
}

# Upstream pour Backoffice Next.js
upstream backoffice {
    server ${BACKOFFICE_URL:-backoffice:3000};
}

# Upstream pour API Gateway
upstream api_gateway {
    server ${API_GATEWAY_URL:-api-gateway:3020};
}

# Server block unique pour Railway
server {
    listen 80;
    server_name _;  # Accepte tous les domaines

    # Headers pour transmettre l'IP réelle
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Health check sans rate limiting
    location /api/health {
        proxy_pass http://api_gateway;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # Routes pour les images uploadées (sans rate limiting)
    location /uploads/ {
        proxy_pass http://api_gateway;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # Assets Next.js du backoffice
    location /admin/_next/ {
        rewrite ^/admin/_next/(.*)$ /_next/$1 break;
        proxy_pass http://backoffice;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # Routes Backoffice (chemin /admin)
    location /admin/ {
        rewrite ^/admin(.*)$ $1 break;
        proxy_pass http://backoffice;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # Redirection de /admin vers /admin/
    location = /admin {
        return 301 /admin/;
    }

    # Redirection de /auth vers /admin/auth
    location = /auth {
        return 301 /admin/auth/login;
    }

    location /auth/ {
        rewrite ^/auth(.*)$ /admin/auth$1 permanent;
    }

    # Routes API vers API Gateway avec rate limiting
    location /api/ {
        limit_req zone=api_limit burst=50 nodelay;
        proxy_pass http://api_gateway;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # Toutes les autres routes vers Frontend Next.js
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Option B : Utiliser des domaines personnalisés (production)**

Si vous avez des domaines personnalisés (`monsite.com` et `admin.monsite.com`), utilisez le **Dockerfile Path** : `nginx/Dockerfile`

Ce Dockerfile utilise `routing.conf` qui est configuré pour :

- Routing par domaine (`monsite.com` → frontend, `admin.monsite.com` → backoffice)
- Configuration SSL/HTTPS gérée par Railway

**Pour configurer les domaines personnalisés :**

1. Dans Railway → Settings → Networking
2. Ajoutez vos domaines personnalisés
3. Configurez vos DNS pour pointer vers Railway

### 2.4 Générer le domaine public

1. Allez dans **Settings** → **Networking**
2. Cliquez sur **"Generate Domain"**
3. **Copiez l'URL** (ex: `nginx-production-abc123.up.railway.app`)

---

## 🔄 Étape 3 : Mettre à jour les services Frontend et Backoffice

### 3.1 Frontend

Allez dans votre service **Frontend** → **Settings** → **Variables**

**Modifier :**

```bash
NEXT_PUBLIC_API_URL=https://VOTRE-DOMAINE-NGINX.up.railway.app
```

Remplacez `VOTRE-DOMAINE-NGINX` par le domaine nginx obtenu à l'étape 2.4

### 3.2 Backoffice

Allez dans votre service **Backoffice** → **Settings** → **Variables**

**Modifier :**

```bash
NEXT_PUBLIC_API_URL=https://VOTRE-DOMAINE-NGINX.up.railway.app
```

Remplacez `VOTRE-DOMAINE-NGINX` par le domaine nginx obtenu à l'étape 2.4

---

## 🔐 Étape 4 : Mettre à jour CORS dans l'API Gateway

Allez dans votre service **API Gateway** → **Settings** → **Variables**

**Mettre à jour `ALLOWED_ORIGINS` :**

```bash
ALLOWED_ORIGINS=https://VOTRE-DOMAINE-NGINX.up.railway.app
```

Remplacez `VOTRE-DOMAINE-NGINX` par le domaine nginx obtenu à l'étape 2.4

**Note :** Si vous utilisez des domaines personnalisés plus tard, ajoutez-les aussi :

```bash
ALLOWED_ORIGINS=https://VOTRE-DOMAINE-NGINX.up.railway.app,https://monsite.com,https://www.monsite.com,https://admin.monsite.com
```

---

## 📝 Étape 5 : Mettre à jour le Dockerfile nginx (si nécessaire)

Si vous voulez utiliser la configuration Railway au lieu de la configuration par domaine, vous devez modifier le Dockerfile nginx.

**Option A : Utiliser routing.conf existant (domaines personnalisés)**

Le Dockerfile actuel utilise déjà `routing.conf`, donc pas de modification nécessaire si vous utilisez des domaines personnalisés.

**Option B : Utiliser routing-railway.conf (domaines Railway générés)**

**Note :** Le `Dockerfile` actuel utilise `routing.conf` qui est configuré pour des domaines personnalisés. Si vous utilisez des domaines Railway générés, modifiez `routing.conf` comme indiqué ci-dessus.

---

## ✅ Checklist de Configuration

- [ ] Redis créé dans Railway
- [ ] Variables Redis ajoutées dans l'API Gateway
- [ ] Rate limiting activé dans l'API Gateway
- [ ] Service nginx créé avec les bonnes variables d'environnement
- [ ] Noms de services dans `FRONTEND_URL`, `BACKOFFICE_URL`, `API_GATEWAY_URL` correspondent aux noms exacts dans Railway
- [ ] Domaine nginx généré et copié
- [ ] `NEXT_PUBLIC_API_URL` mis à jour dans Frontend et Backoffice
- [ ] `ALLOWED_ORIGINS` mis à jour dans l'API Gateway
- [ ] Tous les services redéployés

---

## 🧪 Tests

1. **Test du Frontend via nginx** : `https://VOTRE-DOMAINE-NGINX.up.railway.app`
2. **Test du Backoffice via nginx** : `https://VOTRE-DOMAINE-NGINX.up.railway.app/admin`
3. **Test de l'API via nginx** : `https://VOTRE-DOMAINE-NGINX.up.railway.app/api/health`
4. **Test des images** : `https://VOTRE-DOMAINE-NGINX.up.railway.app/uploads/products/...`

---

## 🔍 Vérification des Noms de Services Railway

Pour trouver les noms exacts de vos services dans Railway :

1. Allez dans votre projet Railway
2. Regardez la liste des services
3. Les noms affichés sont les noms à utiliser dans `service-name.railway.internal`

**Exemple :**

- Si votre service s'appelle "Frontend Production" dans Railway, le nom interne est probablement `frontend-production` ou `frontend-production-abc123`
- Utilisez ce nom exact dans les variables d'environnement nginx

---

## ⚠️ Points Importants

1. **Railway Private Networking** : Les services communiquent via `service-name.railway.internal`, pas via des URLs publiques
2. **Noms de services** : Les noms doivent correspondre exactement (sensible à la casse)
3. **Ports** : Utilisez les ports internes (3000, 3020, etc.), pas les ports externes
4. **Redéploiement** : Après modification des variables, Railway redéploie automatiquement
5. **Rate Limiting** : Maintenant géré par nginx ET l'API Gateway (double couche)

---

## 🐛 Dépannage

### Problème : Nginx ne peut pas se connecter aux services

**Solution :**

- Vérifiez que les noms de services dans les variables d'environnement nginx correspondent exactement aux noms dans Railway
- Vérifiez les logs nginx : `Service → Deployments → View Logs`

### Problème : 502 Bad Gateway

**Solution :**

- Vérifiez que tous les services (frontend, backoffice, api-gateway) sont démarrés
- Vérifiez les variables d'environnement nginx
- Vérifiez que les ports sont corrects (3000 pour frontend/backoffice, 3020 pour api-gateway)

### Problème : Rate limiting toujours actif

**Solution :**

- Vérifiez que `RATE_LIMIT_GLOBAL_ENABLED=true` dans l'API Gateway
- Vérifiez les logs Redis pour voir si la connexion fonctionne
- Vérifiez que Redis est bien créé et accessible

---

## 📚 Architecture Finale

```
Internet
   ↓
Nginx (Point d'entrée unique)
   ├── / → Frontend
   ├── /admin → Backoffice
   ├── /api → API Gateway
   └── /uploads → API Gateway → Product Service

API Gateway
   ├── Redis (Rate Limiting)
   └── Routes vers tous les services backend
```

---

**Bon déploiement ! 🚂**
