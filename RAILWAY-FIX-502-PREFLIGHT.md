# 🔧 Solution : Erreur 502 sur requêtes Preflight (OPTIONS)

## Problème

Les requêtes preflight (OPTIONS) obtiennent une erreur **502 Bad Gateway**, ce qui bloque toutes les requêtes API à cause de CORS.

## Cause

Nginx ne peut pas se connecter à l'API Gateway pour les requêtes OPTIONS (et probablement toutes les requêtes).

## Diagnostic

### 1. Vérifier le nom exact du service API Gateway

**Dans Railway :**
1. Regardez la liste de vos services
2. Trouvez le service API Gateway
3. **Notez le nom exact** (ex: "api-gateway", "api-gateway-production", "API-Gateway", etc.)
4. Les noms sont **sensibles à la casse**

### 2. Vérifier `API_GATEWAY_URL` dans nginx

**Dans Railway :**
- Service **Nginx** → **Settings** → **Variables**
- Vérifiez `API_GATEWAY_URL`

**Actuellement vous avez :**
```bash
API_GATEWAY_URL=http://api-gateway.railway.internal:3020
```

**⚠️ Le nom `api-gateway` doit correspondre EXACTEMENT au nom de votre service dans Railway.**

**Exemples :**
- Si votre service s'appelle `api-gateway-production` :
  ```bash
  API_GATEWAY_URL=http://api-gateway-production.railway.internal:3020
  ```
- Si votre service s'appelle `API-Gateway` :
  ```bash
  API_GATEWAY_URL=http://API-Gateway.railway.internal:3020
  ```

### 3. Vérifier les logs API Gateway

**Dans Railway :**
- Service **API Gateway** → **Logs**
- Vérifiez si le service démarre correctement
- Cherchez des messages comme :
  - `Server running on port 3020` → ✅ Le service démarre
  - `Error: Cannot connect to...` → ❌ Problème de connexion
  - `Error: Missing environment variable...` → ❌ Variable manquante

### 4. Vérifier le statut de l'API Gateway

**Dans Railway :**
- Service **API Gateway** → Vérifiez le statut
- Doit être "Active" ou "Running"
- Si le service est arrêté ou en erreur, redémarrez-le

## Solution

### Étape 1 : Trouver le nom exact du service API Gateway

1. Dans Railway, regardez la liste de vos services
2. Trouvez le service API Gateway
3. **Copiez le nom exact** (sensible à la casse)

### Étape 2 : Corriger `API_GATEWAY_URL` dans nginx

1. Railway → Service **Nginx** → **Settings** → **Variables**
2. Cliquez sur `API_GATEWAY_URL`
3. Modifiez pour utiliser le **nom exact** de votre service :
   ```bash
   API_GATEWAY_URL=http://NOM-EXACT-DE-VOTRE-SERVICE.railway.internal:3020
   ```
4. Cliquez sur **Save**
5. **Redéployez** nginx (Deployments → Redeploy)

### Étape 3 : Vérifier que l'API Gateway démarre

1. Consultez les logs de l'API Gateway
2. Vérifiez qu'il n'y a pas d'erreurs de démarrage
3. Si le service crash, corrigez les erreurs dans les logs

### Étape 4 : Tester

Après redéploiement, testez :
```bash
curl https://nginx-production-ac30.up.railway.app/api/health
```

**Si cela retourne du JSON :**
- ✅ Nginx peut se connecter à l'API Gateway
- Les requêtes API devraient fonctionner

**Si cela retourne toujours 502 :**
- ❌ Vérifiez que le nom du service est correct
- ❌ Vérifiez que l'API Gateway est démarré
- ❌ Consultez les logs nginx pour voir les erreurs de connexion

## Exemple de configuration correcte

Si votre service API Gateway s'appelle `api-gateway-production` dans Railway :

**Dans nginx :**
```bash
API_GATEWAY_URL=http://api-gateway-production.railway.internal:3020
```

**Dans API Gateway (pour référence) :**
```bash
ALLOWED_ORIGINS=https://nginx-production-ac30.up.railway.app
```

## Checklist

- [ ] Nom exact du service API Gateway identifié dans Railway
- [ ] `API_GATEWAY_URL` dans nginx utilise le nom exact (sensible à la casse)
- [ ] Service API Gateway démarré et actif
- [ ] Logs API Gateway consultés (pas d'erreurs de démarrage)
- [ ] Nginx redéployé après modification de `API_GATEWAY_URL`
- [ ] Test `/api/health` fonctionne (retourne du JSON)
