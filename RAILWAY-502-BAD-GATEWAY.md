# 🔧 Diagnostic : 502 Bad Gateway

## Problème

Vous obtenez une erreur **502 Bad Gateway** quand vous accédez à `https://nginx-production-ac30.up.railway.app/api/categories` ou d'autres endpoints API.

## Signification

Un **502 Bad Gateway** signifie que :
- ✅ Nginx fonctionne et route correctement vers l'API Gateway
- ❌ L'API Gateway ne répond pas ou n'est pas accessible

## Causes possibles

### 1. API Gateway non démarré ou crashé

**Vérification :**
- Railway → Service **API Gateway** → Vérifiez le statut
- Le statut doit être "Active" ou "Running"

**Solution :**
- Si le service est arrêté, redémarrez-le
- Si le service crash, consultez les logs pour voir l'erreur

### 2. Variables nginx incorrectes

**Vérification :**
- Railway → Service **Nginx** → **Settings** → **Variables**
- Vérifiez `API_GATEWAY_URL`

**Doit être :**
```bash
API_GATEWAY_URL=http://VOTRE-NOM-API-GATEWAY.railway.internal:3020
```

**⚠️ Important :**
- Remplacez `VOTRE-NOM-API-GATEWAY` par le **nom exact** de votre service API Gateway dans Railway
- Les noms sont **sensibles à la casse**
- Format : `http://service-name.railway.internal:port` (pas `https://`)
- Le port doit être `3020` (port par défaut de l'API Gateway)

**Comment trouver le nom exact :**
1. Dans Railway, regardez la liste de vos services
2. Trouvez le service API Gateway
3. Le nom exact est celui affiché (ex: "api-gateway-production", "API-Gateway-Production", etc.)

### 3. API Gateway ne peut pas démarrer

**Vérification :**
- Railway → Service **API Gateway** → **Logs**
- Cherchez les erreurs de démarrage

**Erreurs courantes :**
- Variables d'environnement manquantes
- Erreurs de connexion à la base de données
- Erreurs de connexion à Redis
- Erreurs de syntaxe dans le code

### 4. API Gateway ne peut pas se connecter aux services backend

**Vérification :**
- Railway → Service **API Gateway** → **Settings** → **Variables**
- Vérifiez les variables de services backend :

```bash
AUTH_SERVICE_URL=http://auth-service.railway.internal:3008
PRODUCT_SERVICE_URL=http://product-service.railway.internal:3001
ORDER_SERVICE_URL=http://order-service.railway.internal:3002
CUSTOMER_SERVICE_URL=http://customer-service.railway.internal:3003
CART_SERVICE_URL=http://cart-service.railway.internal:3004
PAYMENT_SERVICE_URL=http://payment-service.railway.internal:3005
EMAIL_SERVICE_URL=http://email-service.railway.internal:3006
PDF_EXPORT_SERVICE_URL=http://pdf-export-service.railway.internal:3040
```

**⚠️ Important :** Remplacez les noms par les noms exacts de vos services Railway.

## Étapes de diagnostic

### 1. Vérifier les logs API Gateway

**Dans Railway :**
- Service **API Gateway** → **Logs**
- Cherchez les erreurs récentes
- Vérifiez si le service démarre correctement

**Messages à chercher :**
- `Server running on port 3020` → ✅ Le service démarre
- `Error: Cannot connect to...` → ❌ Problème de connexion
- `Error: Missing environment variable...` → ❌ Variable manquante

### 2. Vérifier les variables nginx

**Dans Railway :**
- Service **Nginx** → **Settings** → **Variables**
- Vérifiez `API_GATEWAY_URL`

**Test :**
Si vous avez accès au service API Gateway directement (via son domaine Railway), testez :
```bash
curl https://VOTRE-DOMAINE-API-GATEWAY.up.railway.app/api/health
```

Si cela fonctionne, le problème est dans la configuration nginx.

### 3. Vérifier la configuration nginx

**Dans Railway :**
- Service **Nginx** → **Logs**
- Cherchez les erreurs de connexion à l'API Gateway

**Messages à chercher :**
- `upstream timed out` → L'API Gateway ne répond pas
- `upstream connection failed` → L'API Gateway n'est pas accessible
- `no live upstreams` → L'API Gateway n'est pas démarré

### 4. Vérifier les variables API Gateway

**Dans Railway :**
- Service **API Gateway** → **Settings** → **Variables**
- Vérifiez que toutes les variables requises sont définies

**Variables essentielles :**
```bash
NODE_ENV=production
PORT=3020
JWT_SECRET=...
ALLOWED_ORIGINS=https://nginx-production-ac30.up.railway.app
CORS_CREDENTIALS=true
REDIS_URL=...
# Et les URLs des services backend (voir ci-dessus)
```

## Solutions

### Solution 1 : Redémarrer l'API Gateway

1. Railway → Service **API Gateway** → **Deployments**
2. Cliquez sur **Redeploy**

### Solution 2 : Vérifier et corriger les variables

1. Vérifiez `API_GATEWAY_URL` dans nginx
2. Vérifiez les variables de services backend dans l'API Gateway
3. Assurez-vous que les noms de services correspondent exactement

### Solution 3 : Vérifier les logs

1. Consultez les logs de l'API Gateway
2. Identifiez l'erreur exacte
3. Corrigez selon l'erreur

## Checklist de vérification

- [ ] Service API Gateway démarré et actif
- [ ] Logs API Gateway consultés (pas d'erreurs de démarrage)
- [ ] Variable `API_GATEWAY_URL` correcte dans nginx
- [ ] Nom du service API Gateway correspond exactement (sensible à la casse)
- [ ] Port correct (3020) dans `API_GATEWAY_URL`
- [ ] Variables de services backend définies dans l'API Gateway
- [ ] Services backend démarrés et accessibles
- [ ] Logs nginx consultés (pas d'erreurs de connexion)

## Test rapide

Testez si l'API Gateway répond directement (si vous avez son domaine) :

```bash
curl https://VOTRE-DOMAINE-API-GATEWAY.up.railway.app/api/health
```

**Si cela fonctionne :**
- ✅ L'API Gateway fonctionne
- ❌ Le problème est dans la configuration nginx (`API_GATEWAY_URL`)

**Si cela ne fonctionne pas :**
- ❌ Le problème est dans l'API Gateway lui-même
- Consultez les logs de l'API Gateway
