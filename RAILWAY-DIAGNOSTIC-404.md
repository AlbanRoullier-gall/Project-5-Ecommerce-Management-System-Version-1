# 🔍 Diagnostic des erreurs 404 API

## Problème

Les requêtes API retournent une page 404 HTML de Next.js au lieu d'une réponse JSON de l'API Gateway.

## Causes possibles

### 1. `NEXT_PUBLIC_API_URL` mal configuré

**Vérification :**

Dans Railway, allez dans votre service **Backoffice** → **Settings** → **Variables**

Vérifiez que `NEXT_PUBLIC_API_URL` est défini et pointe vers le **domaine nginx**, pas vers le backoffice :

```bash
# ✅ CORRECT
NEXT_PUBLIC_API_URL=https://nginx-production-ac30.up.railway.app

# ❌ INCORRECT (pointe vers le backoffice)
NEXT_PUBLIC_API_URL=https://backoffice-production-xyz.up.railway.app
```

**Action :** Si ce n'est pas le cas, modifiez la variable pour pointer vers votre domaine nginx.

### 2. Le service nginx n'a pas été redéployé

Après avoir modifié `routing.conf`, le service nginx doit être redéployé.

**Action :** Dans Railway, allez dans votre service **Nginx** → **Deployments** → Cliquez sur **Redeploy**

### 3. Les variables d'environnement nginx ne sont pas définies

Vérifiez que ces variables sont définies dans le service **Nginx** :

```bash
FRONTEND_URL=http://frontend.railway.internal:3000
BACKOFFICE_URL=http://backoffice.railway.internal:3000
API_GATEWAY_URL=http://api-gateway.railway.internal:3020
```

**⚠️ Important :** Remplacez `frontend`, `backoffice`, `api-gateway` par les **noms exacts** de vos services Railway (sensible à la casse).

### 4. Test direct de l'API Gateway

Testez si l'API Gateway répond directement :

```bash
curl https://nginx-production-ac30.up.railway.app/api/health
```

Si cela retourne une erreur, vérifiez :
- Que le service API Gateway est démarré
- Que les variables nginx sont correctes
- Que nginx route correctement `/api/` vers l'API Gateway

### 5. Vérification dans les logs

**Logs nginx :**
- Allez dans Railway → Service Nginx → Logs
- Vérifiez si les requêtes `/api/` arrivent bien à nginx

**Logs API Gateway :**
- Allez dans Railway → Service API Gateway → Logs
- Vérifiez si les requêtes arrivent bien à l'API Gateway

## Checklist de vérification

- [ ] `NEXT_PUBLIC_API_URL` dans Backoffice pointe vers le domaine nginx
- [ ] `NEXT_PUBLIC_API_URL` dans Frontend pointe vers le domaine nginx
- [ ] Service nginx redéployé après modification de `routing.conf`
- [ ] Variables `FRONTEND_URL`, `BACKOFFICE_URL`, `API_GATEWAY_URL` définies dans nginx
- [ ] Noms des services Railway corrects (sensible à la casse)
- [ ] Service API Gateway démarré et accessible
- [ ] `ALLOWED_ORIGINS` dans API Gateway contient le domaine nginx

## Solution rapide

1. **Vérifiez `NEXT_PUBLIC_API_URL` dans Backoffice :**
   ```bash
   NEXT_PUBLIC_API_URL=https://nginx-production-ac30.up.railway.app
   ```
   (Remplacez par votre domaine nginx)

2. **Redéployez le Backoffice** pour que la nouvelle variable soit prise en compte

3. **Vérifiez les variables nginx :**
   ```bash
   FRONTEND_URL=http://VOTRE-NOM-FRONTEND.railway.internal:3000
   BACKOFFICE_URL=http://VOTRE-NOM-BACKOFFICE.railway.internal:3000
   API_GATEWAY_URL=http://VOTRE-NOM-API-GATEWAY.railway.internal:3020
   ```

4. **Redéployez nginx** si vous avez modifié les variables

5. **Testez :**
   ```bash
   curl https://nginx-production-ac30.up.railway.app/api/health
   ```
