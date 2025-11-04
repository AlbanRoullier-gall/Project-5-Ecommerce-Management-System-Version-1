/**
 * Proxy générique pour les requêtes vers les microservices
 */

import { Request, Response } from "express";
import axios from "axios";
import FormData from "form-data";
import { SERVICES, ServiceName } from "../config";
import { AuthenticatedUser } from "../auth";

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
 * Gère le proxy des requêtes vers les services
 */
export const proxyRequest = async (
  req: Request,
  res: Response,
  service: ServiceName
): Promise<void> => {
  console.log(`🚀 Route appelée: ${req.path} -> Service: ${service}`);

  try {
    // 1. Préparer l'URL cible
    const serviceUrl = SERVICES[service];
    const targetUrl = `${serviceUrl}${req.path}`;

    console.log(`📤 Envoi vers: ${targetUrl}`);

    // 2. Préparer les headers et données
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

    // 3. Faire la requête vers le service
    const expectBinaryResponse =
      req.path.startsWith("/api/images/") || req.path.startsWith("/uploads/");

    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: requestHeaders,
      data: requestData,
      params: req.query,
      timeout: 30000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      responseType: expectBinaryResponse ? "arraybuffer" : "json",
    });

    // 4. Retourner la réponse
    console.log(
      `✅ ${req.method} ${req.path} → ${service} (${response.status})`
    );
    const contentType = (response.headers["content-type"] as string) || "";
    const isJson = contentType.includes("application/json");
    const isImage = contentType.startsWith("image/");
    const isBinary = !isJson && (expectBinaryResponse || isImage);

    if (isBinary) {
      // Propager quelques headers utiles
      if (contentType) {
        res.set("Content-Type", contentType);
      }
      const cacheControl = response.headers["cache-control"];
      if (cacheControl) {
        res.set("Cache-Control", cacheControl);
      }
      res.status(response.status).send(response.data);
    } else if (isJson) {
      // Lorsque responseType=arraybuffer mais le service renvoie du JSON (erreur), décoder le buffer
      const data = response.data as any;
      if (Buffer.isBuffer(data)) {
        try {
          const text = data.toString("utf8");
          const parsed = JSON.parse(text);
          res.status(response.status).json(parsed);
        } catch {
          res
            .status(response.status)
            .set("Content-Type", "application/json")
            .send(data.toString("utf8"));
        }
      } else {
        res.status(response.status).json(response.data);
      }
    } else {
      // Par défaut, relayer tel quel (texte ou autre)
      if (contentType) res.set("Content-Type", contentType);
      res.status(response.status).send(response.data);
    }
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
