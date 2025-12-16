# 🔧 Correction des URLs dans Railway

## Problème identifié

Les variables `NEXT_PUBLIC_API_URL` et `ALLOWED_ORIGINS` manquent le préfixe `https://`.

## Corrections à faire

### 1. Frontend - `NEXT_PUBLIC_API_URL`

**Actuellement :**
```bash
NEXT_PUBLIC_API_URL=nginx-production-ac30.up.railway.app
```

**Doit être :**
```bash
NEXT_PUBLIC_API_URL=https://nginx-production-ac30.up.railway.app
```

**Action :**
1. Railway → Service **Frontend** → **Settings** → **Variables**
2. Cliquez sur `NEXT_PUBLIC_API_URL`
3. Modifiez la valeur pour ajouter `https://` au début
4. Cliquez sur **Save**
5. **Redéployez** le Frontend (Deployments → Redeploy)

### 2. Backoffice - `NEXT_PUBLIC_API_URL`

**Actuellement :**
```bash
NEXT_PUBLIC_API_URL=nginx-production-ac30.up.railway.app
```

**Doit être :**
```bash
NEXT_PUBLIC_API_URL=https://nginx-production-ac30.up.railway.app
```

**Action :**
1. Railway → Service **Backoffice** → **Settings** → **Variables**
2. Cliquez sur `NEXT_PUBLIC_API_URL`
3. Modifiez la valeur pour ajouter `https://` au début
4. Cliquez sur **Save**
5. **Redéployez** le Backoffice (Deployments → Redeploy)

### 3. API Gateway - `ALLOWED_ORIGINS`

**Actuellement :**
```bash
ALLOWED_ORIGINS=nginx-production-ac30.up.railway.app
```

**Doit être :**
```bash
ALLOWED_ORIGINS=https://nginx-production-ac30.up.railway.app
```

**Action :**
1. Railway → Service **API Gateway** → **Settings** → **Variables**
2. Cliquez sur `ALLOWED_ORIGINS`
3. Modifiez la valeur pour ajouter `https://` au début
4. Cliquez sur **Save**
5. **Redéployez** l'API Gateway (Deployments → Redeploy)

## Pourquoi c'est important

Sans `https://`, le navigateur interprète l'URL comme une URL relative au lieu d'une URL absolue, ce qui cause :
- Les requêtes API ne passent pas par nginx
- Les requêtes arrivent au frontend/backoffice au lieu de l'API Gateway
- Erreurs 404 HTML de Next.js au lieu de réponses JSON

## Après les corrections

1. Attendez que tous les services soient redéployés
2. Testez votre frontend : les produits devraient se charger
3. Testez votre backoffice : les requêtes API devraient fonctionner
4. Vérifiez dans la console du navigateur que les requêtes API utilisent bien `https://nginx-production-ac30.up.railway.app`
