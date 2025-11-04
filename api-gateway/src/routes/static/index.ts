/**
 * Configuration des routes statiques
 */

import { StaticRoute } from "../../core/types";
import { Request, Response } from "express";
import axios from "axios";
import { SERVICES } from "../../config";

/**
 * Handler pour servir les images statiques via proxy
 */
const handleStaticImageProxy = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // req.path contient le chemin complet (ex: /uploads/products/image.jpg)
    // On doit le transmettre tel quel au service product
    const imagePath = req.path;
    const imageUrl = `${SERVICES.product}${imagePath}`;

    console.log(`🖼️  Image request: ${req.path} -> ${imageUrl}`);

    const response = await axios.get(imageUrl, {
      responseType: "stream",
      validateStatus: () => true, // Accepter tous les status pour gérer les erreurs
    });

    if (response.status !== 200) {
      console.error(`❌ Image not found: ${imageUrl} (${response.status})`);
      res.status(404).json({ error: "Image non trouvée" });
      return;
    }

    // Copier les headers de réponse
    if (response.headers["content-type"]) {
      res.set("Content-Type", response.headers["content-type"]);
    }
    res.set("Cache-Control", "public, max-age=31536000");
    res.set("Cross-Origin-Resource-Policy", "cross-origin");

    // Stream l'image
    response.data.pipe(res);
  } catch (error: any) {
    console.error("Erreur chargement image:", error.message || error);
    res.status(404).json({ error: "Image non trouvée" });
  }
};

/**
 * Configuration complète des routes statiques
 */
export const STATIC_ROUTES: StaticRoute[] = [
  {
    path: "/uploads/*",
    handler: handleStaticImageProxy,
  },
];
