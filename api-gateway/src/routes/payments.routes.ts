/**
 * Routes de gestion des paiements
 * Proxy vers le service payment-service
 */

import { Router, Request, Response } from "express";
import { serviceClient } from "../clients/ServiceClient";

const router = Router();

// ===== ROUTES PAIEMENT =====

// Récupérer un paiement spécifique
router.get("/:id", (req: Request, res: Response) => {
  serviceClient.proxy("payment", req, res, `/payment/${req.params["id"]}`);
});

// Statistiques de paiement
router.get("/stats", (req: Request, res: Response) => {
  serviceClient.proxy("payment", req, res, "/payment/stats");
});

export default router;
