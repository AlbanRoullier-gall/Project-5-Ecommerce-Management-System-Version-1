/**
 * Module de proxy pour l'API Gateway
 */

import { Request, Response } from "express";
import axios from "axios";
import { SERVICES, ServiceName } from "./config";
import {
  isProtectedRoute,
  verifyToken,
  extractToken,
  AuthenticatedUser,
} from "./auth";

/**
 * Gère le proxy des requêtes vers les services
 */
export const handleProxyRequest = async (
  req: Request,
  res: Response,
  route: string,
  service: ServiceName
): Promise<void> => {
  console.log(`🚀 Route appelée: ${req.path} -> Service: ${service}`);

  try {
    // Vérification de l'authentification pour les routes admin
    if (isProtectedRoute(route)) {
      const token = extractToken(req.headers["authorization"]);

      if (!token) {
        console.log("❌ Token manquant pour route admin");
        res.status(401).json({
          error: "Token d'accès requis",
          message:
            "Vous devez fournir un token d'authentification pour accéder aux routes admin",
          code: "MISSING_TOKEN",
        });
        return;
      }

      const user = verifyToken(token);
      if (!user) {
        console.log("❌ Token invalide pour route admin");
        res.status(401).json({
          error: "Token invalide",
          message: "Le token d'authentification est invalide ou expiré",
          code: "INVALID_TOKEN",
        });
        return;
      }

      console.log(`🔐 Admin authentifié: ${user.email} (${user.userId})`);
      (req as any).user = user;
    }

    // Préparation de la requête vers le service
    const serviceUrl = SERVICES[service];
    const targetUrl = `${serviceUrl}${req.path}`;

    console.log(`📤 Envoi vers: ${targetUrl}`);

    // Headers à transmettre
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Ajouter l'utilisateur authentifié dans les headers si disponible
    if ((req as any).user) {
      const user = (req as any).user as AuthenticatedUser;
      headers["x-user-id"] = String(user.userId);
      headers["x-user-email"] = user.email;
    }

    // Supprimer le header host pour éviter les conflits
    delete headers["host"];

    // Faire la requête vers le service
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers,
      data: req.body,
      params: req.query,
      timeout: 30000,
    });

    console.log(
      `✅ ${req.method} ${req.path} → ${service} (${response.status})`
    );
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.log(`❌ ${req.method} ${req.path} → ${service} (500)`);

    if (axios.isAxiosError(error)) {
      const axiosError = error as any;
      if (axiosError.response) {
        res.status(axiosError.response.status).json(axiosError.response.data);
      } else {
        res.status(500).json({
          error: "Service Error",
          message: "Erreur de communication avec le service",
          service: service,
        });
      }
    } else {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur interne du serveur",
      });
    }
  }
};
