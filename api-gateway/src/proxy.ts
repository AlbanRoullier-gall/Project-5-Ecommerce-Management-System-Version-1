/**
 * Module de proxy pour l'API Gateway
 */

import { Request, Response } from "express";
import axios from "axios";
import FormData from "form-data";
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

    // Redirection spéciale pour /customers GET vers /admin/customers
    let targetPath = req.path;
    if (req.path === "/api/customers" && req.method === "GET") {
      targetPath = "/api/admin/customers";
    }

    const targetUrl = `${serviceUrl}${targetPath}`;

    console.log(`📤 Envoi vers: ${targetUrl}`);

    // Headers de base
    const headers: Record<string, string> = {};

    // Ajouter l'utilisateur authentifié dans les headers si disponible
    if ((req as any).user) {
      const user = (req as any).user as AuthenticatedUser;
      headers["x-user-id"] = String(user.userId);
      headers["x-user-email"] = user.email;
    }

    // Vérifier si la requête contient des fichiers uploadés
    const hasFile = !!(req as any).file;
    const hasFiles = !!(req as any).files;

    let requestData: any;
    let requestHeaders = { ...headers };

    if (hasFile || hasFiles) {
      // Créer un FormData pour retransmettre les fichiers
      const formData = new FormData();

      // Ajouter le(s) fichier(s)
      if (hasFile) {
        const file = (req as any).file;
        formData.append("image", file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      }

      if (hasFiles) {
        const files = (req as any).files as Express.Multer.File[];
        files.forEach((file) => {
          formData.append("images", file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
          });
        });
      }

      // Ajouter les autres champs du body
      if (req.body) {
        Object.keys(req.body).forEach((key) => {
          const value = req.body[key];
          formData.append(
            key,
            typeof value === "object" ? JSON.stringify(value) : value
          );
        });
      }

      requestData = formData;
      requestHeaders = {
        ...requestHeaders,
        ...formData.getHeaders(), // Ajoute Content-Type: multipart/form-data avec boundary
      };
    } else {
      // Requête normale sans fichier
      requestData = req.body;
      requestHeaders["Content-Type"] = "application/json";
    }

    // Faire la requête vers le service
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: requestHeaders,
      data: requestData,
      params: req.query,
      timeout: 30000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
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
