/**
 * Construction des requêtes proxy vers les services
 */

import { Request } from "express";
import FormData from "form-data";
import { AuthenticatedUser } from "../../auth";
import { ServiceName, SERVICES } from "../../config";

/**
 * Construit les headers de base pour la requête proxy
 */
export const buildBaseHeaders = (req: Request): Record<string, string> => {
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
export const prepareMultipartData = (req: Request): FormData => {
  const formData = new FormData();
  const hasFile = !!(req as any).file;
  const hasFiles = !!(req as any).files;

  // Fichier unique
  if (hasFile) {
    const file = (req as any).file;
    formData.append("image", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
  }

  // Fichiers multiples
  if (hasFiles) {
    const files = (req as any).files as Express.Multer.File[];
    files.forEach((file) => {
      formData.append("images", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    });
  }

  // Données du body
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
 * Construit la configuration complète pour une requête proxy
 */
export const buildProxyRequest = (
  req: Request,
  service: ServiceName
): {
  url: string;
  headers: Record<string, string>;
  data: any;
  params: any;
} => {
  const serviceUrl = SERVICES[service];
  const targetUrl = `${serviceUrl}${req.path}`;

  const baseHeaders = buildBaseHeaders(req);
  const hasFile = !!(req as any).file;
  const hasFiles = !!(req as any).files;

  let requestData: any;
  let requestHeaders: Record<string, string>;

  if (hasFile || hasFiles) {
    const formData = prepareMultipartData(req);
    requestData = formData;
    requestHeaders = { ...baseHeaders, ...formData.getHeaders() };
  } else {
    requestData = req.body;
    requestHeaders = { ...baseHeaders, "Content-Type": "application/json" };
  }

  return {
    url: targetUrl,
    headers: requestHeaders,
    data: requestData,
    params: req.query,
  };
};
