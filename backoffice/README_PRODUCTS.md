# 📦 Page de Gestion des Produits - Back Office

## 🎯 Vue d'ensemble

Cette page permet aux administrateurs de gérer le catalogue de produits de Nature de Pierre via une interface web moderne et intuitive.

## 🚀 Accès

**URL :** `http://localhost:13009/products`

## 🏗️ Architecture

### **Composants Créés**

- **`ProductList.tsx`** : Composant principal affichant la liste des produits
- **`ProductModal.tsx`** : Modal pour créer et modifier des produits
- **`ProductFilters.tsx`** : Composant de filtrage et tri
- **`useProducts.ts`** : Hook personnalisé pour la gestion d'état
- **`productService.ts`** : Service pour communiquer avec l'API Gateway

### **Communication API**

- **API Gateway** : `http://localhost:13000`
- **Product Service** : `http://localhost:13002`
- **Types partagés** : Cohérence des données

## 🎨 Fonctionnalités

### **Gestion des Produits**

- ✅ **Liste paginée** des produits
- ✅ **Filtrage** par nom, catégorie, statut
- ✅ **Tri** par nom, prix, date
- ✅ **Création** de nouveaux produits
- ✅ **Modification** des produits existants
- ✅ **Suppression** des produits
- ✅ **Activation/Désactivation** des produits

### **Interface Utilisateur**

- ✅ **Design responsive** (mobile/desktop)
- ✅ **Modal de création/édition** avec validation
- ✅ **Calcul automatique** du prix TTC
- ✅ **Gestion des erreurs** avec messages
- ✅ **États de chargement** pour une meilleure UX

## 📋 Utilisation

### **1. Lister les Produits**

- La page charge automatiquement tous les produits
- Utilisez les filtres pour affiner la recherche
- Naviguez avec la pagination

### **2. Créer un Produit**

1. Cliquez sur "**+ Nouveau Produit**"
2. Remplissez le formulaire :
   - **Nom** (obligatoire)
   - **Description** (optionnel)
   - **Prix HT** (obligatoire)
   - **Taux de TVA** (défaut : 20%)
   - **Catégorie** (obligatoire)
   - **Statut actif**
3. Cliquez sur "**Créer**"

### **3. Modifier un Produit**

1. Cliquez sur l'icône "**✏️**" dans la colonne Actions
2. Modifiez les informations souhaitées
3. Cliquez sur "**Mettre à jour**"

### **4. Gérer le Statut**

- **Activer** : Cliquez sur "**▶️**" (produit inactif)
- **Désactiver** : Cliquez sur "**⏸️**" (produit actif)

### **5. Supprimer un Produit**

1. Cliquez sur l'icône "**🗑️**"
2. Confirmez la suppression

## 🔧 Configuration

### **Variables d'Environnement**

Créez un fichier `.env.local` :

```bash
# Configuration API Gateway
NEXT_PUBLIC_API_URL=http://localhost:13000

# Configuration pour le développement
NODE_ENV=development
```

### **Démarrage**

```bash
# Dans le dossier backoffice/
npm install
npm run dev
```

## 📊 Types de Données

### **Product**

```typescript
{
  id: number;
  name: string;
  description?: string;
  price: number;           // Prix HT
  vatRate: number;         // Taux de TVA (%)
  categoryId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
}
```

### **Category**

```typescript
{
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 🎨 Styles

Les styles sont intégrés dans `globals.css` avec :

- **Design responsive** avec media queries
- **Couleurs cohérentes** avec la charte Nature de Pierre
- **Composants modernes** (modal, boutons, formulaires)
- **États visuels** (hover, focus, disabled)

## 🔄 Flux de Données

1. **Chargement initial** : `useProducts` charge les produits et catégories
2. **Filtrage** : Les filtres sont appliqués via l'API Gateway
3. **Actions** : Création/modification/suppression via le service
4. **Mise à jour** : La liste est rafraîchie automatiquement

## 🛡️ Gestion des Erreurs

- **Validation côté client** des formulaires
- **Messages d'erreur** explicites pour l'utilisateur
- **Gestion des états** de chargement
- **Fallback** en cas d'erreur API

## 📱 Responsive Design

- **Desktop** : Tableau complet avec toutes les colonnes
- **Tablet** : Adaptation des colonnes et filtres
- **Mobile** : Interface simplifiée avec actions empilées

## 🔗 Endpoints API

- `GET /products` - Liste des produits
- `GET /products/:id` - Détail d'un produit
- `POST /products` - Création d'un produit
- `PUT /products/:id` - Modification d'un produit
- `DELETE /products/:id` - Suppression d'un produit
- `PATCH /products/:id/toggle-status` - Changement de statut
- `GET /categories` - Liste des catégories

## 🚀 Prochaines Améliorations

- [ ] **Gestion des images** de produits
- [ ] **Import/Export** CSV des produits
- [ ] **Historique** des modifications
- [ ] **Recherche avancée** avec plusieurs critères
- [ ] **Drag & Drop** pour réorganiser les produits
- [ ] **Bulk actions** (sélection multiple)

## 📝 Notes Techniques

- **Next.js** : Framework React utilisé
- **TypeScript** : Typage strict pour la robustesse
- **CSS Modules** : Styles encapsulés
- **Hooks personnalisés** : Logique métier réutilisable
- **API REST** : Communication standardisée

Cette implémentation respecte l'architecture microservices existante et utilise les types partagés pour assurer la cohérence entre les différents services.
