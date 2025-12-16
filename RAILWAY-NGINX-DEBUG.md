# 🔧 Debug nginx "Application failed to respond"

## Problème

L'erreur "Application failed to respond" signifie que nginx ne démarre pas ou crash immédiatement.

## Étapes de diagnostic

### 1. Vérifier les logs nginx dans Railway

**Dans Railway :**
- Service **Nginx** → **Logs**
- Cherchez les messages d'erreur

Le script d'entrée affiche maintenant des messages clairs :

**Si vous voyez :**
```
❌ ERREUR: FRONTEND_URL n'est pas définie
```
→ La variable `FRONTEND_URL` manque dans Railway

**Si vous voyez :**
```
❌ ERREUR: FRONTEND_HOST est vide après extraction de FRONTEND_URL=...
```
→ La variable `FRONTEND_URL` est mal formatée

**Si vous voyez :**
```
❌ ERREUR: La configuration nginx est invalide
```
→ Il y a une erreur de syntaxe dans la configuration nginx

### 2. Vérifier les variables d'environnement nginx

**Dans Railway :**
- Service **Nginx** → **Settings** → **Variables**

**Vérifiez que ces 3 variables sont définies :**

```bash
FRONTEND_URL=http://VOTRE-NOM-FRONTEND.railway.internal:3000
BACKOFFICE_URL=http://VOTRE-NOM-BACKOFFICE.railway.internal:3000
API_GATEWAY_URL=http://VOTRE-NOM-API-GATEWAY.railway.internal:3020
```

**⚠️ IMPORTANT :**
- Remplacez `VOTRE-NOM-FRONTEND`, etc. par les **noms exacts** de vos services Railway
- Les noms sont **sensibles à la casse** (Frontend ≠ frontend)
- Format : `http://service-name.railway.internal:port` (pas `https://`)
- Pas d'espace avant/après les valeurs

**Comment trouver les noms exacts de vos services :**
1. Dans Railway, regardez la liste de vos services
2. Le nom exact est celui affiché dans la liste (ex: "frontend-production", "Frontend-Production", etc.)
3. Utilisez exactement ce nom dans les variables

### 3. Vérifier que les services backend sont démarrés

**Dans Railway :**
- Vérifiez que les services **Frontend**, **Backoffice**, et **API Gateway** sont démarrés
- Leur statut doit être "Active" ou "Running"

### 4. Test de connexion entre services

Si nginx démarre mais ne peut pas se connecter aux services :

**Vérifiez les noms de services :**
- Le nom dans Railway doit correspondre exactement au nom dans les variables
- Exemple : Si votre service s'appelle "frontend-production", utilisez :
  ```bash
  FRONTEND_URL=http://frontend-production.railway.internal:3000
  ```

### 5. Redéployer nginx après correction

Après avoir corrigé les variables :
1. Service **Nginx** → **Deployments**
2. Cliquez sur **Redeploy**

## Messages d'erreur courants et solutions

### "FRONTEND_URL n'est pas définie"
**Solution :** Ajoutez la variable dans Railway → Service Nginx → Variables

### "FRONTEND_HOST est vide"
**Solution :** Vérifiez le format de `FRONTEND_URL` :
- ✅ Correct : `http://frontend.railway.internal:3000`
- ❌ Incorrect : `https://frontend.railway.internal:3000` (pas https)
- ❌ Incorrect : `frontend.railway.internal:3000` (manque http://)
- ❌ Incorrect : `http://frontend.railway.internal` (manque le port)

### "La configuration nginx est invalide"
**Solution :** 
1. Vérifiez les logs pour voir l'erreur exacte de nginx
2. Vérifiez que les variables sont bien remplacées dans la config
3. Le script affiche le contenu de la config en cas d'erreur

### "invalid host in upstream"
**Solution :** Les variables n'ont pas été correctement extraites. Vérifiez le format des URLs.

## Checklist de vérification

- [ ] Service Nginx redéployé avec le nouveau script
- [ ] Variable `FRONTEND_URL` définie et correctement formatée
- [ ] Variable `BACKOFFICE_URL` définie et correctement formatée
- [ ] Variable `API_GATEWAY_URL` définie et correctement formatée
- [ ] Noms des services correspondent exactement (sensible à la casse)
- [ ] Format des URLs : `http://service-name.railway.internal:port`
- [ ] Services backend (Frontend, Backoffice, API Gateway) démarrés
- [ ] Logs nginx consultés pour voir les messages d'erreur

## Exemple de configuration correcte

Si vos services Railway s'appellent :
- `frontend-production`
- `backoffice-production`
- `api-gateway-production`

Alors les variables doivent être :

```bash
FRONTEND_URL=http://frontend-production.railway.internal:3000
BACKOFFICE_URL=http://backoffice-production.railway.internal:3000
API_GATEWAY_URL=http://api-gateway-production.railway.internal:3020
```

## Prochaines étapes

1. **Consultez les logs nginx** dans Railway
2. **Copiez les messages d'erreur** que vous voyez
3. **Vérifiez les variables** selon les instructions ci-dessus
4. **Redéployez nginx** après correction
