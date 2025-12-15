# 🔍 Diagnostic des erreurs 500 dans Railway

## Problème

Vous avez des erreurs 500 sur :

- **Frontend** : products, categories, checkout-data, cart
- **Backoffice** : login

Ces erreurs indiquent que l'API Gateway ne peut pas communiquer avec les services backend.

## ✅ Checklist de vérification

### 1. Vérifier que tous les services sont démarrés

Dans Railway, vérifiez que tous ces services sont **actifs** (statut "Running") :

- [ ] **auth-service** (port 3008)
- [ ] **customer-service** (port 3001)
- [ ] **product-service** (port 3002)
- [ ] **order-service** (port 3003)
- [ ] **cart-service** (port 3004)
- [ ] **payment-service** (port 3007)
- [ ] **email-service** (port 3006)
- [ ] **pdf-export-service** (port 3040)
- [ ] **api-gateway** (port 3020)

**Comment vérifier :**

1. Allez dans votre projet Railway
2. Vérifiez que chaque service a un statut "Running" (pas "Stopped" ou "Error")
3. Si un service est en erreur, cliquez dessus et regardez les logs

### 2. Vérifier que tous les services sont dans le même projet Railway

**IMPORTANT :** Tous les services doivent être dans le **même projet Railway** pour que la communication inter-services fonctionne.

**Comment vérifier :**

1. Dans Railway, vérifiez que tous les services apparaissent dans la même liste de services
2. Si un service est dans un autre projet, vous devez le déplacer ou le recréer dans le bon projet

### 3. Vérifier les variables d'environnement de l'API Gateway

Dans Railway, allez dans **API Gateway** → **Settings** → **Variables** et vérifiez que vous avez :

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
ALLOWED_ORIGINS=https://VOTRE-FRONTEND-DOMAINE.up.railway.app,https://VOTRE-BACKOFFICE-DOMAINE.up.railway.app
```

**⚠️ IMPORTANT :** Les URLs doivent utiliser les noms de services Docker (`customer-service:3001`) et non les domaines publics Railway.

### 4. Utiliser l'endpoint de diagnostic

L'API Gateway a un endpoint de diagnostic pour vérifier l'état des services :

```
GET https://VOTRE-API-GATEWAY-DOMAINE.up.railway.app/api/health/services
```

Cet endpoint retourne l'état de tous les services backend. Utilisez-le pour identifier quels services ne sont pas accessibles.

**Exemple de réponse :**

```json
{
  "gateway": "OK",
  "services": {
    "product": {
      "url": "http://product-service:3002",
      "status": "UNAVAILABLE",
      "error": "ECONNREFUSED",
      "message": "connect ECONNREFUSED"
    },
    "customer": {
      "url": "http://customer-service:3001",
      "status": "OK",
      "httpStatus": 200
    }
  }
}
```

### 5. Vérifier les logs de l'API Gateway

Dans Railway, allez dans **API Gateway** → **Logs** et cherchez :

- Les erreurs `ECONNREFUSED` : Le service n'est pas démarré ou n'est pas accessible
- Les erreurs `ENOTFOUND` : Le nom du service n'est pas résolu (problème de réseau)
- Les messages `[Proxy Error]` : Détails sur les erreurs de communication

### 6. Vérifier les logs des services backend

Pour chaque service qui retourne une erreur, vérifiez ses logs dans Railway :

1. Cliquez sur le service (ex: `product-service`)
2. Allez dans l'onglet **Logs**
3. Vérifiez qu'il n'y a pas d'erreurs de démarrage
4. Vérifiez que le service affiche un message de démarrage réussi (ex: "Service démarré sur le port 3002")

## 🔧 Solutions courantes

### Solution 1 : Redémarrer les services

Si un service est en erreur :

1. Dans Railway, cliquez sur le service
2. Cliquez sur **Settings** → **Restart**
3. Attendez que le service redémarre
4. Vérifiez les logs pour confirmer le démarrage

### Solution 2 : Vérifier les variables d'environnement des services backend

Chaque service backend doit avoir ses propres variables d'environnement. Vérifiez que chaque service a :

- `NODE_ENV=production`
- `DATABASE_URL` (correctement configuré)
- `JWT_SECRET` (même valeur que l'API Gateway)
- `PORT` (le bon port pour chaque service)

### Solution 3 : Vérifier la connexion à la base de données

Si un service ne démarre pas, vérifiez que :

1. La base de données PostgreSQL est créée et accessible
2. La variable `DATABASE_URL` est correcte
3. Le service peut se connecter à la base de données (vérifiez les logs)

### Solution 4 : Utiliser Railway Private Networking (si nécessaire)

Si les noms de services Docker ne fonctionnent pas, Railway utilise le Private Networking avec des domaines `railway.internal`. Dans ce cas, vous devrez peut-être utiliser :

```
CUSTOMER_SERVICE_URL=http://customer-service.railway.internal:3001
```

Mais normalement, les noms Docker classiques devraient fonctionner si tous les services sont dans le même projet.

## 📊 Test rapide

Pour tester rapidement si un service est accessible depuis l'API Gateway :

1. Allez dans Railway → **API Gateway** → **Logs**
2. Faites une requête depuis votre frontend (ex: charger les produits)
3. Regardez les logs de l'API Gateway pour voir l'erreur exacte

Vous devriez voir des messages comme :

```
[Proxy Error] GET /api/products -> product: http://product-service:3002/api/products
[Proxy Error] Code: ECONNREFUSED, Message: connect ECONNREFUSED
```

Cela vous indiquera quel service n'est pas accessible.

## 🆘 Si rien ne fonctionne

1. **Vérifiez que tous les services sont dans le même projet Railway**
2. **Vérifiez les logs de chaque service** pour voir s'il y a des erreurs de démarrage
3. **Redémarrez tous les services** dans l'ordre :

   - Bases de données (PostgreSQL, Redis)
   - Services backend (auth, customer, product, order, cart, payment, email, pdf-export)
   - API Gateway
   - Frontend et Backoffice

4. **Utilisez l'endpoint de diagnostic** `/api/health/services` pour voir l'état exact de tous les services
