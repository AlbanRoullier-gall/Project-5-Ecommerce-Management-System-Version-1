# Composants de Gestion des Produits

Ce dossier contient tous les composants pour la gestion complète des produits dans le backoffice.

## Structure des composants

### ProductList.tsx

**Composant principal** qui orchestre toute la logique de gestion des produits.

**Fonctionnalités :**

- Chargement et affichage des produits
- Filtrage et recherche
- Gestion de l'état global (produits, catégories)
- Communication avec l'API
- Gestion des modales et formulaires

**API utilisées :**

- `GET /admin/products` - Liste des produits
- `POST /admin/products` - Création d'un produit
- `PUT /admin/products/:id` - Mise à jour d'un produit
- `DELETE /admin/products/:id` - Suppression d'un produit
- `POST /admin/products/:id/activate` - Activer un produit
- `POST /admin/products/:id/deactivate` - Désactiver un produit
- `GET /admin/categories` - Liste des catégories
- `POST /admin/categories` - Création d'une catégorie
- `PUT /admin/categories/:id` - Mise à jour d'une catégorie
- `DELETE /admin/categories/:id` - Suppression d'une catégorie
- `POST /admin/products/:id/images` - Upload d'une image
- `DELETE /admin/products/:id/images/:imageId` - Suppression d'une image
- `PUT /admin/images/:imageId` - Mise à jour de l'ordre d'une image

---

### ProductTable.tsx

**Tableau d'affichage** des produits avec actions.

**Props :**

- `products` - Liste des produits à afficher
- `onEdit` - Callback pour éditer un produit
- `onDelete` - Callback pour supprimer un produit
- `onToggleStatus` - Callback pour activer/désactiver un produit
- `onManageImages` - Callback pour gérer les images

**Fonctionnalités :**

- Affichage en tableau responsive
- Image de prévisualisation
- Badge de statut cliquable
- Actions rapides (éditer, supprimer, gérer images)
- Formatage des prix et dates

---

### ProductForm.tsx

**Formulaire de création/édition** de produit.

**Props :**

- `product?` - Produit à éditer (null pour création)
- `categories` - Liste des catégories disponibles
- `onSubmit` - Callback de soumission
- `onCancel` - Callback d'annulation
- `isLoading?` - État de chargement

**Fonctionnalités :**

- Validation des champs
- Gestion des erreurs
- Mode création/édition
- Sélection de catégorie
- Toggle de statut actif/inactif

**Champs :**

- Nom (requis)
- Description (optionnel)
- Prix (requis, > 0)
- Taux TVA (requis, 0-100%)
- Catégorie (requis)
- Statut actif/inactif

---

### ProductFilters.tsx

**Composant de filtrage** pour la liste des produits.

**Props :**

- `searchTerm` - Terme de recherche
- `onSearchChange` - Callback de changement de recherche
- `selectedCategory` - Catégorie sélectionnée
- `onCategoryChange` - Callback de changement de catégorie
- `statusFilter` - Filtre de statut
- `onStatusFilterChange` - Callback de changement de statut
- `categories` - Liste des catégories

**Filtres disponibles :**

- Recherche par nom
- Filtrage par catégorie
- Filtrage par statut (actif/inactif)

---

### CategoryManagement.tsx

**Gestion complète des catégories** de produits.

**Props :**

- `categories` - Liste des catégories
- `onAddCategory` - Callback de création
- `onUpdateCategory` - Callback de mise à jour
- `onDeleteCategory` - Callback de suppression
- `isLoading?` - État de chargement

**Fonctionnalités :**

- Affichage en tableau
- Formulaire inline de création/édition
- Compteur de produits par catégorie
- Validation des champs
- Confirmation de suppression

---

### ProductImageManager.tsx

**Gestionnaire d'images** pour un produit.

**Props :**

- `product` - Produit dont on gère les images
- `onClose` - Callback de fermeture
- `onUploadImage` - Callback d'upload
- `onDeleteImage` - Callback de suppression
- `onUpdateImageOrder` - Callback de réorganisation
- `isLoading?` - État de chargement

**Fonctionnalités :**

- Upload d'images (drag & drop)
- Prévisualisation en grille
- Réorganisation par glisser-déposer
- Badge de numérotation
- Validation de fichier (type, taille max 5MB)
- Modal plein écran

---

## Utilisation

```tsx
import ProductList from "../components/product/ProductList";

// Dans votre page
<ProductList />;
```

Le composant `ProductList` est autonome et gère toute la logique.

## Variables d'environnement requises

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Types utilisés

Tous les types sont importés depuis `../../dto` qui réexporte les types de `@tfe/shared-types` :

- `ProductPublicDTO`
- `ProductCreateDTO`
- `ProductUpdateDTO`
- `CategoryPublicDTO`
- `CategoryCreateDTO`
- `CategoryUpdateDTO`
- `ProductImagePublicDTO`

## Authentification

Tous les appels API utilisent le token JWT stocké dans `localStorage.getItem('token')`.

## Styles

Les composants utilisent Tailwind CSS pour le styling. Classes principales :

- `bg-white` - Fond blanc
- `rounded-lg` - Bordures arrondies
- `shadow-sm` - Ombre légère
- `text-green-600` / `bg-green-600` - Couleur principale (vert)
- `hover:bg-*-700` - États hover
