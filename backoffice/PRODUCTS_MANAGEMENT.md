# 📦 Gestion des Produits - Back Office

## 🎯 Vue d'ensemble

Cette page de gestion des produits permet aux administrateurs de gérer le catalogue de produits de Nature de Pierre via une interface web moderne et intuitive.

## 🏗️ Architecture

### **Composants Principaux**

- **`ProductList`** : Composant principal affichant la liste des produits avec filtres et actions
- **`ProductModal`** : Modal pour créer et modifier des produits
- **`ProductFilters`** : Composant de filtrage et tri des produits
- **`useProducts`** : Hook personnalisé pour la gestion de l'état des produits

### **Services**

- **`productService`** : Service pour communiquer avec l'API Gateway
- Communication via l'API Gateway vers le Product Service
- Utilisation des types partagés pour la cohérence

## 🚀 Fonctionnalités

### **Gestion des Produits**
- ✅ **Liste des produits** avec pagination
- ✅ **Filtrage** par nom, catégorie, statut
- ✅ **Tri** par nom, prix, date de création/modification
- ✅ **Création** de nouveaux produits
- ✅ **Modification** des produits existants
- ✅ **Suppression** des produits
- ✅ **Activation/Désactivation** des produits

### **Interface Utilisateur**
- ✅ **Design responsive** adapté mobile/desktop
- ✅ **Modal de création/édition** avec validation
- ✅ **Calcul automatique** du prix TTC
- ✅ **Gestion des erreurs** avec messages explicites
- ✅ **États de chargement** pour une meilleure UX

## 📁 Structure des Fichiers

```
backoffice/
├── components/
│   ├── ProductList.tsx          # Liste principale des produits
│   ├── ProductModal.tsx         # Modal création/édition
│   ├── ProductFilters.tsx       # Composant de filtrage
│   ├── Header.tsx              # En-tête existant
│   └── Footer.tsx              # Pied de page existant
├── lib/
│   ├── services/
│   │   └── productService.ts    # Service API Gateway
│   └── hooks/
│       └── useProducts.ts       # Hook de gestion d'état
├── pages/
│   └── products/
│       └── index.tsx           # Page principale
├── shared-types/
│   └── index.ts                # Types partagés
└── styles/
    └── globals.css             # Styles CSS
```

## 🔧 Configuration

### **Variables d'Environnement**

Créez un fichier `.env.local` dans le dossier `backoffice/` :

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

La page sera accessible à : `http://localhost:13009/products`

## 📊 Types de Données

### **Product**
```typescript
interface Product {
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
  images?: ProductImage[];
}
```

### **Category**
```typescript
interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 🎨 Styles CSS

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

## 🔗 Intégration API

### **Endpoints Utilisés**
- `GET /products` - Liste des produits
- `GET /products/:id` - Détail d'un produit
- `POST /products` - Création d'un produit
- `PUT /products/:id` - Modification d'un produit
- `DELETE /products/:id` - Suppression d'un produit
- `PATCH /products/:id/toggle-status` - Changement de statut
- `GET /categories` - Liste des catégories

### **Communication**
- **API Gateway** : Point d'entrée unique (`localhost:13000`)
- **Product Service** : Service métier (`localhost:13002`)
- **Types partagés** : Cohérence des données

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
