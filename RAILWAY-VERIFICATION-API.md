# ✅ Vérification de la configuration API

## Test rapide dans la console du navigateur

Ouvrez la console du navigateur (F12) sur votre backoffice et exécutez :

```javascript
// Vérifier l'URL de l'API configurée
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

// Tester une requête API directe
fetch(process.env.NEXT_PUBLIC_API_URL + '/api/health')
  .then(r => r.text())
  .then(data => {
    console.log('Réponse API:', data);
    if (data.includes('<!DOCTYPE html>')) {
      console.error('❌ PROBLÈME: La requête retourne du HTML au lieu de JSON');
      console.error('Cela signifie que NEXT_PUBLIC_API_URL pointe vers le backoffice au lieu de nginx');
    } else {
      console.log('✅ La requête API fonctionne correctement');
    }
  })
  .catch(err => console.error('Erreur:', err));
```

## Vérifications dans Railway

### 1. Vérifier `NEXT_PUBLIC_API_URL` dans le Backoffice

**Dans Railway :**
- Service **Backoffice** → **Settings** → **Variables**
- Cherchez `NEXT_PUBLIC_API_URL`

**Doit être :**
```bash
NEXT_PUBLIC_API_URL=https://nginx-production-ac30.up.railway.app
```

**❌ NE DOIT PAS ÊTRE :**
```bash
# ❌ Mauvais - pointe vers le backoffice
NEXT_PUBLIC_API_URL=https://backoffice-production-xyz.up.railway.app

# ❌ Mauvais - pointe directement vers l'API Gateway
NEXT_PUBLIC_API_URL=https://api-gateway-production-abc.up.railway.app
```

### 2. Vérifier que nginx est accessible

Testez directement dans votre navigateur ou avec curl :

```bash
# Test de santé de l'API via nginx
curl https://nginx-production-ac30.up.railway.app/api/health

# Doit retourner du JSON, pas du HTML
```

### 3. Vérifier les logs nginx

**Dans Railway :**
- Service **Nginx** → **Logs**
- Cherchez les requêtes `/api/`
- Vérifiez qu'elles sont bien routées vers l'API Gateway

### 4. Vérifier les logs API Gateway

**Dans Railway :**
- Service **API Gateway** → **Logs**
- Vérifiez que les requêtes arrivent bien

## Diagnostic des erreurs 404

Si vous voyez toujours des erreurs 404 HTML :

1. **Vérifiez que `NEXT_PUBLIC_API_URL` pointe vers nginx** (voir ci-dessus)

2. **Redéployez le Backoffice** après avoir modifié `NEXT_PUBLIC_API_URL`
   - Railway → Service Backoffice → Deployments → Redeploy

3. **Videz le cache du navigateur** (Ctrl+Shift+R ou Cmd+Shift+R)

4. **Vérifiez dans la console du navigateur** quelle URL est utilisée pour les requêtes API
   - Ouvrez l'onglet Network
   - Faites une requête (ex: charger la page)
   - Regardez l'URL des requêtes `/api/...`
   - Elle doit commencer par `https://nginx-production-ac30.up.railway.app`

## Solution si le problème persiste

Si après toutes ces vérifications le problème persiste :

1. **Vérifiez que nginx route correctement `/api/`**
   - Testez : `curl https://nginx-production-ac30.up.railway.app/api/health`
   - Si cela retourne du JSON, nginx fonctionne
   - Si cela retourne du HTML ou une erreur, le problème est dans nginx

2. **Vérifiez que l'API Gateway est accessible**
   - Testez directement l'API Gateway (si vous avez son domaine)
   - Ou vérifiez les logs de l'API Gateway

3. **Vérifiez les variables nginx**
   - `FRONTEND_URL`, `BACKOFFICE_URL`, `API_GATEWAY_URL` doivent être définies
   - Format : `http://service-name.railway.internal:port`
