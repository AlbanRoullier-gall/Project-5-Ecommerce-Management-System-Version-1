# Problème d'affichage des images de produits en production Railway

## Problème identifié

Les images de produits ne s'affichent pas dans le backoffice et le frontend en production sur Railway.

## Cause racine

Le problème principal est que **les images sont stockées dans le système de fichiers local** (`uploads/products/`) du service product-service, mais **en production sur Railway, le système de fichiers est éphémère**.

Cela signifie que :

- Les fichiers images sont perdus à chaque redéploiement du service
- Les fichiers images sont perdus lors d'un redémarrage du conteneur
- Les fichiers images ne sont pas partagés entre les instances si le service est mis à l'échelle

## Architecture actuelle

1. **Upload d'images** : Les images sont uploadées via base64 et stockées dans `uploads/products/` du product-service
2. **Stockage** : Les métadonnées (id, filename, file_path) sont stockées dans la base de données PostgreSQL
3. **Service des images** : Deux routes servent les images :
   - `/api/images/:imageId` - Lit le fichier depuis le système de fichiers via `serveProductImageFile`
   - `/uploads/*` - Sert les fichiers statiques via `express.static`

## Solutions proposées

### Solution 1 : Utiliser un volume Railway persistant (Recommandé pour Railway)

Railway supporte les volumes persistants qui survivent aux redéploiements.

**Avantages** :

- Simple à mettre en place
- Pas besoin de service externe
- Compatible avec l'architecture actuelle

**Inconvénients** :

- Limité à Railway
- Pas de réplication automatique
- Limite de taille selon le plan Railway

**Implémentation** :

1. Créer un volume Railway pour le product-service
2. Monter le volume sur `/app/uploads` dans le conteneur
3. Modifier le Dockerfile pour créer le dossier uploads dans le volume

### Solution 2 : Utiliser un service de stockage cloud (S3, Cloudinary, etc.)

Stocker les images dans un service de stockage cloud externe.

**Avantages** :

- Persistance garantie
- Scalable
- CDN intégré (pour certains services)
- Pas de limite de taille (selon le service)

**Inconvénients** :

- Coût supplémentaire
- Dépendance externe
- Nécessite une refactorisation du code

**Services recommandés** :

- **AWS S3** : Standard de l'industrie, très fiable
- **Cloudinary** : Spécialisé dans les images, transformations intégrées
- **Railway Blob Storage** : Si disponible, intégration native

### Solution 3 : Stocker les images en base64 dans la base de données

Stocker les images directement dans PostgreSQL en base64.

**Avantages** :

- Pas de système de fichiers nécessaire
- Persistance garantie (base de données)
- Simple à implémenter

**Inconvénients** :

- Taille de la base de données augmente rapidement
- Performance dégradée pour les grandes images
- Limite de taille PostgreSQL (1GB par ligne)

**Recommandation** : Non recommandé pour la production

## Solution recommandée : Volume Railway

Pour une solution rapide et efficace sur Railway, utiliser un volume persistant.

### Étapes d'implémentation

1. **Créer un volume Railway** :

   - Dans le dashboard Railway, créer un volume pour le product-service
   - Nommer le volume : `product-images`

2. **Modifier le Dockerfile du product-service** :

   ```dockerfile
   # Créer le dossier uploads dans le volume
   VOLUME ["/app/uploads"]
   ```

3. **Configurer Railway** :

   - Dans les variables d'environnement du service, Railway montera automatiquement le volume
   - Le volume sera monté sur `/app/uploads` dans le conteneur

4. **Vérifier que le code crée le dossier** :
   Le code actuel dans `ProductService.ts` crée déjà le dossier `uploads/products` si nécessaire, donc pas de modification nécessaire.

## Corrections apportées

1. ✅ **Uniformisation de l'utilisation des images** :

   - Le backoffice utilise maintenant `imageService` au lieu de construire les URLs manuellement
   - Tous les composants utilisent maintenant `imageService.getImageUrlById()` ou `imageService.getImageUrl()`

2. ✅ **Routes d'images vérifiées** :
   - `/api/images/:imageId` est correctement proxifiée dans l'API Gateway
   - `/uploads/*` est correctement proxifiée dans l'API Gateway

## Prochaines étapes

1. **Implémenter un volume Railway** pour le product-service
2. **Tester** que les images persistent après un redéploiement
3. **Documenter** la configuration du volume dans le README

## Notes importantes

- Les images existantes dans la base de données mais dont les fichiers n'existent plus dans le système de fichiers retourneront une erreur 404
- Il faudra peut-être re-uploader les images après avoir configuré le volume
- Pour une solution à long terme, considérer l'utilisation d'un service de stockage cloud (S3, Cloudinary)
