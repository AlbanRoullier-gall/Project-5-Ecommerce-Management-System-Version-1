# Configuration API Gateway pour Railway

## 📋 Variables d'environnement requises

### Étape 1 : Configuration de base (lignes 162-174 du guide)

Ces variables doivent être configurées lors de la création du service API Gateway :

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
REDIS_URL=${{Redis.REDIS_URL}}
PORT=3020
```

**Note :** `REDIS_URL` est optionnel pour l'API Gateway (utilisé par le cart-service). Vous pouvez l'omettre si vous n'avez pas de service Redis configuré.

### Étape 2 : Configuration CORS (après création Frontend et Backoffice)

**⚠️ IMPORTANT :** Cette variable doit être ajoutée APRÈS avoir créé les services Frontend et Backoffice et obtenu leurs domaines Railway.

```env
ALLOWED_ORIGINS=https://VOTRE-FRONTEND-DOMAINE.up.railway.app,https://VOTRE-BACKOFFICE-DOMAINE.up.railway.app
```

**Exemple concret :**

```env
ALLOWED_ORIGINS=https://frontend-production-27ff.up.railway.app,https://backoffice-production-ea2c.up.railway.app
```

## ✅ Checklist de vérification

Vérifiez que votre API Gateway dans Railway a :

- [ ] `NODE_ENV=production`
- [ ] `DOCKER_ENV=true`
- [ ] `JWT_SECRET` (avec une valeur sécurisée)
- [ ] `CUSTOMER_SERVICE_URL=http://customer-service:3001`
- [ ] `PRODUCT_SERVICE_URL=http://product-service:3002`
- [ ] `ORDER_SERVICE_URL=http://order-service:3003`
- [ ] `CART_SERVICE_URL=http://cart-service:3004`
- [ ] `AUTH_SERVICE_URL=http://auth-service:3008`
- [ ] `PAYMENT_SERVICE_URL=http://payment-service:3007`
- [ ] `EMAIL_SERVICE_URL=http://email-service:3006`
- [ ] `PDF_EXPORT_SERVICE_URL=http://pdf-export-service:3040`
- [ ] `PORT=3020`
- [ ] `ALLOWED_ORIGINS` (avec les URLs de votre Frontend et Backoffice)

## 🔍 Vérification de la configuration

### 1. Vérifier les URLs des services

L'API Gateway affiche les URLs configurées au démarrage. Vérifiez les logs Railway pour voir :

```
🔗 Services URLs:
   Auth: http://auth-service:3008
   Customer: http://customer-service:3001
   Product: http://product-service:3002
   ...
```

### 2. Vérifier l'état des services

Utilisez l'endpoint de diagnostic :

```
GET https://VOTRE-API-GATEWAY-DOMAINE.up.railway.app/api/health/services
```

Cet endpoint retourne l'état de tous les services backend et vous indique lesquels sont disponibles.

### 3. Vérifier CORS

Si `ALLOWED_ORIGINS` n'est pas configuré, vous verrez dans les logs :

```
⚠️⚠️⚠️ CORS: ALLOWED_ORIGINS non configuré en PRODUCTION!
⚠️⚠️⚠️ Mode permissif activé temporairement - CONFIGUREZ ALLOWED_ORIGINS dans Railway!
```

## 🐛 Problèmes courants

### Erreur 500 "Erreur de communication avec le service"

**Causes possibles :**

1. Le service backend n'est pas démarré
2. L'URL du service est incorrecte
3. Le service backend n'est pas accessible depuis l'API Gateway (problème de réseau Docker)

**Solution :**

- Vérifiez que tous les services backend sont démarrés dans Railway
- Vérifiez les logs de l'API Gateway pour voir les erreurs détaillées
- Utilisez `/api/health/services` pour voir l'état de tous les services

### Erreur CORS

**Causes possibles :**

1. `ALLOWED_ORIGINS` n'est pas configuré
2. Les URLs dans `ALLOWED_ORIGINS` ne correspondent pas aux domaines réels
3. Les URLs ne commencent pas par `https://`

**Solution :**

- Vérifiez que `ALLOWED_ORIGINS` contient les URLs exactes de vos frontends
- Les URLs doivent commencer par `https://`
- Vérifiez les logs pour voir quelles origines sont rejetées

## 📝 Notes importantes

1. **Ordre de configuration :** Configurez d'abord les variables de base, puis ajoutez `ALLOWED_ORIGINS` après avoir créé Frontend et Backoffice.

2. **Noms de services Docker :** Dans Railway, les services communiquent via les noms de services Docker (ex: `customer-service:3001`). Ne changez pas ces noms.

3. **Ports :** L'API Gateway écoute sur le port 3020 en interne. Railway expose ce port automatiquement via son domaine public.

4. **REDIS_URL :** Cette variable est optionnelle pour l'API Gateway. Elle est utilisée par le cart-service, pas par l'API Gateway directement.

5. **Tous les services dans le même projet :** Tous les services (API Gateway, auth-service, customer-service, etc.) doivent être dans le **même projet Railway** pour que la communication inter-services fonctionne.

## 🔍 Diagnostic des erreurs 500

Si vous avez des erreurs 500, consultez le fichier `DIAGNOSTIC-RAILWAY.md` pour un guide de diagnostic complet.

**Test rapide :** Utilisez l'endpoint de diagnostic :

```
GET https://VOTRE-API-GATEWAY-DOMAINE.up.railway.app/api/health/services
```

Cet endpoint vous indiquera quels services sont accessibles et lesquels ne le sont pas.
