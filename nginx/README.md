# Configuration Nginx

Ce dossier contient les configurations nginx pour l'architecture microservices.

## Structure

- `nginx.conf` : Configuration principale nginx
- `backoffice.conf` : Configuration spécifique pour le backoffice (proxy inverse)

## Configuration Backoffice

Le fichier `backoffice.conf` configure nginx comme proxy inverse pour le backoffice :

- **Routes `/api/*`** : Redirigées vers l'API Gateway (`api-gateway:3000`)
- **Autres routes** : Redirigées vers Next.js (`localhost:3000`)
- **Buffers optimisés** : Configuration pour gérer les en-têtes volumineux

## Utilisation

La configuration est automatiquement copiée dans le conteneur Docker du backoffice lors du build.

## Ajout de nouveaux services

Pour ajouter un nouveau service avec nginx :

1. Créer un fichier `service-name.conf` dans ce dossier
2. Modifier le Dockerfile du service pour copier la configuration
3. Configurer les routes et proxys selon les besoins
