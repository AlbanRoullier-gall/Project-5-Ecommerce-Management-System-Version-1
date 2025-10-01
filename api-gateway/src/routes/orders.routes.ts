/**
 * Routes de gestion des commandes
 * Proxy vers le service order-service
 */

import { Router, Request, Response } from "express";
import { serviceClient } from "../clients/ServiceClient";

const router = Router();

// ===== ROUTES COMMANDES =====

// Liste de toutes les commandes
router.get("/", (req: Request, res: Response) => {
  serviceClient.proxy("order", req, res, "/orders");
});

// Détail d'une commande
router.get("/:id", (req: Request, res: Response) => {
  serviceClient.proxy("order", req, res, `/orders/${req.params["id"]}`);
});

// Supprimer une commande
router.delete("/:id", (req: Request, res: Response) => {
  serviceClient.proxy("order", req, res, `/orders/${req.params["id"]}`);
});

// Liste des items d'une commande
router.get("/:orderId/items", (req: Request, res: Response) => {
  serviceClient.proxy(
    "order",
    req,
    res,
    `/orders/${req.params["orderId"]}/items`
  );
});

// Liste des adresses d'une commande
router.get("/:orderId/addresses", (req: Request, res: Response) => {
  serviceClient.proxy(
    "order",
    req,
    res,
    `/orders/${req.params["orderId"]}/addresses`
  );
});

// ===== ROUTES ORDER ITEMS =====

// Détail d'un item de commande
router.get("/items/:id", (req: Request, res: Response) => {
  serviceClient.proxy("order", req, res, `/order-items/${req.params["id"]}`);
});

// Supprimer un item de commande
router.delete("/items/:id", (req: Request, res: Response) => {
  serviceClient.proxy("order", req, res, `/order-items/${req.params["id"]}`);
});

// ===== ROUTES AVOIRS (CREDIT NOTES) =====

// Détail d'un avoir
router.get("/credit-notes/:id", (req: Request, res: Response) => {
  serviceClient.proxy("order", req, res, `/credit-notes/${req.params["id"]}`);
});

// Supprimer un avoir
router.delete("/credit-notes/:id", (req: Request, res: Response) => {
  serviceClient.proxy("order", req, res, `/credit-notes/${req.params["id"]}`);
});

// Détail d'un item d'avoir
router.get("/credit-note-items/:id", (req: Request, res: Response) => {
  serviceClient.proxy(
    "order",
    req,
    res,
    `/credit-note-items/${req.params["id"]}`
  );
});

// Supprimer un item d'avoir
router.delete("/credit-note-items/:id", (req: Request, res: Response) => {
  serviceClient.proxy(
    "order",
    req,
    res,
    `/credit-note-items/${req.params["id"]}`
  );
});

// ===== ROUTES ADRESSES =====

// Détail d'une adresse de commande
router.get("/addresses/:id", (req: Request, res: Response) => {
  serviceClient.proxy(
    "order",
    req,
    res,
    `/order-addresses/${req.params["id"]}`
  );
});

// Supprimer une adresse de commande
router.delete("/addresses/:id", (req: Request, res: Response) => {
  serviceClient.proxy(
    "order",
    req,
    res,
    `/order-addresses/${req.params["id"]}`
  );
});

// ===== STATISTIQUES =====

// Statistiques des commandes
router.get("/statistics", (req: Request, res: Response) => {
  serviceClient.proxy("order", req, res, "/statistics/orders");
});

export default router;
