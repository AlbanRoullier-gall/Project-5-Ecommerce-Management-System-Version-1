/**
 * Gestion des réponses proxy depuis les services
 */

import { Response } from "express";
import { AxiosResponse } from "axios";

/**
 * Détecte le type de contenu de la réponse
 */
const detectContentType = (contentType: string): "json" | "image" | "other" => {
  if (contentType.includes("application/json")) {
    return "json";
  }
  if (contentType.startsWith("image/")) {
    return "image";
  }
  return "other";
};

/**
 * Parse et envoie une réponse JSON
 */
const sendJsonResponse = (
  res: Response,
  status: number,
  data: any,
  contentType?: string
): void => {
  try {
    const text = Buffer.isBuffer(data) ? data.toString("utf8") : String(data);
    const parsed = JSON.parse(text);
    res.status(status).json(parsed);
  } catch {
    // Si le parsing JSON échoue, envoyer tel quel
    res
      .status(status)
      .set("Content-Type", contentType || "application/json")
      .send(Buffer.isBuffer(data) ? data.toString("utf8") : data);
  }
};

/**
 * Envoie une réponse binaire (image)
 */
const sendBinaryResponse = (
  res: Response,
  status: number,
  data: any,
  contentType: string,
  cacheControl?: string
): void => {
  if (contentType) res.set("Content-Type", contentType);
  if (cacheControl) res.set("Cache-Control", cacheControl);
  res.status(status).send(data);
};

/**
 * Envoie une réponse de type autre (texte, HTML, etc.)
 */
const sendOtherResponse = (
  res: Response,
  status: number,
  data: any,
  contentType?: string
): void => {
  if (contentType) res.set("Content-Type", contentType);
  res.status(status).send(data);
};

/**
 * Gère et envoie la réponse du service vers le client
 */
export const handleProxyResponse = (
  res: Response,
  axiosResponse: AxiosResponse
): void => {
  const contentType = (axiosResponse.headers["content-type"] as string) || "";
  const contentCategory = detectContentType(contentType);

  switch (contentCategory) {
    case "json":
      sendJsonResponse(
        res,
        axiosResponse.status,
        axiosResponse.data,
        contentType
      );
      break;

    case "image":
      sendBinaryResponse(
        res,
        axiosResponse.status,
        axiosResponse.data,
        contentType,
        axiosResponse.headers["cache-control"]
      );
      break;

    default:
      sendOtherResponse(
        res,
        axiosResponse.status,
        axiosResponse.data,
        contentType
      );
      break;
  }
};
