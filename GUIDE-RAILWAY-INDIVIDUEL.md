# 🚂 Guide Railway - Déploiement Simplifié

Guide simple pour déployer votre projet TFE sur Railway.

---

## ⚠️ IMPORTANT : Structure du projet

Votre projet a une structure monorepo avec :

- `shared-types/` : Types partagés entre tous les services (OBLIGATOIRE)
- `services/` : Services backend
- `api-gateway/` : API Gateway
- `frontend/` : Frontend Next.js
- `backoffice/` : Backoffice Next.js

**Les Dockerfiles sont conçus pour builder depuis la racine du projet.**

---

## 📋 Étape 1 : Bases de données (Déjà fait ✅)

- ✅ PostgreSQL créé avec les 4 databases (auth_db, customer_db, product_db, order_db)
- ✅ Redis créé

---

## 🚀 Étape 2 : Créer les services backend

**Pour chaque service, répétez ces étapes :**

1. Cliquez sur **"+ New"** → **"GitHub Repo"**
2. Sélectionnez : `Project-5-Ecommerce-Management-System-Version-1`
3. Allez dans **"Settings"** → **"Source"**
4. **Root Directory** : **LAISSEZ VIDE** (pour utiliser la racine du projet)
5. **Dockerfile Path** : (voir ci-dessous pour chaque service)
6. Allez dans **"Settings"** → **"Variables"** et ajoutez les variables (voir ci-dessous)

---

### 2.1 Auth Service

- **Root Directory** : (vide - racine du projet)
- **Dockerfile Path** : `services/auth-service/Dockerfile`
- **Variables** :

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
PGDATABASE=auth_db
JWT_SECRET=votre-secret-jwt-changez-moi
PORT=3008
```

**Important :** Remplacez `${{Postgres.DATABASE_URL}}` par l'URL complète avec le nom de la database. Exemple : `postgresql://user:pass@host:port/auth_db`

### 2.2 Customer Service

- **Root Directory** : (vide - racine du projet)
- **Dockerfile Path** : `services/customer-service/Dockerfile`
- **Variables** :

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}/customer_db
JWT_SECRET=votre-secret-jwt-changez-moi
PORT=3001
```

### 2.3 Product Service

- **Root Directory** : (vide - racine du projet)
- **Dockerfile Path** : `services/product-service/Dockerfile`
- **Variables** :

```
NODE_ENV=production
DOCKER_ENV=true
DATABASE_URL=${{Postgres.DATABASE_URL}}/product_db
JWT_SECRET=votre-secret-jwt-changez-moi
PORT=3002
```

### 2.4 Order Service

- **Root Directory** : (vide - racine du projet)
- **Dockerfile Path** : `services/order-service/Dockerfile`
- **Variables** :

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}/order_db
JWT_SECRET=votre-secret-jwt-changez-moi
STRIPE_SECRET_KEY=sk_test_51RtjchLi6vN59MNetUhP86QSndKeI5GfJCMseKO8dSq4D93k0td4AZyJ5d4SiKTveQh9pThKaj9d9MyzpTEuoFdU00ZW6qtK90
PORT=3003
```

### 2.5 Cart Service

- **Root Directory** : (vide - racine du projet)
- **Dockerfile Path** : `services/cart-service/Dockerfile`
- **Variables** :

```
NODE_ENV=production
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=votre-secret-jwt-changez-moi
PORT=3004
```

### 2.6 Payment Service

- **Root Directory** : (vide - racine du projet)
- **Dockerfile Path** : `services/payment-service/Dockerfile`
- **Variables** :

```
NODE_ENV=production
STRIPE_SECRET_KEY=sk_test_51RtjchLi6vN59MNetUhP86QSndKeI5GfJCMseKO8dSq4D93k0td4AZyJ5d4SiKTveQh9pThKaj9d9MyzpTEuoFdU00ZW6qtK90
STRIPE_PUBLISHABLE_KEY=pk_test_51RtjchLi6vN59MNe1w9bJlC4Gg2Pnuti0Oub3RRuh4QFVPmh77ZE9oOmL3ewA6vnB2NvWjSizIup9gq9Y6pyTmdV00xFVugPSe
JWT_SECRET=votre-secret-jwt-changez-moi
PORT=3007
```

