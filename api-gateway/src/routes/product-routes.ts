/**
 * Routes des produits - Configuration avec conventions automatiques
 */

import { Route } from "../core/types";
import {
  createServiceRoutes,
  createAdminRoutes,
  createProxyRoute,
  createOrchestratedRoute,
} from "./helpers";
import { Request, Response } from "express";
import axios from "axios";
import { SERVICES } from "../config";

/**
 * Handler pour servir les images statiques via proxy
 * Convention: chemin /uploads/* est déjà complet (pas de préfixe /api)
 */
const handleStaticImageProxy = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const imagePath = req.path;
    const imageUrl = `${SERVICES.product}${imagePath}`;

    console.log(`🖼️  Image request: ${req.path} -> ${imageUrl}`);

    const response = await axios.get(imageUrl, {
      responseType: "stream",
      validateStatus: () => true,
    });

    if (response.status !== 200) {
      console.error(`❌ Image not found: ${imageUrl} (${response.status})`);
      res.status(404).json({ error: "Image non trouvée" });
      return;
    }

    if (response.headers["content-type"]) {
      res.set("Content-Type", response.headers["content-type"]);
    }
    res.set("Cache-Control", "public, max-age=31536000");
    res.set("Cross-Origin-Resource-Policy", "cross-origin");

    response.data.pipe(res);
  } catch (error: any) {
    console.error("Erreur chargement image:", error.message || error);
    res.status(404).json({ error: "Image non trouvée" });
  }
};

export const PRODUCT_ROUTES: Route[] = [
  // Routes publiques
  ...createServiceRoutes("product", [
    "/products",
    "/products/:id",
    "/categories",
    "/images/:imageId",
  ]),

  // Routes admin (auth automatique via convention /admin/*)
  ...createAdminRoutes("product", [
    "/admin/products",
    "/admin/products/:id",
    "/admin/categories",
    "/admin/categories/:id",
  ]),

  // Routes admin avec méthodes spécifiques
  createProxyRoute("/admin/products/:id/activate", "POST", "product"),
  createProxyRoute("/admin/products/:id/deactivate", "POST", "product"),
  // Upload automatique détecté via convention /with-images
  createProxyRoute("/admin/products/with-images", "POST", "product"),
  // Upload automatique détecté pour POST /admin/products/:id/images
  createProxyRoute("/admin/products/:id/images", "POST", "product"),
  createProxyRoute("/admin/products/:id/images", "GET", "product"),
  createProxyRoute("/admin/products/:id/images/:imageId", "DELETE", "product"),

  // Route statique pour les images uploadées
  createOrchestratedRoute("/uploads/*", "GET", handleStaticImageProxy),
];
