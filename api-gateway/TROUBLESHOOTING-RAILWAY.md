# 🔧 Guide de dépannage Railway - Communication inter-services

## Problème : Erreurs 500 "Erreur de communication avec le service"

Si vous avez des erreurs 500, c'est que l'API Gateway ne peut pas communiquer avec les services backend.

## ✅ Solution : Configurer les domaines Railway Private Networking

### Étape 1 : Vérifier les noms de vos services dans Railway

Les domaines Railway suivent le format : `service-name.railway.internal`

Où `service-name` est le **nom exact du service dans Railway**.

**Pour vérifier les noms :**

1. **Railway** → Votre projet
2. Regardez le nom de chaque service dans la liste
3. Les domaines seront automatiquement : `nom-du-service.railway.internal`

**Exemples :**
- Service nommé `email-service` → `http://email-service.railway.internal:3006`
- Service nommé `product-service` → `http://product-service.railway.internal:3002`
- Service nommé `cart-service` → `http://cart-service.railway.internal:3004`

**Répétez pour tous les services :**

- product-service
- cart-service
- customer-service
- order-service
- auth-service
- payment-service
- email-service
- pdf-export-service

### Étape 2 : Configurer les variables dans l'API Gateway

1. **Railway** → **API Gateway** → **Settings** → **Variables**

2. **Ajoutez ou modifiez** ces variables avec les vrais domaines :

```env
PRODUCT_SERVICE_URL=http://VOTRE-DOMAINE-PRODUCT.railway.internal:3002
CART_SERVICE_URL=http://VOTRE-DOMAINE-CART.railway.internal:3004
CUSTOMER_SERVICE_URL=http://VOTRE-DOMAINE-CUSTOMER.railway.internal:3001
ORDER_SERVICE_URL=http://VOTRE-DOMAINE-ORDER.railway.internal:3003
AUTH_SERVICE_URL=http://VOTRE-DOMAINE-AUTH.railway.internal:3008
PAYMENT_SERVICE_URL=http://VOTRE-DOMAINE-PAYMENT.railway.internal:3007
EMAIL_SERVICE_URL=http://VOTRE-DOMAINE-EMAIL.railway.internal:3006
PDF_EXPORT_SERVICE_URL=http://VOTRE-DOMAINE-PDF.railway.internal:3040
```

**Exemple concret :**

```env
PRODUCT_SERVICE_URL=http://product-service.railway.internal:3002
CART_SERVICE_URL=http://cart-service.railway.internal:3004
CUSTOMER_SERVICE_URL=http://customer-service.railway.internal:3001
ORDER_SERVICE_URL=http://order-service.railway.internal:3003
AUTH_SERVICE_URL=http://auth-service.railway.internal:3008
PAYMENT_SERVICE_URL=http://payment-service.railway.internal:3007
EMAIL_SERVICE_URL=http://email-service.railway.internal:3006
PDF_EXPORT_SERVICE_URL=http://pdf-export-service.railway.internal:3040
```

**⚠️ IMPORTANT :**

- Utilisez `http://` (pas `https://`)
- Le port doit correspondre au port configuré dans le service (vérifiez la variable `PORT` de chaque service)
- Les domaines doivent se terminer par `.railway.internal`

### Étape 3 : Vérifier les ports de chaque service

Pour chaque service backend, vérifiez le port :

1. **Railway** → Service → **Settings** → **Variables**
2. Cherchez `PORT=XXXX`
3. Utilisez ce port dans l'URL (ex: `:3002`, `:3004`, etc.)

**Ports par défaut :**

- product-service : `3002`
- cart-service : `3004`
- customer-service : `3001`
- order-service : `3003`
- auth-service : `3008`
- payment-service : `3007`
- email-service : `3006`
- pdf-export-service : `3040`

### Étape 4 : Redéployer l'API Gateway

1. **Railway** → **API Gateway** → **Deployments** → **Redeploy**
2. Attendez 2-5 minutes
3. Vérifiez les logs

**Vous devriez voir dans les logs :**

```
🔗 Services URLs:
   Product: http://product-service.railway.internal:3002 (env)
   Cart: http://cart-service.railway.internal:3004 (env)
   Customer: http://customer-service.railway.internal:3001 (env)
   ...
```

Le `(env)` indique que les variables d'environnement sont utilisées.

### Étape 5 : Tester

1. **Testez l'endpoint de diagnostic :**

   ```
   https://api-gateway-production-91f9.up.railway.app/api/health/services
   ```

2. **Vérifiez les logs de l'API Gateway** pour voir si les services sont accessibles

3. **Testez depuis votre frontend** - les erreurs 500 devraient disparaître

## 🔍 Vérifications supplémentaires

### Vérifier que tous les services sont dans le même projet

Le Private Networking Railway fonctionne **uniquement** entre services du même projet.

**Vérifiez :**

- Tous vos services apparaissent dans la même liste de services dans Railway
- Ils ne sont pas dans des projets différents

### Vérifier que les services sont démarrés

**Pour chaque service :**

1. Railway → Service
2. Vérifiez que le statut est **"Running"** (vert)
3. Si ce n'est pas le cas, cliquez sur **"Restart"**

### Vérifier les logs des services backend

Si un service ne répond pas :

1. Railway → Service → **Logs**
2. Cherchez les erreurs de démarrage
3. Vérifiez que le service affiche un message de démarrage réussi (ex: "Service démarré sur le port 3002")

## 🐛 Erreurs courantes

### Erreur : `ENOTFOUND product-service.railway.internal`

**Cause :** Le domaine n'est pas correct ou le service n'est pas dans le même projet.

**Solution :**

1. Vérifiez que vous avez copié le bon domaine depuis Railway
2. Vérifiez que tous les services sont dans le même projet Railway
3. Vérifiez que le service est "Running"

### Erreur : `ECONNREFUSED`

**Cause :** Le service n'est pas démarré ou le port est incorrect.

**Solution :**

1. Vérifiez que le service est "Running"
2. Vérifiez que le port dans l'URL correspond au port configuré dans le service
3. Vérifiez les logs du service pour voir sur quel port il écoute

### Les erreurs 500 persistent

**Solution :**

1. Vérifiez que vous avez bien configuré **TOUTES** les variables `*_SERVICE_URL`
2. Vérifiez que les domaines sont corrects (copiez-les depuis Railway)
3. Vérifiez que les ports sont corrects
4. Redéployez l'API Gateway après avoir modifié les variables
5. Vérifiez les logs de l'API Gateway pour voir les erreurs exactes

## 📋 Checklist finale

- [ ] J'ai trouvé tous les domaines Railway de mes services (Settings → Networking)
- [ ] J'ai configuré toutes les variables `*_SERVICE_URL` dans l'API Gateway
- [ ] Les URLs utilisent `http://` et se terminent par `.railway.internal`
- [ ] Les ports correspondent aux ports configurés dans chaque service
- [ ] Tous les services sont dans le même projet Railway
- [ ] Tous les services sont "Running"
- [ ] J'ai redéployé l'API Gateway après avoir modifié les variables
- [ ] Les logs montrent que les variables d'environnement sont utilisées `(env)`
- [ ] L'endpoint `/api/health/services` fonctionne
- [ ] Les erreurs 500 ont disparu

## 💡 Astuce

Pour éviter les erreurs de frappe :

1. Copiez directement les domaines depuis Railway (Settings → Networking)
2. Collez-les dans les variables d'environnement
3. Ajoutez seulement `http://` au début et `:PORT` à la fin
