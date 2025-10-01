/**
 * Routes de gestion des produits et catégories
 * Proxy vers le service product-service
 */

import { Router, Request, Response } from "express";
import { serviceClient } from "../clients/ServiceClient";
import { servicesConfig } from "../config/services.config";

const router = Router();

// ===== ROUTES D'IMAGES =====

// Servir les images de produits (redirection)
router.get("/images/:filename", (req: Request, res: Response) => {
  const imageUrl = `${servicesConfig.product.url}/uploads/products/${req.params["filename"]}`;
  res.redirect(imageUrl);
});

// ===== ROUTES PUBLIQUES =====

// Liste des produits (public)
router.get("/", (req: Request, res: Response) => {
  serviceClient.proxy("product", req, res, "/products");
});

// Détail d'un produit (public)
router.get("/:id", (req: Request, res: Response) => {
  serviceClient.proxy("product", req, res, `/products/${req.params["id"]}`);
});

// ===== ROUTES ADMIN PRODUITS =====

// Liste des produits (admin)
router.get("/admin/products", (req: Request, res: Response) => {
  serviceClient.proxy("product", req, res, "/admin/products");
});

// Détail d'un produit (admin)
router.get("/admin/products/:id", (req: Request, res: Response) => {
  serviceClient.proxy(
    "product",
    req,
    res,
    `/admin/products/${req.params["id"]}`
  );
});

// Création d'un produit
router.post("/admin/products", (req: Request, res: Response) => {
  serviceClient.proxy("product", req, res, "/admin/products");
});

// Mise à jour d'un produit
router.put("/admin/products/:id", (req: Request, res: Response) => {
  serviceClient.proxy(
    "product",
    req,
    res,
    `/admin/products/${req.params["id"]}`
  );
});

// Suppression d'un produit
router.delete("/admin/products/:id", (req: Request, res: Response) => {
  serviceClient.proxy(
    "product",
    req,
    res,
    `/admin/products/${req.params["id"]}`
  );
});

// Activation d'un produit
router.post("/admin/products/:id/activate", (req: Request, res: Response) => {
  serviceClient.proxy(
    "product",
    req,
    res,
    `/admin/products/${req.params["id"]}/activate`
  );
});

// Désactivation d'un produit
router.post("/admin/products/:id/deactivate", (req: Request, res: Response) => {
  serviceClient.proxy(
    "product",
    req,
    res,
    `/admin/products/${req.params["id"]}/deactivate`
  );
});

// ===== ROUTES CATÉGORIES =====

// Liste des catégories (public)
router.get("/categories", (req: Request, res: Response) => {
  serviceClient.proxy("product", req, res, "/categories");
});

// Liste des catégories (admin)
router.get("/admin/categories", (req: Request, res: Response) => {
  serviceClient.proxy("product", req, res, "/admin/categories");
});

// Création d'une catégorie
router.post("/admin/categories", (req: Request, res: Response) => {
  serviceClient.proxy("product", req, res, "/admin/categories");
});

// Mise à jour d'une catégorie
router.put("/admin/categories/:id", (req: Request, res: Response) => {
  serviceClient.proxy(
    "product",
    req,
    res,
    `/admin/categories/${req.params["id"]}`
  );
});

// Suppression d'une catégorie
router.delete("/admin/categories/:id", (req: Request, res: Response) => {
  serviceClient.proxy(
    "product",
    req,
    res,
    `/admin/categories/${req.params["id"]}`
  );
});

export default router;
