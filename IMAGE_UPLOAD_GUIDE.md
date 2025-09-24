# Guide d'Upload d'Images pour les Produits

## Vue d'ensemble

La fonctionnalité d'upload d'images permet d'ajouter jusqu'à 3 images lors de la création d'un nouveau produit dans le backoffice.

## Architecture

### Backend (Product Service)

- **Route**: `POST /api/admin/products/with-images`
- **Authentification**: Token JWT admin requis
- **Validation**: Joi schema pour les données produit
- **Traitement d'images**: Sharp pour redimensionnement et compression
- **Stockage**: Fichiers sur disque + métadonnées en base de données

### API Gateway

- **Route**: `POST /api/admin/products/with-images`
- **Proxy**: Transmission des fichiers multipart/form-data
- **Middleware**: Multer pour gestion des uploads
- **Authentification**: Transmission du token JWT

### Frontend (Backoffice)

- **Composant**: `ImageUpload.tsx`
- **Service**: `productService.createProductWithImages()`
- **Interface**: Drag & drop + sélection de fichiers
- **Validation**: Types de fichiers, taille, limite de 3 images

## Utilisation

### 1. Créer un produit avec images

1. Se connecter au backoffice avec un compte admin
2. Aller dans "Produits" > "Nouveau produit"
3. Remplir les informations du produit (nom, prix, catégorie, etc.)
4. Dans la section "Images du produit":
   - Cliquer sur la zone de drop ou utiliser le bouton de sélection
   - Glisser-déposer jusqu'à 3 images
   - Prévisualiser les images sélectionnées
   - Supprimer des images si nécessaire
5. Cliquer sur "Créer"

### 2. Formats supportés

- **Types**: JPG, PNG, GIF, WebP
- **Taille max**: 10MB par image
- **Limite**: 3 images maximum par produit
- **Traitement**: Redimensionnement automatique à 800x600px max

### 3. API Endpoints

#### Créer un produit avec images

```bash
POST /api/admin/products/with-images
Authorization: Bearer <token>
Content-Type: multipart/form-data

Fields:
- name: string (requis)
- description: string (optionnel)
- price: number (requis)
- vatRate: number (requis)
- categoryId: number (requis)
- isActive: boolean (optionnel, défaut: true)
- images: File[] (optionnel, max 3)
```

#### Ajouter une image à un produit existant

```bash
POST /api/admin/products/{id}/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

Fields:
- image: File (requis)
- altText: string (optionnel)
- description: string (optionnel)
- orderIndex: number (optionnel)
```

## Base de données

### Table `product_images`

```sql
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Types TypeScript

### CreateProductWithImagesRequest

```typescript
interface CreateProductWithImagesRequest {
  name: string;
  description?: string;
  price: number;
  vatRate: number;
  categoryId: number;
  isActive?: boolean;
  images?: File[];
}
```

### CreateProductWithImagesResponse

```typescript
interface CreateProductWithImagesResponse {
  message: string;
  product: Product;
  images: ImageUploadResponse[];
}
```

## Sécurité

- **Authentification**: Token JWT admin requis
- **Validation**: Types de fichiers vérifiés côté serveur
- **Limite de taille**: 10MB par fichier
- **Limite de quantité**: Maximum 3 images par produit
- **Stockage sécurisé**: Fichiers dans un répertoire dédié

## Tests

Utiliser le script de test:

```bash
./scripts/test-image-upload.sh
```

Le script teste:

1. Connexion à l'API Gateway
2. Authentification admin
3. Création d'un produit avec image

## Dépannage

### Erreurs communes

1. **"Authentication token not found"**

   - Vérifier que l'utilisateur est connecté
   - Vérifier que le token n'a pas expiré

2. **"Only image files are allowed"**

   - Vérifier le type MIME du fichier
   - Utiliser des formats supportés (JPG, PNG, GIF, WebP)

3. **"File too large"**

   - Réduire la taille du fichier (< 10MB)
   - Compresser l'image avant upload

4. **"Maximum 3 images allowed"**
   - Supprimer des images existantes avant d'en ajouter de nouvelles

### Logs

Les logs sont disponibles dans:

- **API Gateway**: Console du service
- **Product Service**: Console du service + logs de base de données

## Évolutions futures

- Support de plus de formats d'image
- Compression automatique plus avancée
- Génération de miniatures
- Upload par lot
- Intégration avec un CDN
- Gestion des images existantes dans l'édition de produits
