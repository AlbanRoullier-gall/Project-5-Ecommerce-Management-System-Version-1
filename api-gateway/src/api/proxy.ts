/**
 * Proxy pour les requêtes vers les services
 * Gère les requêtes HTTP et les réponses
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

/**
 * Construit les query params pour le cart-service
 * Ajoute le sessionId si présent dans la requête
 */
const buildCartQueryParams = (req: Request): Record<string, string> => {
  const params: Record<string, string> = { ...req.query } as Record<
    string,
    string
  >;

  // Si c'est une route cart et qu'on a un cartSessionId, l'ajouter
  if (req.path.startsWith("/api/cart") && (req as any).cartSessionId) {
    params["sessionId"] = (req as any).cartSessionId;
    console.log(
      `[Proxy] Cart request - sessionId ajouté aux query params: ${(
        req as any
      ).cartSessionId.substring(0, 20)}...`
    );
  } else if (req.path.startsWith("/api/cart")) {
    console.warn(
      `[Proxy] Cart request sans sessionId - path: ${req.path}, method: ${req.method}`
    );
    console.warn(
      `[Proxy] Cookies reçus:`,
      req.cookies ? Object.keys(req.cookies) : "aucun"
    );
  }

  return params;
};

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

  // Pour le cart-service, utiliser les query params avec sessionId
  const params = service === "cart" ? buildCartQueryParams(req) : req.query;

  // Pour le cart-service, injecter le sessionId dans le body UNIQUEMENT pour DELETE
  // Pour POST/PUT, le sessionId doit être uniquement dans les query params
  let bodyData = req.body;
  if (
    service === "cart" &&
    (req as any).cartSessionId &&
    req.method === "DELETE"
  ) {
    // Pour DELETE /api/cart, le cart-service attend sessionId dans le body
    if (bodyData && typeof bodyData === "object") {
      bodyData = {
        ...bodyData,
        sessionId: (req as any).cartSessionId,
      };
    } else if (!bodyData) {
      // Si pas de body, créer un objet avec le sessionId
      bodyData = {
        sessionId: (req as any).cartSessionId,
      };
    }
  }

  // Plus de gestion FormData - tout passe par JSON maintenant
  return {
    url: targetUrl,
    headers: { ...baseHeaders, "Content-Type": "application/json" },
    data: bodyData,
    params,
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

    // Log pour le debug (toujours en production pour diagnostiquer les problèmes Railway)
    if (
      process.env["NODE_ENV"] === "development" ||
      process.env["DEBUG"] ||
      process.env["NODE_ENV"] === "production"
    ) {
      console.log(
        `[Proxy] ${req.method} ${req.path} -> ${service}: ${requestConfig.url}`
      );
    }

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

    // S'assurer que le cookie de session est renvoyé dans la réponse
    // (même si la réponse vient du service backend)
    if (service === "cart" && (req as any).cartSessionId) {
      // Le cookie sera défini par le middleware cartSessionMiddleware
      // mais on s'assure qu'il est bien présent dans la réponse
      const cookieHeader = res.getHeader("Set-Cookie");
      if (
        !cookieHeader ||
        (Array.isArray(cookieHeader) && cookieHeader.length === 0)
      ) {
        console.warn(
          `[Proxy] Cookie de session non défini dans la réponse pour ${req.path}`
        );
      }
    }

    handleProxyResponse(res, response);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as any;

      // Log détaillé de l'erreur pour le diagnostic
      const requestConfig = buildProxyRequest(req, service);
      console.error(
        `[Proxy Error] ${req.method} ${req.path} -> ${service}: ${requestConfig.url}`
      );
      console.error(
        `[Proxy Error] Code: ${axiosError.code}, Message: ${axiosError.message}`
      );
      if (service === "cart") {
        console.error(
          `[Proxy Error] SessionId utilisé: ${
            (req as any).cartSessionId?.substring(0, 20) || "aucun"
          }...`
        );
      }

      if (axiosError.code === "ECONNREFUSED") {
        console.error(
          `[Proxy Error] Connexion refusée - Le service ${service} n'est probablement pas démarré ou n'écoute pas sur ${SERVICES[service]}`
        );
        res.status(503).json({
          error: "Service Unavailable",
          message: `Le service ${service} n'est pas disponible`,
          service: service,
          serviceUrl: SERVICES[service],
          code: axiosError.code,
        });
        return;
      }

      if (
        axiosError.code === "ETIMEDOUT" ||
        axiosError.code === "ECONNABORTED"
      ) {
        res.status(504).json({
          error: "Gateway Timeout",
          message: "La requête a pris trop de temps",
          service: service,
          serviceUrl: SERVICES[service],
        });
        return;
      }

      if (axiosError.code === "ENOTFOUND") {
        console.error(
          `[Proxy Error] Service non trouvé - ${SERVICES[service]} n'est pas résolu`
        );
        res.status(503).json({
          error: "Service Unavailable",
          message: `Le service ${service} n'est pas accessible`,
          service: service,
          serviceUrl: SERVICES[service],
          code: axiosError.code,
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
        // Erreur de connexion (pas de réponse du service)
        console.error(
          `[Proxy Error] Pas de réponse du service ${service} - ${
            axiosError.code || "UNKNOWN"
          }: ${axiosError.message}`
        );
        res.status(503).json({
          error: "Service Unavailable",
          message: `Erreur de communication avec le service ${service}`,
          service: service,
          serviceUrl: SERVICES[service],
          code: axiosError.code || "UNKNOWN",
          details: axiosError.message,
        });
      }
    } else {
      console.error(`[Proxy Error] Erreur non-Axios:`, error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur interne du serveur",
        details: error?.message || String(error),
      });
    }
  }
};
