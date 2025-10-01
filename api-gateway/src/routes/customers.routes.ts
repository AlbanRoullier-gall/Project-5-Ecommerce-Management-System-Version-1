/**
 * Routes de gestion des clients
 * Proxy vers le service customer-service
 */

import { Router, Request, Response } from "express";
import { serviceClient } from "../clients/ServiceClient";

const router = Router();

// ===== ROUTES CLIENTS =====

// Liste de tous les clients
router.get("/", (req: Request, res: Response) => {
  serviceClient.proxy("customer", req, res, "/customers");
});

// Détail d'un client
router.get("/:id", (req: Request, res: Response) => {
  serviceClient.proxy("customer", req, res, `/customers/${req.params["id"]}`);
});

// Supprimer un client
router.delete("/:id", (req: Request, res: Response) => {
  serviceClient.proxy("customer", req, res, `/customers/${req.params["id"]}`);
});

export default router;
