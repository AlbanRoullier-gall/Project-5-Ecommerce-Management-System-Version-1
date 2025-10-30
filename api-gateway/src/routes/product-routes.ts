/**
 * Routes des produits
 */

import { ServiceName } from "../config";

export const PRODUCT_ROUTES: Record<string, ServiceName> = {
  // Routes publiques
  "/products": "product", // GET: Liste des produits
  "/products/:id": "product", // GET: Récupérer un produit spécifique
  "/categories": "product", // GET: Liste des catégories
  "/images/:imageId": "product", // GET: Récupérer une image spécifique

  // Routes admin
  "/admin/products": "product", // GET: Liste produits, POST: Créer produit
  "/admin/products/:id": "product", // GET: Récupérer produit, PUT: Modifier produit, DELETE: Supprimer produit
  "/admin/products/:id/activate": "product", // POST: Activer produit
  "/admin/products/:id/deactivate": "product", // POST: Désactiver produit
  "/admin/products/with-images": "product", // POST: Créer produit avec images
  "/admin/categories": "product", // GET: Liste catégories, POST: Créer catégorie
  "/admin/categories/:id": "product", // GET: Récupérer catégorie, PUT: Modifier catégorie, DELETE: Supprimer catégorie
  "/admin/products/:id/images": "product", // GET: Lister images, POST: Ajouter images à un produit
  "/admin/products/:id/images/:imageId": "product", // DELETE: Supprimer une image
};