### 2.7 Email Service

- **Root Directory** : (vide - racine du projet)
- **Dockerfile Path** : `services/email-service/Dockerfile`
- **Variables** :

```
NODE_ENV=production
GMAIL_USER=u4999410740@gmail.com
GMAIL_APP_PASSWORD=vyli fdmp hrww jvlz
ADMIN_EMAIL=u4999410740@gmail.com
JWT_SECRET=votre-secret-jwt-changez-moi
PORT=3006
```

### 2.8 PDF Export Service

- **Root Directory** : (vide - racine du projet)
- **Dockerfile Path** : `services/pdf-export-service/Dockerfile`
- **Variables** :

```
NODE_ENV=production
PORT=3040
```

---

## 🌐 Étape 3 : API Gateway

1. **"+ New"** → **"GitHub Repo"** → même repository
2. **Settings** → **Source** :
   - **Root Directory** : (vide - racine du projet)
   - **Dockerfile Path** : `api-gateway/Dockerfile`
3. **Settings** → **Variables** :

```
NODE_ENV=production
DOCKER_ENV=true
JWT_SECRET=votre-secret-jwt-changez-moi
CUSTOMER_SERVICE_URL=http://customer-service:3001
PRODUCT_SERVICE_URL=http://product-service:3002
ORDER_SERVICE_URL=http://order-service:3003
CART_SERVICE_URL=http://cart-service:3004
AUTH_SERVICE_URL=http://auth-service:3008
PAYMENT_SERVICE_URL=http://payment-service:3007
EMAIL_SERVICE_URL=http://email-service:3006
PDF_EXPORT_SERVICE_URL=http://pdf-export-service:3040
REDIS_URL=${{Redis.REDIS_URL}}
PORT=3020
```

