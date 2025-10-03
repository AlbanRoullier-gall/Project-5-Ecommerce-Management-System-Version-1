# 📋 Structure des Routes - Product Service

## 🔓 ROUTES PUBLIQUES (Accès libre)

Ces routes sont accessibles sans authentification et permettent la consultation des données pour le frontend public.

### 📦 GESTION DES PRODUITS (PUBLIQUE)

- **GET /api/products** → Lister tous les produits
- **GET /api/products/:id** → Récupérer un produit spécifique

### 📂 GESTION DES CATÉGORIES (PUBLIQUE)

- **GET /api/categories** → Lister toutes les catégories

## 🔒 ROUTES ADMIN (Authentification requise)

Ces routes nécessitent une authentification admin via l'API-Gateway et permettent la gestion complète des données.

### 📦 GESTION DES PRODUITS (ADMIN)

- **POST /api/admin/products** → Créer un nouveau produit
- **GET /api/admin/products** → Lister tous les produits (admin)
- **GET /api/admin/products/:id** → Récupérer un produit spécifique (admin)
- **PUT /api/admin/products/:id** → Modifier un produit
- **DELETE /api/admin/products/:id** → Supprimer un produit
- **PATCH /api/admin/products/:id/toggle** → Activer/désactiver un produit
- **POST /api/admin/products/:id/activate** → Activer un produit
- **POST /api/admin/products/:id/deactivate** → Désactiver un produit
- **POST /api/admin/products/with-images** → Créer produit avec images

### 📂 GESTION DES CATÉGORIES (ADMIN)

- **POST /api/admin/categories** → Créer une nouvelle catégorie
- **GET /api/admin/categories** → Lister toutes les catégories (admin)
- **GET /api/admin/categories/:id** → Récupérer une catégorie spécifique
- **PUT /api/admin/categories/:id** → Modifier une catégorie
- **DELETE /api/admin/categories/:id** → Supprimer une catégorie

### 🖼️ GESTION DES IMAGES DE PRODUITS (ADMIN)

- **POST /api/admin/products/:id/images** → Ajouter une image à un produit
- **GET /api/admin/products/:id/images** → Lister les images d'un produit
- **GET /api/admin/images/:imageId** → Récupérer une image spécifique
- **PUT /api/admin/images/:imageId** → Modifier une image
- **DELETE /api/admin/products/:id/images/:imageId** → Supprimer une image d'un produit

## 🔐 SÉCURITÉ

- **Routes publiques** : Accès libre pour consultation
- **Routes admin** : Authentification requise via headers `x-user-id` et `x-user-email`
- **Middleware** : `requireAuth` appliqué à toutes les routes admin
- **Validation** : Schémas Joi pour validation des données d'entrée

## 📊 RÉSUMÉ

- **Routes publiques** : 3 routes (consultation uniquement)
- **Routes admin** : 19 routes (gestion complète)
- **Total** : 22 routes
