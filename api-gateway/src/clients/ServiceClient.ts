/**
 * ServiceClient - Client HTTP générique pour communiquer avec les microservices
 *
 * Ce client centralise toute la logique de communication avec les services backend :
 * - Gestion des headers
 * - Timeouts configurables
 * - Logging des requêtes
 * - Gestion des erreurs
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { Request, Response } from "express";
import {
  servicesConfig,
  ServiceConfig,
  ServiceRegistry,
} from "../config/services.config";
import { logServiceError } from "../utils/logger";

/**
 * Noms des services disponibles
 */
export type ServiceName = keyof ServiceRegistry;

export class ServiceClient {
  private axiosInstances: Map<ServiceName, AxiosInstance> = new Map();

  constructor() {
    this.initializeClients();
  }

  /**
   * Initialise les clients Axios pour chaque service
   */
  private initializeClients(): void {
    Object.entries(servicesConfig).forEach(([serviceName, config]) => {
      const instance = axios.create({
        baseURL: config.url,
        timeout: config.timeout,
        headers: {
          "Content-Type": "application/json",
        },
      });

      this.axiosInstances.set(serviceName as ServiceName, instance);
    });
  }

  /**
   * Récupère la configuration d'un service
   */
  private getServiceConfig(serviceName: ServiceName): ServiceConfig {
    return servicesConfig[serviceName];
  }

  /**
   * Récupère l'instance Axios d'un service
   */
  private getAxiosInstance(serviceName: ServiceName): AxiosInstance {
    const instance = this.axiosInstances.get(serviceName);
    if (!instance) {
      throw new Error(`Service ${serviceName} not found in registry`);
    }
    return instance;
  }

  /**
   * Prépare les headers pour la requête
   */
  private prepareHeaders(req: Request): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Transmettre le token d'authentification si présent
    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization;
    }

    // Transmettre d'autres headers pertinents
    if (req.headers.accept) {
      headers["Accept"] = req.headers.accept as string;
    }

    return headers;
  }

  /**
   * Fait un proxy d'une requête vers un service
   *
   * @param serviceName - Nom du service cible
   * @param req - Requête Express
   * @param res - Réponse Express
   * @param path - Chemin de l'endpoint (sans /api)
   */
  async proxy(
    serviceName: ServiceName,
    req: Request,
    res: Response,
    path: string
  ): Promise<void> {
    const startTime = Date.now();
    const config = this.getServiceConfig(serviceName);
    const axiosInstance = this.getAxiosInstance(serviceName);

    try {
      const headers = this.prepareHeaders(req);

      // Configuration de la requête Axios
      const axiosConfig: AxiosRequestConfig = {
        method: req.method,
        url: `/api${path}`,
        headers,
      };

      // Ajouter le body pour les requêtes POST, PUT, PATCH
      if (["POST", "PUT", "PATCH"].includes(req.method)) {
        axiosConfig.data = req.body;
      }

      // Ajouter les query parameters
      if (Object.keys(req.query).length > 0) {
        axiosConfig.params = req.query;
      }

      // Effectuer la requête
      const response: AxiosResponse = await axiosInstance.request(axiosConfig);

      // Calculer la durée
      const duration = Date.now() - startTime;

      // Logger la requête réussie (optionnel en dev, utile en prod)
      if (process.env["NODE_ENV"] === "development") {
        console.log(
          `✅ ${req.method} ${path} → ${config.name} (${response.status}) - ${duration}ms`
        );
      }

      // Retourner la réponse
      res.status(response.status).json(response.data);
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Logger l'erreur
      logServiceError(config.name, path, error);

      // Gestion des erreurs
      this.handleServiceError(error, serviceName, req, res, duration);
    }
  }

  /**
   * Gère les erreurs de communication avec les services
   */
  private handleServiceError(
    error: any,
    serviceName: ServiceName,
    req: Request,
    res: Response,
    duration: number
  ): void {
    const config = this.getServiceConfig(serviceName);

    // Si le service a retourné une erreur HTTP (4xx, 5xx)
    if (error.response) {
      const { status, data } = error.response;

      console.error(
        `❌ ${req.method} ${req.path} → ${config.name} (${status}) - ${duration}ms`
      );

      // Retransmettre l'erreur du service telle quelle
      res.status(status).json(data);
      return;
    }

    // Erreur de timeout
    if (error.code === "ECONNABORTED") {
      console.error(
        `⏱️  ${req.method} ${req.path} → ${config.name} TIMEOUT - ${duration}ms`
      );

      res.status(504).json({
        error: "Gateway Timeout",
        message: `${config.name} did not respond in time`,
        timestamp: new Date().toISOString(),
        statusCode: 504,
      });
      return;
    }

    // Erreur de connexion (service down)
    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND" ||
      error.code === "ENETUNREACH"
    ) {
      console.error(
        `🔌 ${req.method} ${req.path} → ${config.name} UNREACHABLE - ${duration}ms`
      );

      res.status(503).json({
        error: "Service Unavailable",
        message: `${config.name} is currently unavailable`,
        timestamp: new Date().toISOString(),
        statusCode: 503,
      });
      return;
    }

    // Erreur inconnue
    console.error(
      `💥 ${req.method} ${req.path} → ${config.name} ERROR - ${duration}ms`,
      error.message
    );

    res.status(500).json({
      error: "Internal Server Error",
      message:
        "An unexpected error occurred while communicating with the service",
      timestamp: new Date().toISOString(),
      statusCode: 500,
    });
  }

  /**
   * Effectue un health check sur un service spécifique
   */
  async healthCheck(serviceName: ServiceName): Promise<boolean> {
    try {
      const config = this.getServiceConfig(serviceName);
      const axiosInstance = this.getAxiosInstance(serviceName);

      if (!config.healthEndpoint) {
        return false;
      }

      const response = await axiosInstance.get(config.healthEndpoint, {
        timeout: 5000, // Health check plus court
      });

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Effectue un health check sur tous les services
   */
  async healthCheckAll(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    const promises = Object.keys(servicesConfig).map(async (serviceName) => {
      const isHealthy = await this.healthCheck(serviceName as ServiceName);
      results[serviceName] = isHealthy;
    });

    await Promise.all(promises);
    return results;
  }
}

// Export d'une instance singleton
export const serviceClient = new ServiceClient();
