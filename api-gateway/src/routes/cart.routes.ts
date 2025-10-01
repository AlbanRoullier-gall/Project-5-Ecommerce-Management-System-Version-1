/**
 * Routes de gestion du panier
 * Proxy vers le service cart-service
 */

import { Router, Request, Response } from "express";
import { serviceClient } from "../clients/ServiceClient";

const router = Router();

// ===== ROUTES PANIER =====

// Récupérer le panier de l'utilisateur
router.get("/", (req: Request, res: Response) => {
  serviceClient.proxy("cart", req, res, "/cart");
});

// Ajouter un article au panier
router.post("/items", (req: Request, res: Response) => {
  serviceClient.proxy("cart", req, res, "/cart/items");
});

// Mettre à jour la quantité d'un article (utilise productId comme le service)
router.put("/items/:productId", (req: Request, res: Response) => {
  serviceClient.proxy(
    "cart",
    req,
    res,
    `/cart/items/${req.params["productId"]}`
  );
});

// Vider le panier
router.delete("/", (req: Request, res: Response) => {
  serviceClient.proxy("cart", req, res, "/cart");
});

// Checkout - Créer une commande à partir du panier
router.post("/checkout", (req: Request, res: Response) => {
  serviceClient.proxy("cart", req, res, "/cart/checkout");
});

export default router;
