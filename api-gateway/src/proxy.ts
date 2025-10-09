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

// ===== HELPERS PRIVÉS =====

/**
 * Vérifie l'authentification et ajoute l'utilisateur à la requête
 */
const handleAuthentication = (
  req: Request,
  res: Response,
  route: string
): boolean => {
  if (!isProtectedRoute(route)) return true;

  const token = extractToken(req.headers["authorization"]);

  if (!token) {
    console.log("❌ Token manquant pour route admin");
    res.status(401).json({
      error: "Token d'accès requis",
      message:
        "Vous devez fournir un token d'authentification pour accéder aux routes admin",
      code: "MISSING_TOKEN",
    });
    return false;
  }

  const user = verifyToken(token);
  if (!user) {
    console.log("❌ Token invalide pour route admin");
    res.status(401).json({
      error: "Token invalide",
      message: "Le token d'authentification est invalide ou expiré",
      code: "INVALID_TOKEN",
    });
    return false;
  }

  console.log(`🔐 Admin authentifié: ${user.email} (${user.userId})`);
  (req as any).user = user;
  return true;
};

/**
 * Construit les headers de base pour la requête proxy
 */
const buildBaseHeaders = (req: Request): Record<string, string> => {
  const headers: Record<string, string> = {};

  if ((req as any).user) {
    const user = (req as any).user as AuthenticatedUser;
    headers["x-user-id"] = String(user.userId);
    headers["x-user-email"] = user.email;
  }

  return headers;
};

/**
 * Prépare les données multipart/form-data pour le proxy
 */
const prepareMultipartData = (req: Request): FormData => {
  const formData = new FormData();

  // Ajouter les fichiers uploadés
  const hasFile = !!(req as any).file;
  const hasFiles = !!(req as any).files;

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

  // Ajouter les champs texte du body
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      const value = req.body[key];
      formData.append(
        key,
        typeof value === "object" ? JSON.stringify(value) : value
      );
    });
  }

  return formData;
};

/**
 * Détermine le chemin cible pour la requête
 */
const getTargetPath = (req: Request): string => {
  // Redirection spéciale pour /customers GET vers /admin/customers
  if (req.path === "/api/customers" && req.method === "GET") {
    return "/api/admin/customers";
  }
  return req.path;
};

// ===== FONCTION PRINCIPALE =====

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
    // 1. Vérifier l'authentification
    if (!handleAuthentication(req, res, route)) {
      return;
    }

    // 2. Préparer l'URL cible
    const serviceUrl = SERVICES[service];
    const targetPath = getTargetPath(req);
    const targetUrl = `${serviceUrl}${targetPath}`;

    console.log(`📤 Envoi vers: ${targetUrl}`);

    // 3. Préparer les headers et données
    const baseHeaders = buildBaseHeaders(req);
    const hasFile = !!(req as any).file;
    const hasFiles = !!(req as any).files;

    let requestData: any;
    let requestHeaders: Record<string, string>;

    if (hasFile || hasFiles) {
      // Requête avec fichiers (multipart/form-data)
      const formData = prepareMultipartData(req);
      requestData = formData;
      requestHeaders = {
        ...baseHeaders,
        ...formData.getHeaders(),
      };
    } else {
      // Requête normale (application/json)
      requestData = req.body;
      requestHeaders = {
        ...baseHeaders,
        "Content-Type": "application/json",
      };
    }

    // 4. Faire la requête vers le service
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

    // 5. Retourner la réponse
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
