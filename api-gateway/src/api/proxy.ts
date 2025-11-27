/**
 * Proxy pour les requêtes vers les services
 * Gère les requêtes HTTP, les fichiers multipart, et les réponses
 */

import { Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import { ServiceName, SERVICES } from "../config";
import { AuthenticatedUser } from "./middleware/auth";

/**
 * Construit les headers de base (ajoute x-user-id et x-user-email si authentifié)
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

// prepareMultipartData supprimée - plus utilisée car les uploads utilisent maintenant base64 via DTOs

/**
 * Construit la configuration de la requête proxy
 */
const buildProxyRequest = (
  req: Request,
  service: ServiceName
): { url: string; headers: Record<string, string>; data: any; params: any } => {
  const serviceUrl = SERVICES[service];
  const targetUrl = `${serviceUrl}${req.path}`;
  const baseHeaders = buildBaseHeaders(req);

  // Plus de gestion FormData - tout passe par JSON maintenant
  return {
    url: targetUrl,
    headers: { ...baseHeaders, "Content-Type": "application/json" },
    data: req.body,
    params: req.query,
  };
};

/**
 * Gère et envoie la réponse du service vers le client
 */
const handleProxyResponse = (
  res: Response,
  axiosResponse: AxiosResponse
): void => {
  const contentType = (axiosResponse.headers["content-type"] as string) || "";

  // Détecter le type de contenu
  const isJson = contentType.includes("application/json");

  if (isJson) {
    try {
      const text = Buffer.isBuffer(axiosResponse.data)
        ? axiosResponse.data.toString("utf8")
        : String(axiosResponse.data);
      const parsed = JSON.parse(text);
      res.status(axiosResponse.status).json(parsed);
    } catch {
      res
        .status(axiosResponse.status)
        .set("Content-Type", contentType || "application/json")
        .send(
          Buffer.isBuffer(axiosResponse.data)
            ? axiosResponse.data.toString("utf8")
            : axiosResponse.data
        );
    }
  } else {
    if (contentType) res.set("Content-Type", contentType);
    res.status(axiosResponse.status).send(axiosResponse.data);
  }
};

/**
 * Proxy principal pour les requêtes vers les services
 */
export const proxyRequest = async (
  req: Request,
  res: Response,
  service: ServiceName
): Promise<void> => {
  try {
    const requestConfig = buildProxyRequest(req, service);

    const response = await axios({
      method: req.method,
      url: requestConfig.url,
      headers: requestConfig.headers,
      data: requestConfig.data,
      params: requestConfig.params,
      timeout: 60000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      responseType: "arraybuffer",
    });

    handleProxyResponse(res, response);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as any;

      if (axiosError.code === "ECONNABORTED") {
        res.status(504).json({
          error: "Gateway Timeout",
          message: "La requête a pris trop de temps",
        });
        return;
      }

      if (axiosError.response) {
        const status = axiosError.response.status;
        const responseData = axiosError.response.data;

        // Parser la réponse d'erreur
        let errorData: any;
        if (
          Buffer.isBuffer(responseData) ||
          responseData instanceof ArrayBuffer
        ) {
          try {
            const buffer = Buffer.isBuffer(responseData)
              ? responseData
              : Buffer.from(responseData);
            errorData = JSON.parse(buffer.toString("utf8"));
          } catch {
            const errorBuffer = Buffer.isBuffer(responseData)
              ? responseData
              : Buffer.from(responseData);
            errorData = {
              error: "Service Error",
              message: errorBuffer.toString("utf8"),
              status: status,
            };
          }
        } else if (typeof responseData === "string") {
          try {
            errorData = JSON.parse(responseData);
          } catch {
            errorData = {
              error: "Service Error",
              message: responseData,
              status: status,
            };
          }
        } else {
          errorData = responseData;
        }

        res.status(status).json(errorData);
      } else {
        res.status(500).json({
          error: "Service Error",
          message: "Erreur de communication avec le service",
          service: service,
          details: axiosError.message,
        });
      }
    } else {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur interne du serveur",
        details: error?.message || String(error),
      });
    }
  }
};
