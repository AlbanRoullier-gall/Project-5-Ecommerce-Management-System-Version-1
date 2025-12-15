# 🔗 Communication inter-services dans Railway

## Problème

Dans Railway, les services **ne communiquent PAS** via les noms Docker classiques (`product-service:3002`) comme dans Docker Compose.

Railway utilise le **Private Networking** avec des domaines spéciaux.

## ✅ Solution : Utiliser Railway Private Networking

### Format des URLs

Dans Railway, les services communiquent via :
```
http://service-name.railway.internal:PORT
```

**Exemple :**
- `http://product-service.railway.internal:3002`
- `http://cart-service.railway.internal:3004`
- `http://auth-service.railway.internal:3008`

### Configuration automatique

Le code a été mis à jour pour utiliser automatiquement le Private Networking Railway en production.

**Si vous avez configuré les variables d'environnement** (`PRODUCT_SERVICE_URL`, etc.), elles seront utilisées en priorité.

**Si vous n'avez PAS configuré les variables**, le code utilisera automatiquement `service-name.railway.internal`.

## 📋 Configuration dans Railway

### Option 1 : Configurer manuellement les variables (RECOMMANDÉ)

**Vous DEVEZ configurer les variables `*_SERVICE_URL` avec les vrais domaines Railway.**

Railway génère des domaines basés sur le nom du service dans Railway. Pour trouver ces domaines :

1. **Railway** → Votre projet → **Service** (ex: product-service)
2. **Settings** → **Networking**
3. Cherchez **"Private Network"** ou **"Internal Domain"**
4. Vous verrez quelque chose comme : `ideal-courtesy.railway.internal` ou `product-service.railway.internal`

**Configurez ensuite dans l'API Gateway :**

Railway → **API Gateway** → **Settings** → **Variables**

Ajoutez pour chaque service :
```env
PRODUCT_SERVICE_URL=http://ideal-courtesy.railway.internal:3002
CART_SERVICE_URL=http://autre-nom.railway.internal:3004
CUSTOMER_SERVICE_URL=http://encore-un-autre.railway.internal:3001
ORDER_SERVICE_URL=http://nom-service.railway.internal:3003
AUTH_SERVICE_URL=http://auth-nom.railway.internal:3008
PAYMENT_SERVICE_URL=http://payment-nom.railway.internal:3007
EMAIL_SERVICE_URL=http://email-nom.railway.internal:3006
PDF_EXPORT_SERVICE_URL=http://pdf-nom.railway.internal:3040
```

**⚠️ IMPORTANT :** Remplacez les noms par les vrais domaines de vos services dans Railway !

### Option 2 : Laisser le code gérer automatiquement (si les noms correspondent)

**Si vos services s'appellent exactement `product-service`, `cart-service`, etc. dans Railway**, vous pouvez ne pas configurer les variables.

Le code utilisera automatiquement `product-service.railway.internal`, `cart-service.railway.internal`, etc.

### Option 2 : Configurer manuellement les variables

Si vous préférez configurer manuellement, utilisez les domaines `railway.internal` :

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

## ⚠️ Conditions importantes

### 1. Tous les services doivent être dans le même projet Railway

Le Private Networking Railway fonctionne **uniquement** entre services du même projet.

**Vérifiez :**
- Tous vos services (API Gateway, product-service, cart-service, etc.) sont dans le même projet Railway
- Ils ne sont pas dans des projets différents

### 2. Les noms de services doivent correspondre

Le nom dans `railway.internal` correspond au **nom du service dans Railway**.

**Exemple :**
- Si votre service s'appelle `product-service` dans Railway → `product-service.railway.internal`
- Si votre service s'appelle `product` dans Railway → `product.railway.internal`

**Vérifiez les noms :**
1. Railway → Votre projet
2. Regardez le nom de chaque service
3. Assurez-vous que les noms correspondent à ceux utilisés dans le code

### 3. Les ports doivent être corrects

Chaque service doit écouter sur le port configuré dans Railway.

**Vérifiez :**
- Railway → Service → Settings → Variables
- Vérifiez que `PORT` est configuré correctement :
  - product-service : `PORT=3002`
  - cart-service : `PORT=3004`
  - etc.

## 🔍 Vérification

### 1. Vérifier les logs de l'API Gateway

Après le redéploiement, les logs devraient montrer :

```
[Config] Railway production: product-service -> http://product-service.railway.internal:3002
[Config] Railway production: cart-service -> http://cart-service.railway.internal:3004
...
```

### 2. Tester l'endpoint de diagnostic

```
https://api-gateway-production-91f9.up.railway.app/api/health/services
```

Cet endpoint devrait maintenant pouvoir contacter les services backend.

### 3. Vérifier les erreurs dans les logs

Si vous voyez toujours des erreurs `ECONNREFUSED` ou `ENOTFOUND` :

1. Vérifiez que tous les services sont dans le même projet Railway
2. Vérifiez que les noms de services correspondent
3. Vérifiez que les services sont "Running"
4. Vérifiez les ports dans les variables d'environnement

## 🛠️ Dépannage

### Erreur : `ENOTFOUND product-service.railway.internal`

**Causes :**
- Le service n'est pas dans le même projet Railway
- Le nom du service est incorrect

**Solution :**
1. Vérifiez que tous les services sont dans le même projet
2. Vérifiez le nom exact du service dans Railway
3. Si le nom est différent, configurez manuellement les variables `*_SERVICE_URL`

### Erreur : `ECONNREFUSED`

**Causes :**
- Le service n'est pas démarré
- Le port est incorrect

**Solution :**
1. Vérifiez que le service est "Running" dans Railway
2. Vérifiez les logs du service pour voir s'il écoute sur le bon port
3. Vérifiez la variable `PORT` dans Railway

### Les services ne communiquent toujours pas

**Solution :**
1. **Supprimez toutes les variables `*_SERVICE_URL`** de l'API Gateway dans Railway
2. **Redéployez l'API Gateway** pour que le code utilise automatiquement `railway.internal`
3. **Vérifiez les logs** pour confirmer que les URLs `railway.internal` sont utilisées

## 📝 Résumé

1. **Tous les services dans le même projet Railway** ✅
2. **Les noms de services correspondent** ✅
3. **Les ports sont corrects** ✅
4. **Le code utilise automatiquement `railway.internal` en production** ✅
5. **Redéployez l'API Gateway** après les modifications ✅