4. **Settings** → **Networking** → **"Generate Domain"** (copiez l'URL, vous en aurez besoin)

**⚠️ IMPORTANT CORS :** Après avoir créé le Frontend et le Backoffice (étapes 4 et 5), vous devrez revenir ici et ajouter la variable `ALLOWED_ORIGINS` avec les URLs de vos frontend et backoffice (voir étape 6)

---

## 🎨 Étape 4 : Frontend

1. **"+ New"** → **"GitHub Repo"** → même repository
2. **Settings** → **Source** :
   - **Root Directory** : (vide - racine du projet)
   - **Dockerfile Path** : `frontend/Dockerfile`
3. **Settings** → **Variables** :

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://VOTRE-API-GATEWAY-DOMAINE.up.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RtjchLi6vN59MNe1w9bJlC4Gg2Pnuti0Oub3RRuh4QFVPmh77ZE9oOmL3ewA6vnB2NvWjSizIup9gq9Y6pyTmdV00xFVugPSe
PORT=3000
```

**Important :** Remplacez `VOTRE-API-GATEWAY-DOMAINE` par le vrai domaine de votre API Gateway (étape 3.4) 4. **Settings** → **Networking** → **"Generate Domain"**

---

## 🔧 Étape 5 : Backoffice

1. **"+ New"** → **"GitHub Repo"** → même repository
2. **Settings** → **Source** :
   - **Root Directory** : (vide - racine du projet)
   - **Dockerfile Path** : `backoffice/Dockerfile`
3. **Settings** → **Variables** :

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://VOTRE-API-GATEWAY-DOMAINE.up.railway.app
PORT=3000
```

**Important :** Remplacez `VOTRE-API-GATEWAY-DOMAINE` par le vrai domaine de votre API Gateway

4. **Settings** → **Networking** → **"Generate Domain"** (copiez l'URL, vous en aurez besoin)

---

## 🔐 Étape 6 : Configuration CORS (OBLIGATOIRE)

**Après avoir créé le Frontend et le Backoffice**, vous devez configurer CORS dans l'API Gateway pour autoriser les requêtes depuis vos frontends.

1. Allez dans votre service **API Gateway** sur Railway
2. **Settings** → **Variables**
3. Ajoutez la variable suivante :

```
ALLOWED_ORIGINS=https://VOTRE-FRONTEND-DOMAINE.up.railway.app,https://VOTRE-BACKOFFICE-DOMAINE.up.railway.app
```

**Important :**

- Remplacez `VOTRE-FRONTEND-DOMAINE` par le vrai domaine de votre Frontend (étape 4)
- Remplacez `VOTRE-BACKOFFICE-DOMAINE` par le vrai domaine de votre Backoffice (étape 5)
- Les URLs doivent commencer par `https://`
- Séparez les URLs par une virgule (sans espaces ou avec espaces, les deux fonctionnent)

**Exemple :**

```
ALLOWED_ORIGINS=https://frontend-production-abc123.up.railway.app,https://backoffice-production-xyz789.up.railway.app
```

4. Sauvegardez les variables (Railway redéploiera automatiquement)

**⚠️ Sans cette configuration, vous aurez des erreurs CORS (Preflight response is not successful. Status code: 500)**

---

## ⚠️ Points importants

### Root Directory dans Railway

**CRUCIAL :** Pour tous les services, le **Root Directory** doit être **VIDE** (ou `/`).

Cela permet à Railway de builder depuis la racine du projet, ce qui est nécessaire car :

- Les Dockerfiles copient `shared-types/` depuis la racine
- Les Dockerfiles copient `services/auth-service/` depuis la racine
- Tous les chemins dans les Dockerfiles sont relatifs à la racine

### Ordre de création (recommandé) :

1. ✅ Bases de données (déjà fait)
2. Services backend (auth, customer, product, order, cart, payment, email, pdf-export)
3. API Gateway
4. Frontend et Backoffice

### Variables Railway :

- `${{Postgres.DATABASE_URL}}` : URL PostgreSQL (ajoutez `/nom_db` à la fin)
- `${{Redis.REDIS_URL}}` : URL Redis
- Les services communiquent entre eux via leur nom : `http://service-name:port`

### JWT_SECRET :

Utilisez le **même** `JWT_SECRET` pour tous les services. Générez-en un avec :

```bash
openssl rand -base64 32
```

### Fichiers nécessaires dans GitHub :

Assurez-vous que ces dossiers sont bien dans votre repository GitHub :

- ✅ `shared-types/` (OBLIGATOIRE - utilisé par tous les services)
- ✅ `services/`
- ✅ `api-gateway/`
- ✅ `frontend/`
- ✅ `backoffice/`

---

## 🎯 Version simplifiée pour TFE

Pour votre démo, vous pouvez déployer uniquement :

- Frontend + Backoffice + API Gateway
- Auth Service + Product Service + Order Service
- PostgreSQL + Redis

Les autres services peuvent être mockés.

---

## ✅ Checklist finale

- [ ] Tous les services backend créés avec **Root Directory vide**
- [ ] API Gateway créé avec domaine public
- [ ] Frontend créé avec `NEXT_PUBLIC_API_URL` configuré
- [ ] Backoffice créé avec `NEXT_PUBLIC_API_URL` configuré
- [ ] Tous les domaines publics générés
- [ ] **ALLOWED_ORIGINS configuré dans l'API Gateway** (étape 6 - OBLIGATOIRE)
- [ ] URLs testées

---

## 🆘 En cas de problème

1. **Service ne démarre pas** : Vérifiez les logs (Service → Deployments → View Logs)
2. **Erreur "shared-types not found"** : Vérifiez que Root Directory est vide et que shared-types est dans GitHub
3. **Erreur de connexion DB** : Vérifiez que `${{Postgres.DATABASE_URL}}/nom_db` est correct
4. **Frontend ne trouve pas l'API** : Vérifiez que `NEXT_PUBLIC_API_URL` pointe vers le bon domaine (avec `https://`)
5. **Erreur TypeScript lors du build** : Vérifiez que `shared-types` est bien présent dans le repository GitHub
6. **Erreur CORS "Preflight response is not successful. Status code: 500"** :
   - Vérifiez que `ALLOWED_ORIGINS` est configuré dans l'API Gateway (étape 6)
   - Vérifiez que les URLs dans `ALLOWED_ORIGINS` correspondent exactement aux domaines de votre Frontend et Backoffice
   - Les URLs doivent commencer par `https://`
   - Après modification, attendez le redéploiement automatique

---

**Bon déploiement ! 🚂**
