# 🚂 Guide Pas-à-Pas : Déploiement sur Railway

Guide complet et détaillé pour déployer votre projet TFE sur Railway.

---

## 📋 Étape 1 : Créer un compte Railway

1. **Allez sur** https://railway.app
2. **Cliquez sur** "Start a New Project" ou "Login"
3. **Connectez-vous avec GitHub** (recommandé)
   - Cliquez sur "Login with GitHub"
   - Autorisez Railway à accéder à vos repositories
4. **Ajoutez une carte bancaire** (obligatoire mais aucun frais si vous restez dans les limites)
   - Allez dans "Settings" → "Billing"
   - Ajoutez votre carte
   - **Important** : Vous avez 5$ de crédit gratuit/mois, largement suffisant pour 10 visites

---

## 📦 Étape 2 : Préparer votre projet sur GitHub

Assurez-vous que votre projet est sur GitHub :

```bash
# Si ce n'est pas déjà fait, initialisez git et poussez sur GitHub
cd /Users/albanroullier-gall/Desktop/TFE

# Vérifiez si git est initialisé
git status

# Si pas de repo git, créez-en un :
git init
git add .
git commit -m "Initial commit - Ready for Railway deployment"
git branch -M main

# Ajoutez votre remote GitHub (remplacez par votre URL)
git remote add origin https://github.com/VOTRE-USERNAME/VOTRE-REPO.git
git push -u origin main
```

**Note :** Remplacez `VOTRE-USERNAME` et `VOTRE-REPO` par vos vraies valeurs.

---

## 🚀 Étape 3 : Créer le projet sur Railway

1. **Dans Railway**, cliquez sur **"New Project"** (en haut à droite)
2. **Sélectionnez** **"Deploy from GitHub repo"**
3. **Choisissez votre repository** dans la liste
4. Railway va automatiquement détecter votre `docker-compose.yml` ou `docker-compose.prod.yml`

---

## 🗄️ Étape 4 : Ajouter PostgreSQL

**Important :** Railway utilise des services gérés pour les bases de données. Ne déployez PAS les conteneurs PostgreSQL dans Docker Compose.

### Option A : Une seule base PostgreSQL avec plusieurs databases (RECOMMANDÉ)

1. Dans votre projet Railway, cliquez sur **"+ New"**
2. Sélectionnez **"Database"** → **"Add PostgreSQL"**
3. Railway crée automatiquement une base PostgreSQL
4. **Notez le nom du service** (ex: "Postgres" ou "PostgreSQL")

**Pour créer plusieurs databases dans cette base :**

1. Cliquez sur votre service PostgreSQL
2. Allez dans l'onglet **"Connect"** ou **"Data"**
3. Cliquez sur **"Query"** ou utilisez un client PostgreSQL
4. Exécutez ces commandes SQL :

```sql
CREATE DATABASE auth_db;
CREATE DATABASE customer_db;
CREATE DATABASE product_db;
CREATE DATABASE order_db;
```

### Option B : Plusieurs bases PostgreSQL (plus simple mais utilise plus de ressources)

Créez 4 bases PostgreSQL séparées :

- Une pour `auth_db`
- Une pour `customer_db`
- Une pour `product_db`
- Une pour `order_db`

---

## 🔴 Étape 5 : Ajouter Redis

1. Dans votre projet Railway, cliquez sur **"+ New"**
2. Sélectionnez **"Database"** → **"Add Redis"**
3. Railway crée automatiquement Redis
4. **Notez le nom du service** (ex: "Redis")

---

## ⚙️ Étape 6 : Configurer les variables d'environnement

Pour chaque service dans Railway, vous devez configurer les variables d'environnement.

### 6.1 Variables pour API Gateway

1. **Cliquez sur le service** `api-gateway` dans Railway
2. Allez dans l'onglet **"Variables"**
3. **Ajoutez ces variables** (cliquez sur "+ New Variable") :

```
NODE_ENV=production
DOCKER_ENV=true
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi
CUSTOMER_SERVICE_URL=http://customer-service:3001
PRODUCT_SERVICE_URL=http://product-service:3002
ORDER_SERVICE_URL=http://order-service:3003
CART_SERVICE_URL=http://cart-service:3004
AUTH_SERVICE_URL=http://auth-service:3008
PAYMENT_SERVICE_URL=http://payment-service:3007
EMAIL_SERVICE_URL=http://email-service:3006
PDF_EXPORT_SERVICE_URL=http://pdf-export-service:3040
REDIS_URL=${{Redis.REDIS_URL}}
```

