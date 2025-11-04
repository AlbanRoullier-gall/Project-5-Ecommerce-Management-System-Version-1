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
    const imagePath = req.path;
    const imageUrl = `${SERVICES.product}${imagePath}`;

    const response = await axios.get(imageUrl, {
      responseType: "stream",
    });

    // Copier les headers de réponse
    res.set("Content-Type", response.headers["content-type"]);
    res.set("Cache-Control", "public, max-age=31536000");
    res.set("Cross-Origin-Resource-Policy", "cross-origin");

    // Stream l'image
    response.data.pipe(res);
  } catch (error) {
    console.error("Erreur chargement image:", error);
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
