# 🚨 Action Immédiate - Résoudre les erreurs 500

## Problème actuel

Votre frontend retourne des erreurs 500 pour :
- `/api/products` → Product Service
- `/api/categories` → Product Service
- `/api/cart` → Cart Service
- `/api/checkout-data` → Multiple services

## 🔍 Étape 1 : Vérifier l'endpoint de diagnostic

**Ouvrez dans votre navigateur :**
```
https://VOTRE-API-GATEWAY-DOMAINE.up.railway.app/api/health/services
```

Remplacez `VOTRE-API-GATEWAY-DOMAINE` par le domaine de votre API Gateway dans Railway.

**Ce que vous devriez voir :**
- Si l'endpoint fonctionne : Un JSON avec l'état de tous les services
- Si l'endpoint ne fonctionne pas : L'API Gateway n'est pas redéployé avec les nouvelles modifications

**Exemple de réponse attendue :**
```json
{
  "gateway": "OK",
  "services": {
    "product": {
      "url": "http://product-service:3002",
      "status": "UNAVAILABLE",
      "error": "ECONNREFUSED"
    }
  }
}
```

## 🔧 Étape 2 : Vérifier dans Railway

### 2.1 Vérifier que l'API Gateway est redéployé

1. Allez dans Railway → Votre projet
2. Cliquez sur **API Gateway**
3. Vérifiez les **Logs** récents
4. Cherchez le message de démarrage avec les URLs des services

**Vous devriez voir :**
```
🔗 Services URLs:
   Product: http://product-service:3002 (env) ou (default)
```

### 2.2 Vérifier que tous les services backend sont démarrés

Dans Railway, vérifiez le statut de chaque service :

- [ ] **product-service** → Statut "Running" (vert)
- [ ] **cart-service** → Statut "Running" (vert)
- [ ] **customer-service** → Statut "Running" (vert)
- [ ] **order-service** → Statut "Running" (vert)
- [ ] **auth-service** → Statut "Running" (vert)
- [ ] **payment-service** → Statut "Running" (vert)
- [ ] **email-service** → Statut "Running" (vert)

**Si un service est "Stopped" ou "Error" :**
1. Cliquez sur le service
2. Allez dans **Logs**
3. Identifiez l'erreur
4. Redémarrez le service (Settings → Restart)

### 2.3 Vérifier les variables d'environnement de l'API Gateway

1. Railway → **API Gateway** → **Settings** → **Variables**
2. Vérifiez que vous avez **TOUTES** ces variables :

```env
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
PORT=3020
ALLOWED_ORIGINS=https://frontend-production-27ff.up.railway.app,https://backoffice-production-ea2c.up.railway.app
```

**⚠️ IMPORTANT :**
- Les URLs doivent utiliser `http://` (pas `https://`)
- Les noms de services doivent être exactement : `product-service:3002` (avec tiret)
- Ne pas utiliser les domaines publics Railway dans ces variables

### 2.4 Vérifier les logs de l'API Gateway

1. Railway → **API Gateway** → **Logs**
2. Faites une requête depuis votre frontend (rechargez la page)
3. Cherchez les messages `[Proxy Error]`

**Vous devriez voir :**
```
[Proxy Error] GET /api/products -> product: http://product-service:3002/api/products
[Proxy Error] Code: ECONNREFUSED, Message: connect ECONNREFUSED
```

Cela vous indiquera quel service n'est pas accessible.

## 🛠️ Solutions selon le problème

### Problème 1 : Services non démarrés

**Symptôme :** L'endpoint `/api/health/services` montre `status: "UNAVAILABLE"` avec `error: "ECONNREFUSED"`

**Solution :**
1. Dans Railway, vérifiez les logs du service concerné
2. Identifiez l'erreur de démarrage
3. Vérifiez les variables d'environnement du service (DATABASE_URL, PORT, etc.)
4. Redémarrez le service

### Problème 2 : Services dans un autre projet Railway

**Symptôme :** L'endpoint `/api/health/services` montre `error: "ENOTFOUND"`

**Solution :**
- Tous les services DOIVENT être dans le même projet Railway
- Si un service est dans un autre projet, recréez-le dans le bon projet

### Problème 3 : Variables d'environnement incorrectes

**Symptôme :** Les URLs des services sont incorrectes dans les logs

**Solution :**
1. Vérifiez que toutes les variables `*_SERVICE_URL` sont configurées
2. Vérifiez que les URLs utilisent les noms de services Docker (ex: `product-service:3002`)
3. Ne pas utiliser les domaines publics Railway

### Problème 4 : API Gateway pas redéployé

**Symptôme :** L'endpoint `/api/health/services` n'existe pas (404)

**Solution :**
1. Dans Railway → **API Gateway** → **Settings** → **Deploy**
2. Cliquez sur **Redeploy** pour forcer un nouveau déploiement
3. Attendez que le déploiement se termine
4. Vérifiez les logs pour confirmer le démarrage

## 📋 Checklist rapide

- [ ] API Gateway redéployé avec les nouvelles modifications
- [ ] Tous les services backend sont "Running" dans Railway
- [ ] Toutes les variables `*_SERVICE_URL` sont configurées dans l'API Gateway
- [ ] Les URLs utilisent les noms Docker (ex: `product-service:3002`)
- [ ] Tous les services sont dans le même projet Railway
- [ ] L'endpoint `/api/health/services` fonctionne et montre l'état des services
- [ ] Les logs de l'API Gateway montrent des erreurs détaillées

## 🆘 Si rien ne fonctionne

1. **Redéployez tous les services** dans cet ordre :
   - Bases de données (PostgreSQL, Redis)
   - Services backend (un par un)
   - API Gateway
   - Frontend et Backoffice

2. **Vérifiez les logs de chaque service** pour identifier les erreurs de démarrage

3. **Utilisez l'endpoint de diagnostic** pour voir l'état exact :
   ```
   https://VOTRE-API-GATEWAY-DOMAINE.up.railway.app/api/health/services
   ```

4. **Contactez le support Railway** si le problème persiste après avoir vérifié tous les points ci-dessus
