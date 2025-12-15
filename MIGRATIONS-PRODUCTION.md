# 🔧 Résolution : Tables manquantes en production

## Problème

En production, vous avez des erreurs :
- `relation "users" does not exist` → Table `users` manquante
- `relation "categories" does not exist` → Table `categories` manquante

**Causes :** Les migrations de base de données ne s'exécutent pas car les fichiers SQL ne sont pas accessibles après la compilation TypeScript.

## ✅ Solution : Copier les fichiers SQL dans les Dockerfiles

Les fichiers SQL doivent être copiés dans le dossier `dist/` après la compilation TypeScript.

### Pour auth-service

Modifiez `services/auth-service/Dockerfile` :

```dockerfile
# Après la compilation TypeScript (ligne 34)
RUN npm run build

# ===== COPIER LES FICHIERS SQL DE MIGRATION =====
# Les fichiers SQL ne sont pas copiés par TypeScript, il faut les copier manuellement
RUN mkdir -p dist/src/migrations && \
    cp -r src/migrations/*.sql dist/src/migrations/ || true

# ===== OPTIMISATION DE L'IMAGE =====
RUN npm prune --production
```

### Pour product-service

Modifiez `services/product-service/Dockerfile` :

```dockerfile
# Après la compilation TypeScript (ligne 34)
RUN npm run build

# ===== COPIER LES FICHIERS SQL DE MIGRATION =====
# Les fichiers SQL ne sont pas copiés par TypeScript, il faut les copier manuellement
RUN mkdir -p dist/src/migrations && \
    cp -r src/migrations/*.sql dist/src/migrations/ || true

# ===== OPTIMISATION DE L'IMAGE =====
RUN npm prune --production
```

### Pour tous les autres services

Appliquez la même modification à tous les services qui ont des migrations :
- `customer-service/Dockerfile`
- `order-service/Dockerfile`
- `cart-service/Dockerfile`
- `payment-service/Dockerfile`
- `email-service/Dockerfile`

## 🔍 Vérification

Après avoir modifié les Dockerfiles :

1. **Commitez et pushez les modifications**
2. **Redéployez les services dans Railway**
3. **Vérifiez les logs** - vous devriez voir :
   ```
   📝 Exécution des migrations de base de données...
   📝 Exécution de la migration : 001_create_users_table.sql
   ✅ Migration 001_create_users_table.sql terminée avec succès
   ...
   🎉 Toutes les migrations ont été exécutées avec succès !
   ```

4. **Vérifiez que les tables existent** - les erreurs `relation does not exist` devraient disparaître

## 📋 Checklist

- [ ] J'ai modifié tous les Dockerfiles des services avec migrations
- [ ] J'ai ajouté la copie des fichiers SQL après `npm run build`
- [ ] J'ai committé et pushé les modifications
- [ ] J'ai redéployé tous les services dans Railway
- [ ] Les logs montrent que les migrations s'exécutent
- [ ] Les erreurs `relation does not exist` ont disparu

## 🆘 Si les migrations ne s'exécutent toujours pas

1. **Vérifiez les logs** pour voir s'il y a des erreurs de migration
2. **Vérifiez que `DATABASE_URL` est correctement configuré** dans Railway
3. **Vérifiez que la base de données est accessible** depuis le service
4. **Vérifiez que les fichiers SQL sont bien dans `dist/src/migrations/`** dans l'image Docker
