/**
 * Routes d'authentification
 * Proxy vers le service auth-service
 */

import { Router, Request, Response } from "express";
import { serviceClient } from "../clients/ServiceClient";

const router = Router();

// ===== ROUTES PUBLIQUES =====

// Inscription
router.post("/register", (req: Request, res: Response) => {
  serviceClient.proxy("auth", req, res, "/auth/register");
});

// Connexion
router.post("/login", (req: Request, res: Response) => {
  serviceClient.proxy("auth", req, res, "/auth/login");
});

// ===== ROUTES PROTÉGÉES =====

// Récupération du profil
router.get("/profile", (req: Request, res: Response) => {
  serviceClient.proxy("auth", req, res, "/auth/profile");
});

// Mise à jour du profil
router.put("/profile", (req: Request, res: Response) => {
  serviceClient.proxy("auth", req, res, "/auth/profile");
});

// Changement de mot de passe (PUT car c'est une modification)
router.put("/change-password", (req: Request, res: Response) => {
  serviceClient.proxy("auth", req, res, "/auth/change-password");
});

// Déconnexion
router.post("/logout", (req: Request, res: Response) => {
  serviceClient.proxy("auth", req, res, "/auth/logout");
});

export default router;
