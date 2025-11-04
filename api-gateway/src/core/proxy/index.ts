/**
 * Proxy principal pour les requêtes vers les services
 * Orchestre la construction de la requête et la gestion de la réponse
 */

import { Request, Response } from "express";
import axios from "axios";
import { ServiceName } from "../../config";
import { buildProxyRequest } from "./request";
import { handleProxyResponse } from "./response";

/**
 * Proxy inline pour les requêtes vers les services
 */
export const proxyRequest = async (
  req: Request,
  res: Response,
  service: ServiceName
): Promise<void> => {
  console.log(`🚀 ${req.method} ${req.path} -> ${service}`);

  try {
    // Construire la configuration de la requête
    const requestConfig = buildProxyRequest(req, service);

    // Exécuter la requête
    const response = await axios({
      method: req.method,
      url: requestConfig.url,
      headers: requestConfig.headers,
      data: requestConfig.data,
      params: requestConfig.params,
      timeout: 30000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      responseType: "arraybuffer", // Toujours arraybuffer pour gérer tous les types
    });

    console.log(
      `✅ ${req.method} ${req.path} → ${service} (${response.status})`
    );

    // Gérer et envoyer la réponse
    handleProxyResponse(res, response);
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