**Important :**

- `${{Redis.REDIS_URL}}` est une variable Railway qui référence automatiquement votre Redis
- Remplacez `votre-secret-jwt-super-securise-changez-moi` par un secret fort (générez-en un avec : `openssl rand -base64 32`)

### 6.2 Variables pour Auth Service

1. **Cliquez sur le service** `auth-service`
2. Allez dans **"Variables"**
3. **Ajoutez** :

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}/auth_db
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi
```

**Note :** Si vous avez nommé votre PostgreSQL différemment, utilisez `${{NOM-DU-SERVICE.DATABASE_URL}}/auth_db`

### 6.3 Variables pour Customer Service

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}/customer_db
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi
```

### 6.4 Variables pour Product Service

```
NODE_ENV=production
DOCKER_ENV=true
DATABASE_URL=${{Postgres.DATABASE_URL}}/product_db
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi
```

### 6.5 Variables pour Order Service

```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}/order_db
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi
STRIPE_SECRET_KEY=sk_test_51RtjchLi6vN59MNetUhP86QSndKeI5GfJCMseKO8dSq4D93k0td4AZyJ5d4SiKTveQh9pThKaj9d9MyzpTEuoFdU00ZW6qtK90
```

### 6.6 Variables pour Cart Service

```
NODE_ENV=production
REDIS_URL=${{Redis.REDIS_URL}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi
```

### 6.7 Variables pour Payment Service

```
NODE_ENV=production
STRIPE_SECRET_KEY=sk_test_51RtjchLi6vN59MNetUhP86QSndKeI5GfJCMseKO8dSq4D93k0td4AZyJ5d4SiKTveQh9pThKaj9d9MyzpTEuoFdU00ZW6qtK90
STRIPE_PUBLISHABLE_KEY=pk_test_51RtjchLi6vN59MNe1w9bJlC4Gg2Pnuti0Oub3RRuh4QFVPmh77ZE9oOmL3ewA6vnB2NvWjSizIup9gq9Y6pyTmdV00xFVugPSe
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi
```

### 6.8 Variables pour Email Service

```
NODE_ENV=production
GMAIL_USER=u4999410740@gmail.com
GMAIL_APP_PASSWORD=vyli fdmp hrww jvlz
ADMIN_EMAIL=u4999410740@gmail.com
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi
```

### 6.9 Variables pour PDF Export Service

```
NODE_ENV=production
PORT=3040
```

### 6.10 Variables pour Frontend

