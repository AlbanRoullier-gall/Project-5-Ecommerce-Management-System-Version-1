# 🔍 Diagnostic : Produits ne se chargent pas

## Problème

Le frontend s'affiche mais affiche "Aucun produit disponible pour le moment" ou "Ressource introuvable".

## Cause probable

Les requêtes API du frontend ne passent pas par nginx vers l'API Gateway.

## Solution

### 1. Vérifier `NEXT_PUBLIC_API_URL` dans le Frontend

**Dans Railway :**
- Service **Frontend** → **Settings** → **Variables**
- Cherchez `NEXT_PUBLIC_API_URL`

**Doit être :**
```bash
NEXT_PUBLIC_API_URL=https://nginx-production-ac30.up.railway.app
```

**❌ NE DOIT PAS ÊTRE :**
```bash
# ❌ Mauvais - pointe vers le frontend
NEXT_PUBLIC_API_URL=https://frontend-production-xyz.up.railway.app

# ❌ Mauvais - pointe directement vers l'API Gateway
NEXT_PUBLIC_API_URL=https://api-gateway-production-abc.up.railway.app

# ❌ Mauvais - non défini
# (La variable n'existe pas)
```

### 2. Redéployer le Frontend

Après avoir modifié `NEXT_PUBLIC_API_URL` :
- Service **Frontend** → **Deployments** → **Redeploy**

**⚠️ Important :** Les variables `NEXT_PUBLIC_*` sont intégrées au build Next.js. Vous devez redéployer pour que les changements soient pris en compte.

### 3. Vérifier dans la console du navigateur

Ouvrez la console (F12) sur votre frontend et vérifiez :

**Onglet Network :**
- Faites un rafraîchissement de la page
- Cherchez les requêtes vers `/api/products` ou `/api/categories`
- Vérifiez l'URL complète de ces requêtes
- Elle doit commencer par `https://nginx-production-ac30.up.railway.app`

**Si l'URL commence par autre chose :**
- Le frontend n'utilise pas la bonne URL
- Vérifiez que `NEXT_PUBLIC_API_URL` est bien défini et redéployé

### 4. Test direct de l'API

Testez si l'API Gateway répond via nginx :

```bash
# Test des produits
curl https://nginx-production-ac30.up.railway.app/api/products

# Test des catégories
curl https://nginx-production-ac30.up.railway.app/api/categories
```

**Si cela retourne du JSON :**
- ✅ Nginx et l'API Gateway fonctionnent
- Le problème est dans la configuration du Frontend

**Si cela retourne du HTML ou une erreur :**
- ❌ Le problème est dans nginx ou l'API Gateway
- Vérifiez les logs nginx et API Gateway

## Checklist de vérification

- [ ] `NEXT_PUBLIC_API_URL` défini dans le service Frontend
- [ ] `NEXT_PUBLIC_API_URL` pointe vers le domaine nginx
- [ ] Service Frontend redéployé après modification
- [ ] Test direct de l'API via nginx fonctionne
- [ ] Console du navigateur vérifiée (onglet Network)
- [ ] Les requêtes API utilisent bien l'URL nginx

## Configuration complète requise

Pour que tout fonctionne, vous devez avoir :

### Service Nginx
```bash
FRONTEND_URL=http://frontend.railway.internal:3000
BACKOFFICE_URL=http://backoffice.railway.internal:3000
API_GATEWAY_URL=http://api-gateway.railway.internal:3020
```

### Service Frontend
```bash
NEXT_PUBLIC_API_URL=https://nginx-production-ac30.up.railway.app
```

### Service Backoffice
```bash
NEXT_PUBLIC_API_URL=https://nginx-production-ac30.up.railway.app
```

### Service API Gateway
```bash
ALLOWED_ORIGINS=https://nginx-production-ac30.up.railway.app
```

**⚠️ Remplacez les noms de services et le domaine nginx par vos valeurs réelles.**
