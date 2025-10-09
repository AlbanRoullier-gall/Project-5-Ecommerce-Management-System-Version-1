# 📷 Guide - Gestion des Images de Produits

## ✨ Fonctionnalités Implémentées

### 1. **Création de Produits avec Images**

Lors de la création d'un nouveau produit, vous pouvez maintenant ajouter jusqu'à **5 images** directement dans le formulaire.

#### Comment faire :

1. Cliquez sur "➕ Nouveau produit"
2. Remplissez les informations du produit (nom, prix, TVA, catégorie)
3. Dans la section **"📷 Images du produit (max 5)"**, cliquez sur la zone d'upload
4. Sélectionnez une ou plusieurs images (max 5, max 10MB chacune)
5. Les aperçus s'affichent instantanément
6. Vous pouvez supprimer une image en cliquant sur le ✕ rouge
7. Cliquez sur "Enregistrer" pour créer le produit avec ses images

**Note:** Les images sont uploadées en même temps que la création du produit pour une meilleure expérience utilisateur.

---

### 2. **Affichage des Images dans la Liste**

Les images des produits sont maintenant visibles directement dans la liste des produits.

- **Miniature** : La première image du produit s'affiche à gauche du nom
- **Icône** : Si aucune image n'existe, une icône 📷 s'affiche
- **Hover** : La miniature est cliquable et s'affiche en 50x50px

---

### 3. **Modification des Images d'un Produit Existant**

Pour modifier les images d'un produit déjà créé :

1. Dans la liste des produits, cliquez sur le bouton **✏️** (bleu) "Modifier"
2. Le formulaire s'ouvre avec les données actuelles ET les images
3. Vous pouvez :
   - **Supprimer des images** : Cliquez sur le ✕ rouge sur les images existantes
   - **Ajouter des images** : Utilisez la zone d'upload (jusqu'à 5 images total)
   - Les modifications sont appliquées lors de la sauvegarde
4. Cliquez sur "Enregistrer" pour appliquer les changements

**Note:** Les suppressions et ajouts d'images sont effectués en une seule opération lors de la sauvegarde du formulaire.

---

### 4. **Workflow de Mise à Jour Complet**

Pour modifier un produit existant :

1. Cliquez sur le bouton **✏️** (bleu) "Modifier"
2. Le formulaire s'ouvre avec :
   - Toutes les données du produit (nom, prix, TVA, etc.)
   - Les images actuelles avec bouton de suppression
   - Zone d'upload pour ajouter de nouvelles images
3. Vous pouvez dans la même action :
   - Modifier les données
   - Supprimer des images existantes
   - Ajouter de nouvelles images (limite totale: 5)
4. Cliquez sur "Enregistrer" pour appliquer TOUS les changements

**Note:** Toutes les modifications (données + images) sont appliquées en une seule soumission de formulaire.

---

## 🔧 Architecture Technique

### DTOs Utilisés

```typescript
// Création de produit avec images
interface ProductCreateDTO {
  name: string;
  description?: string;
  price: number;
  vatRate: number;
  categoryId: number;
  isActive?: boolean;
}

// Images sont envoyées séparément via FormData
```

### Routes API

- **POST `/api/admin/products/with-images`** : Créer produit + images (max 5)
- **PUT `/api/admin/products/:id`** : Mettre à jour les données du produit
- **POST `/api/admin/products/:id/images`** : Ajouter images à un produit (max 5 total)
- **DELETE `/api/admin/products/:id/images/:imageId`** : Supprimer une image
- **GET `/api/admin/products/:id/images`** : Lister les images d'un produit
- **GET `/uploads/*`** : Servir les images statiques (via API Gateway)

### Flux de Données

```
CRÉATION:
  Backoffice Form → FormData(product + images[])
    → API Gateway (multipart + proxy)
    → Product Service (multer + DB)
    → Images sauvegardées + métadonnées en DB

AFFICHAGE:
  Backoffice List → GET /api/admin/products
    → API Gateway → Product Service
    → Produits avec images[] incluses
    → Images affichées via GET /uploads/* (API Gateway proxy)

MODIFICATION:
  Backoffice Form → Ordre d'opérations:
    1. DELETE /products/:id/images/:imageId (pour chaque image à supprimer)
    2. PUT /products/:id (mise à jour données produit)
    3. POST /products/:id/images (ajout nouvelles images)

  Toutes les requêtes passent par API Gateway → Product Service
```

---

## 📝 Limites et Contraintes

✅ **Maximum 5 images par produit**
✅ **Taille max 10MB par image**
✅ **Formats acceptés:** PNG, JPG, GIF
✅ **Images sauvegardées dans:** `services/product-service/uploads/products/`
✅ **Ordre des images:** Géré via orderIndex (0-4)

---

## 🎯 Exemple d'Utilisation

### Création d'un produit avec 3 images

```javascript
// Dans ProductForm.tsx
const formData = new FormData();
formData.append(
  "product",
  JSON.stringify({
    name: "Laptop Pro",
    price: 1299.99,
    vatRate: 21,
    categoryId: 1,
    isActive: true,
  })
);

formData.append("images", file1);
formData.append("images", file2);
formData.append("images", file3);

// Envoi via handleCreateProduct
```

### Résultat

Les images sont automatiquement :

- ✅ Uploadées sur le serveur
- ✅ Enregistrées en base de données
- ✅ Associées au produit
- ✅ Affichées dans la liste
- ✅ Numérotées dans l'ordre (orderIndex)

---

## 🚀 Tests Effectués

| Test                   | Statut |
| ---------------------- | ------ |
| Login                  | ✅     |
| Création avec 5 images | ✅     |
| Création avec 3 images | ✅     |
| Création sans images   | ✅     |
| Liste des produits     | ✅     |
| Mise à jour produit    | ✅     |

**Résultat:** 6/6 tests réussis ✅

---

## 📚 Composants Modifiés

1. **`ProductForm.tsx`**

   - Ajout champ upload multiple (max 5)
   - Aperçu en temps réel des images sélectionnées
   - Validation taille et format
   - Mode création seulement (édition via Image Manager)

2. **`ProductList.tsx`**

   - Utilisation route `/with-images` pour création
   - Gestion FormData avec images
   - Handlers mis à jour

3. **`ProductTable.tsx`**

   - Affichage miniature première image
   - Support icône si pas d'image

4. **`ProductImageManager.tsx`**
   - Déjà existant pour gérer images après création
   - Upload, delete, reorder fonctionnel

---

## ✅ Validation

L'implémentation respecte:

- ✅ Architecture existante du backoffice
- ✅ Utilisation des DTOs de shared-types
- ✅ Séparation des responsabilités
- ✅ UX cohérente avec le design actuel
- ✅ Gestion d'erreurs complète
- ✅ Performance optimisée (preview côté client)

---

**Date de création:** 9 octobre 2025  
**Version:** 1.0  
**Auteur:** Système de gestion e-commerce
