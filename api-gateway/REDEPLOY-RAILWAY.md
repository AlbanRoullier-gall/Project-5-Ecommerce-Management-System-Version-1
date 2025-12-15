# 🚀 Comment redéployer l'API Gateway dans Railway

## Méthode 1 : Redéploiement manuel (le plus rapide)

### Étapes :

1. **Allez dans Railway**
   - Ouvrez [railway.app](https://railway.app)
   - Connectez-vous à votre compte
   - Sélectionnez votre projet

2. **Trouvez le service API Gateway**
   - Dans la liste des services, cliquez sur **API Gateway**

3. **Redéployez le service**
   - Cliquez sur l'onglet **"Deployments"** (ou **"Deploy"** dans les paramètres)
   - Cliquez sur le bouton **"Redeploy"** ou **"Deploy"**
   - Ou cliquez sur les **3 points** (⋯) à côté du service → **"Redeploy"**

4. **Attendez la fin du déploiement**
   - Vous verrez les logs de build en temps réel
   - Attendez que le statut passe à **"Running"** (vert)
   - Cela peut prendre 2-5 minutes

5. **Vérifiez que le service est démarré**
   - Allez dans l'onglet **"Logs"**
   - Cherchez le message :
     ```
     🚀 API GATEWAY - PROXY SIMPLE
     📍 Port: 3020
     ```

## Méthode 2 : Déclencher via Git (automatique)

Si Railway est connecté à votre dépôt Git, il redéploie automatiquement après chaque push.

### Étapes :

1. **Vérifiez que Railway est connecté à Git**
   - Railway → **API Gateway** → **Settings** → **Source**
   - Vérifiez que **"GitHub Repo"** ou **"GitLab Repo"** est configuré

2. **Faites un push (si vous avez des modifications)**
   ```bash
   git add .
   git commit -m "trigger redeploy"
   git push origin main
   ```

3. **Ou forcez un redéploiement vide**
   ```bash
   git commit --allow-empty -m "trigger redeploy api-gateway"
   git push origin main
   ```

4. **Railway détectera automatiquement le changement**
   - Un nouveau déploiement se lancera automatiquement
   - Vous pouvez suivre le déploiement dans Railway → **API Gateway** → **Deployments**

## Méthode 3 : Via l'interface Railway (Settings)

### Étapes :

1. **Railway** → **API Gateway** → **Settings**

2. **Onglet "Deploy"**
   - Cliquez sur **"Redeploy"** ou **"Deploy Latest"**
   - Ou utilisez le bouton **"Clear Build Cache"** puis **"Redeploy"** si vous avez des problèmes de cache

3. **Attendez la fin du déploiement**
   - Suivez les logs dans l'onglet **"Logs"**

## 🔍 Vérifier que le redéploiement a réussi

### 1. Vérifier les logs

Railway → **API Gateway** → **Logs**

**Vous devriez voir :**
```
🚀 API GATEWAY - PROXY SIMPLE
📍 Port: 3020
🔗 Services URLs:
   Product: http://product-service:3002
   ...
💡 Utilisez /api/health/services pour vérifier l'état des services
```

### 2. Tester l'endpoint de base

```
https://api-gateway-production-91f9.up.railway.app/api/health
```

**Réponse attendue :**
```json
{
  "status": "OK",
  "service": "API Gateway",
  "version": "3.0.0"
}
```

### 3. Tester l'endpoint de diagnostic

```
https://api-gateway-production-91f9.up.railway.app/api/health/services
```

**Réponse attendue :**
```json
{
  "gateway": "OK",
  "services": {
    "product": { ... },
    "cart": { ... },
    ...
  }
}
```

## ⚠️ Problèmes courants

### Le redéploiement échoue

**Causes possibles :**
- Erreur de build TypeScript
- Problème avec les dépendances npm
- Erreur dans le Dockerfile

**Solution :**
1. Vérifiez les logs de build dans Railway
2. Identifiez l'erreur
3. Corrigez le problème
4. Redéployez

### Le service ne démarre pas après le redéploiement

**Causes possibles :**
- Erreur au démarrage
- Variables d'environnement manquantes
- Port incorrect

**Solution :**
1. Vérifiez les logs de démarrage
2. Vérifiez les variables d'environnement (Settings → Variables)
3. Vérifiez que `PORT=3020` est configuré

### Le redéploiement prend trop de temps

**Normal :**
- Build TypeScript : 1-2 minutes
- Installation dépendances : 1-2 minutes
- Démarrage : 30 secondes
- **Total : 3-5 minutes**

**Si ça prend plus de 10 minutes :**
- Vérifiez les logs pour voir où ça bloque
- Essayez de redémarrer le service

## 💡 Astuce : Redéploiement rapide

Pour un redéploiement rapide sans attendre Git :

1. Railway → **API Gateway** → **Settings** → **Deploy**
2. Cliquez sur **"Redeploy"**
3. C'est le plus rapide (2-3 minutes)

## 📋 Checklist de redéploiement

- [ ] J'ai cliqué sur "Redeploy" dans Railway
- [ ] Le build s'est terminé sans erreur
- [ ] Le service est "Running" (vert)
- [ ] Les logs montrent le message de démarrage
- [ ] L'endpoint `/api/health` fonctionne
- [ ] L'endpoint `/api/health/services` fonctionne (nouveau)

## 🆘 Si rien ne fonctionne

1. **Vérifiez que le code est bien sur GitHub/GitLab**
2. **Vérifiez que Railway est connecté au bon dépôt**
3. **Vérifiez les logs de build** pour identifier l'erreur
4. **Contactez le support Railway** si le problème persiste
