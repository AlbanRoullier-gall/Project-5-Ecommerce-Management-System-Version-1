# 🔧 Solution définitive : Erreurs 404 API

## Problème

Les requêtes API retournent du HTML 404 de Next.js au lieu de JSON de l'API Gateway.

## Cause

`NEXT_PUBLIC_API_URL` dans Frontend et Backoffice ne pointe **PAS** vers le domaine nginx, ou les services n'ont pas été redéployés après modification.

## Solution étape par étape

### Étape 1 : Vérifier `NEXT_PUBLIC_API_URL` dans Frontend

**Dans Railway :**
1. Service **Frontend** → **Settings** → **Variables**
2. Cherchez `NEXT_PUBLIC_API_URL`
3. **Doit être exactement :**
   ```bash
   NEXT_PUBLIC_API_URL=https://nginx-production-ac30.up.railway.app
   ```
   (Remplacez par votre domaine nginx)

4. **Si la variable n'existe pas ou est différente :**
   - Cliquez sur **+ New Variable**
   - Nom : `NEXT_PUBLIC_API_URL`
   - Valeur : `https://nginx-production-ac30.up.railway.app`
   - Cliquez sur **Add**

5. **Redéployez le Frontend :**
   - Service **Frontend** → **Deployments**
   - Cliquez sur **Redeploy**
   - ⚠️ **IMPORTANT** : Les variables `NEXT_PUBLIC_*` sont intégrées au build Next.js. Un redéploiement est **OBLIGATOIRE**.

### Étape 2 : Vérifier `NEXT_PUBLIC_API_URL` dans Backoffice

**Dans Railway :**
1. Service **Backoffice** → **Settings** → **Variables**
2. Cherchez `NEXT_PUBLIC_API_URL`
3. **Doit être exactement :**
   ```bash
   NEXT_PUBLIC_API_URL=https://nginx-production-ac30.up.railway.app
   ```
   (Remplacez par votre domaine nginx)

4. **Si la variable n'existe pas ou est différente :**
   - Cliquez sur **+ New Variable**
   - Nom : `NEXT_PUBLIC_API_URL`
   - Valeur : `https://nginx-production-ac30.up.railway.app`
   - Cliquez sur **Add**

5. **Redéployez le Backoffice :**
   - Service **Backoffice** → **Deployments**
   - Cliquez sur **Redeploy**
   - ⚠️ **IMPORTANT** : Un redéploiement est **OBLIGATOIRE**.

### Étape 3 : Vérifier que nginx fonctionne

Testez directement dans votre navigateur ou avec curl :

```bash
curl https://nginx-production-ac30.up.railway.app/api/health
```

**Si cela retourne du JSON :**
- ✅ Nginx fonctionne et route correctement vers l'API Gateway
- Le problème vient de `NEXT_PUBLIC_API_URL` dans Frontend/Backoffice

**Si cela retourne du HTML ou une erreur :**
- ❌ Le problème est dans nginx ou l'API Gateway
- Consultez les logs nginx et API Gateway

### Étape 4 : Vérifier dans la console du navigateur

**Sur votre frontend en production :**
1. Ouvrez la console (F12)
2. Onglet **Network**
3. Rechargez la page
4. Cherchez les requêtes vers `/api/products` ou `/api/categories`
5. Cliquez sur une requête
6. Regardez l'**URL complète** dans l'onglet **Headers**

**L'URL doit commencer par :**
```
https://nginx-production-ac30.up.railway.app/api/...
```

**Si l'URL commence par autre chose :**
- ❌ `NEXT_PUBLIC_API_URL` n'est pas correctement configuré
- ❌ Le service n'a pas été redéployé après modification

## Checklist complète

- [ ] `NEXT_PUBLIC_API_URL` défini dans Frontend
- [ ] `NEXT_PUBLIC_API_URL` pointe vers le domaine nginx dans Frontend
- [ ] Frontend redéployé après modification
- [ ] `NEXT_PUBLIC_API_URL` défini dans Backoffice
- [ ] `NEXT_PUBLIC_API_URL` pointe vers le domaine nginx dans Backoffice
- [ ] Backoffice redéployé après modification
- [ ] Test direct de nginx fonctionne (`/api/health` retourne du JSON)
- [ ] Console navigateur vérifiée (URLs API commencent par domaine nginx)

## Test rapide dans la console

Ouvrez la console (F12) sur votre frontend/backoffice en production et exécutez :

```javascript
// Vérifier l'URL configurée
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

// Tester une requête
fetch(process.env.NEXT_PUBLIC_API_URL + '/api/health')
  .then(r => r.text())
  .then(data => {
    console.log('Réponse:', data.substring(0, 100));
    if (data.includes('<!DOCTYPE html>')) {
      console.error('❌ PROBLÈME: Retourne du HTML - NEXT_PUBLIC_API_URL pointe vers le mauvais service!');
    } else {
      console.log('✅ OK: Retourne du JSON');
    }
  });
```

## Erreurs courantes

### ❌ "NEXT_PUBLIC_API_URL pointe vers le frontend"
```bash
# ❌ MAUVAIS
NEXT_PUBLIC_API_URL=https://frontend-production-xyz.up.railway.app

# ✅ CORRECT
NEXT_PUBLIC_API_URL=https://nginx-production-ac30.up.railway.app
```

### ❌ "NEXT_PUBLIC_API_URL pointe directement vers l'API Gateway"
```bash
# ❌ MAUVAIS
NEXT_PUBLIC_API_URL=https://api-gateway-production-abc.up.railway.app

# ✅ CORRECT
NEXT_PUBLIC_API_URL=https://nginx-production-ac30.up.railway.app
```

### ❌ "Variable non redéployée"
- Après modification de `NEXT_PUBLIC_API_URL`, vous **DEVEZ** redéployer le service
- Les variables `NEXT_PUBLIC_*` sont intégrées au build Next.js au moment de la compilation

## Résumé

Le problème vient **TOUJOURS** de `NEXT_PUBLIC_API_URL` qui ne pointe pas vers nginx, ou d'un service non redéployé.

**Solution :**
1. Vérifiez `NEXT_PUBLIC_API_URL` dans Frontend et Backoffice
2. Assurez-vous qu'il pointe vers `https://nginx-production-ac30.up.railway.app`
3. **Redéployez** les deux services
4. Testez dans la console du navigateur