1. **Cliquez sur le service** `frontend`
2. Allez dans **"Variables"**
3. **Ajoutez** :

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=${{api-gateway.RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RtjchLi6vN59MNe1w9bJlC4Gg2Pnuti0Oub3RRuh4QFVPmh77ZE9oOmL3ewA6vnB2NvWjSizIup9gq9Y6pyTmdV00xFVugPSe
```

**Important :** `${{api-gateway.RAILWAY_PUBLIC_DOMAIN}}` référence le domaine public de votre API Gateway. Vous devrez d'abord générer le domaine pour l'API Gateway (voir étape 7).

### 6.11 Variables pour Backoffice

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=${{api-gateway.RAILWAY_PUBLIC_DOMAIN}}
```

---

## 🌐 Étape 7 : Générer les domaines publics

Pour que vos services soient accessibles depuis Internet :

### 7.1 Domaine pour API Gateway

1. **Cliquez sur le service** `api-gateway`
2. Allez dans l'onglet **"Settings"**
3. Scrollez jusqu'à **"Networking"**
4. Cliquez sur **"Generate Domain"**
5. Railway génère une URL : `votre-api-gateway.up.railway.app`
6. **Copiez cette URL**, vous en aurez besoin pour le Frontend et Backoffice

### 7.2 Domaine pour Frontend

1. **Cliquez sur le service** `frontend`
2. Allez dans **"Settings"** → **"Networking"**
3. Cliquez sur **"Generate Domain"**
4. URL générée : `votre-frontend.up.railway.app`

### 7.3 Domaine pour Backoffice

1. **Cliquez sur le service** `backoffice`
2. Allez dans **"Settings"** → **"Networking"**
3. Cliquez sur **"Generate Domain"**
4. URL générée : `votre-backoffice.up.railway.app`

### 7.4 Mettre à jour les variables d'environnement

**Maintenant que vous avez le domaine de l'API Gateway**, mettez à jour les variables du Frontend et Backoffice :

1. **Frontend** → Variables → Modifiez `NEXT_PUBLIC_API_URL` :

   ```
   NEXT_PUBLIC_API_URL=https://votre-api-gateway.up.railway.app
   ```

2. **Backoffice** → Variables → Modifiez `NEXT_PUBLIC_API_URL` :
   ```
   NEXT_PUBLIC_API_URL=https://votre-api-gateway.up.railway.app
   ```

---

## 🚀 Étape 8 : Déployer

Railway déploie automatiquement quand vous poussez du code sur GitHub. Mais vous pouvez aussi :

1. **Déployer manuellement** : Cliquez sur un service → **"Deploy"**
2. **Voir les logs** : Cliquez sur un service → **"Deployments"** → **"View Logs"**

### Vérifier que tout fonctionne

1. **Attendez que tous les services soient déployés** (statut "Active")
2. **Testez les URLs** :
   - Frontend : `https://votre-frontend.up.railway.app`
   - Backoffice : `https://votre-backoffice.up.railway.app`
   - API Gateway : `https://votre-api-gateway.up.railway.app/api/health`

---

## ⚠️ Points importants

### 1. Docker Compose pour Railway

Railway peut utiliser votre `docker-compose.yml` directement, mais il faut :

- **Supprimer les services de bases de données** (PostgreSQL, Redis) du docker-compose
- **Utiliser les Dockerfile de production** (pas les `.dev`)
- **Supprimer les volumes de développement**

J'ai créé un fichier `docker-compose.railway.yml` pour vous (voir ci-dessous).

### 2. Limites du plan gratuit

- **5$ de crédit/mois**
- Pour 10 visites, vous utiliserez probablement moins de 1$
- Surveillez votre consommation dans **"Settings"** → **"Usage"**

### 3. Services en veille

- Railway peut mettre les services en veille après inactivité
- Le premier accès peut prendre 10-30 secondes pour redémarrer
- C'est normal et gratuit

### 4. Bases de données

- **Utilisez les services gérés de Railway** (PostgreSQL, Redis)
- **Ne déployez PAS les conteneurs de base de données** dans Docker Compose
- Les variables `${{Postgres.DATABASE_URL}}` et `${{Redis.REDIS_URL}}` sont automatiquement disponibles

---

## 🆘 Résolution de problèmes

### Problème : Service ne démarre pas

1. **Vérifiez les logs** : Service → "Deployments" → "View Logs"
2. **Vérifiez les variables d'environnement** : Assurez-vous qu'elles sont correctes
3. **Vérifiez la connexion aux bases de données** : Utilisez les variables Railway

### Problème : Erreur de connexion à la base de données

1. Vérifiez que PostgreSQL est créé et actif
2. Vérifiez que vous utilisez `${{Postgres.DATABASE_URL}}/nom_db` (avec le nom de la database)
3. Si vous avez plusieurs bases PostgreSQL, utilisez `${{NOM-SERVICE.DATABASE_URL}}`

### Problème : Frontend ne peut pas joindre l'API Gateway

1. Vérifiez que l'API Gateway a un domaine généré
2. Vérifiez que `NEXT_PUBLIC_API_URL` pointe vers `https://votre-api-gateway.up.railway.app`
3. Redéployez le Frontend après avoir changé les variables

### Problème : Services ne communiquent pas entre eux

- Dans Docker Compose, les services communiquent via leur nom de service (ex: `http://customer-service:3001`)
- Assurez-vous que les noms de services dans les variables correspondent aux noms dans docker-compose.yml

---

## ✅ Checklist finale

- [ ] Compte Railway créé
- [ ] Projet sur GitHub
- [ ] Projet Railway créé et connecté à GitHub
- [ ] PostgreSQL ajouté (avec databases créées)
- [ ] Redis ajouté
- [ ] Variables d'environnement configurées pour tous les services
- [ ] Domaines générés pour Frontend, Backoffice, API Gateway
- [ ] Variables `NEXT_PUBLIC_API_URL` mises à jour avec le vrai domaine
- [ ] Services déployés et actifs
- [ ] URLs testées et fonctionnelles

---

## 📞 Support

- **Documentation Railway** : https://docs.railway.app
- **Discord Railway** : https://discord.gg/railway
- **Status Railway** : https://status.railway.app

---

**Bon déploiement ! 🚂**

Une fois déployé, vous aurez vos URLs pour montrer votre projet aux professeurs !
