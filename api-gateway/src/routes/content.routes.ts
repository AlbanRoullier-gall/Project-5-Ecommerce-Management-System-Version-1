/**
 * Routes de gestion du contenu du site web
 * Proxy vers le service website-content-service
 */

import { Router, Request, Response } from "express";
import { serviceClient } from "../clients/ServiceClient";

const router = Router();

// ===== ROUTES PUBLIQUES =====

// Liste des pages publiques
router.get("/pages", (req: Request, res: Response) => {
  serviceClient.proxy("websiteContent", req, res, "/website-content/pages");
});

// Liste des slugs
router.get("/slugs", (req: Request, res: Response) => {
  serviceClient.proxy("websiteContent", req, res, "/website-content/slugs");
});

export default router;
