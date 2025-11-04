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
  const hasFiles = !!(req as any).files;
  const hasFile = !!(req as any).file;
  console.log(
    `🚀 ${req.method} ${req.path} -> ${service}${
      hasFiles || hasFile ? " (multipart)" : ""
    }`
  );

  try {
    // Construire la configuration de la requête
    let requestConfig;
    try {
      requestConfig = buildProxyRequest(req, service);
      console.log(`📤 Proxy request config:`);
      console.log(`   URL: ${requestConfig.url}`);
      console.log(`   Method: ${req.method}`);
      console.log(
        `   Has FormData: ${
          requestConfig.data &&
          typeof requestConfig.data.getHeaders === "function"
        }`
      );
    } catch (configError: any) {
      console.error("❌ Error building proxy request:", configError);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur lors de la préparation de la requête",
        details: configError?.message || String(configError),
      });
      return;
    }

    // Exécuter la requête
    let response;
    try {
      response = await axios({
        method: req.method,
        url: requestConfig.url,
        headers: requestConfig.headers,
        data: requestConfig.data,
        params: requestConfig.params,
        timeout: 60000, // Augmenté à 60s pour les uploads
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        responseType: "arraybuffer", // Toujours arraybuffer pour gérer tous les types
      });
    } catch (axiosError: any) {
      // Si c'est une erreur de timeout ou de connexion, on la gère séparément
      if (axiosError.code === "ECONNABORTED") {
        console.error(`❌ Request timeout after 60s`);
        res.status(504).json({
          error: "Gateway Timeout",
          message: "La requête a pris trop de temps",
        });
        return;
      }
      // Re-throw pour que le catch principal le gère
      throw axiosError;
    }

    console.log(
      `✅ ${req.method} ${req.path} → ${service} (${response.status})`
    );

    // Gérer et envoyer la réponse
    handleProxyResponse(res, response);
  } catch (error: any) {
    console.log(`❌ ${req.method} ${req.path} → ${service} (error)`);

    if (axios.isAxiosError(error)) {
      const axiosError = error as any;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const responseData = axiosError.response.data;

        console.error(`   Service responded with ${status}`);
        console.error(`   Response headers:`, axiosError.response.headers);

        // Essayer de parser la réponse si c'est un arraybuffer ou Buffer
        let errorData: any;
        if (
          Buffer.isBuffer(responseData) ||
          responseData instanceof ArrayBuffer
        ) {
          try {
            const buffer = Buffer.isBuffer(responseData)
              ? responseData
              : Buffer.from(responseData);
            const text = buffer.toString("utf8");
            errorData = JSON.parse(text);
            console.error(`   Error message:`, errorData);
          } catch (parseError) {
            const text = Buffer.isBuffer(responseData)
              ? responseData.toString("utf8")
              : Buffer.from(responseData).toString("utf8");
            console.error(
              `   Error response (not JSON):`,
              text.substring(0, 200)
            );
            errorData = {
              error: "Service Error",
              message: text,
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
        console.error(`   Network error:`, axiosError.message);
        res.status(500).json({
          error: "Service Error",
          message: "Erreur de communication avec le service",
          service: service,
          details: axiosError.message,
        });
      }
    } else {
      console.error(`   Unexpected error:`, error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur interne du serveur",
        details: error?.message || String(error),
      });
    }
  }
};
