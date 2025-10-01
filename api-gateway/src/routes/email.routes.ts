/**
 * Routes de gestion des emails
 * Proxy vers le service email-service
 */

import { Router, Request, Response } from "express";
import { serviceClient } from "../clients/ServiceClient";

const router = Router();

// ===== ROUTES PUBLIQUES =====

// Formulaire de contact
router.post("/contact", (req: Request, res: Response) => {
  serviceClient.proxy("email", req, res, "/contact");
});

// ===== ROUTES ADMIN (Futures) =====

// Historique des emails envoyés
router.get("/admin/history", (req: Request, res: Response) => {
  serviceClient.proxy("email", req, res, "/admin/history");
});

// Statistiques d'envoi
router.get("/admin/stats", (req: Request, res: Response) => {
  serviceClient.proxy("email", req, res, "/admin/stats");
});

export default router;
