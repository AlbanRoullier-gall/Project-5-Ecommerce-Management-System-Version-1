/**
 * Client API centralisé
 * Gère tous les appels HTTP avec configuration centralisée
 * Adapté pour l'authentification avec cookies httpOnly
 */

/**
 * URL de l'API depuis les variables d'environnement
 * OBLIGATOIRE : La variable NEXT_PUBLIC_API_URL doit être définie dans .env.local ou .env.production
 */
const getApiUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL n'est pas définie. Veuillez configurer cette variable d'environnement."
    );
  }
  return url;
};

/**
 * Récupère l'URL de base pour les requêtes
 * Côté client: utilise l'URL complète (les rewrites Next.js ne fonctionnent pas pour fetch)
 * Côté serveur: utilise l'URL complète aussi
 */
const getBaseUrl = (): string => {
  // Toujours utiliser l'URL complète car les rewrites Next.js ne fonctionnent pas pour fetch côté client
  return getApiUrl();
};

/**
 * Options pour les appels API
 */
export interface ApiRequestOptions extends RequestInit {
  /** Corps de la requête (sera automatiquement stringifié si objet) */
  body?: any;
  /** Headers additionnels */
  headers?: Record<string, string>;
  /** Si false, n'ajoute pas les credentials (cookies) */
  requireAuth?: boolean;
}

/**
 * Réponse standardisée de l'API
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  timestamp?: string;
  status?: number;
}

/**
 * Callback pour gérer les erreurs 401 (non autorisé)
 * Permet de forcer une déconnexion quand l'utilisateur n'est plus autorisé
 */
export type OnUnauthorizedCallback = () => void | Promise<void>;

/**
 * Client API avec gestion centralisée des erreurs et headers
 * Gère l'authentification via cookies httpOnly
 */
class ApiClient {
  private baseUrl: string;
  private onUnauthorizedCallback: OnUnauthorizedCallback | null = null;

  constructor() {
    this.baseUrl = getBaseUrl();
  }

  /**
   * Configure le callback appelé en cas d'erreur 401 (utilisateur non autorisé)
   * Utile pour forcer une déconnexion quand l'utilisateur a été supprimé
   */
  setOnUnauthorized(callback: OnUnauthorizedCallback | null): void {
    this.onUnauthorizedCallback = callback;
  }

  /**
   * Construit l'URL complète
   * Utilise toujours l'URL complète car les rewrites Next.js ne fonctionnent pas pour fetch côté client
   */
  private buildUrl(endpoint: string): string {
    // Si l'endpoint commence déjà par http, on l'utilise tel quel
    if (endpoint.startsWith("http")) {
      return endpoint;
    }

    // Nettoyer l'endpoint
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // Toujours construire l'URL complète
    // Les rewrites Next.js ne fonctionnent que pour les requêtes serveur (SSR), pas pour fetch côté client
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  /**
   * Récupère le token d'authentification depuis localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === "undefined") {
      return null; // SSR
    }
    return localStorage.getItem("auth_token");
  }

  /**
   * Construit les headers par défaut
   * Ajoute le token d'authentification depuis localStorage si disponible
   */
  private buildHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    // Ajouter le token d'authentification depuis localStorage si disponible
    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      
      // Log pour déboguer en production
      if (
        process.env.NODE_ENV === "production" &&
        typeof window !== "undefined"
      ) {
        console.log(
          `[apiClient] Token ajouté au header Authorization, longueur: ${token.length}`
        );
      }
    } else {
      // Log pour déboguer si le token n'est pas disponible
      if (
        process.env.NODE_ENV === "production" &&
        typeof window !== "undefined"
      ) {
        console.warn(
          `[apiClient] Aucun token dans localStorage pour l'endpoint: ${endpoint}`
        );
      }
    }

    return headers;
  }

  /**
   * Prépare le body de la requête
   */
  private prepareBody(body?: any): string | undefined {
    if (body === undefined) {
      return undefined;
    }
    if (typeof body === "string") {
      return body;
    }
    return JSON.stringify(body);
  }

  /**
   * Gère les erreurs HTTP
   * En cas d'erreur 401, appelle le callback de déconnexion si configuré
   */
  private async handleError(response: Response): Promise<never> {
    let errorData: any = {};
    try {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }
    } catch {
      errorData = { message: "Erreur inconnue" };
    }

    // Si erreur 401 (non autorisé), appeler le callback de déconnexion
    // Cela permet de forcer une déconnexion si l'utilisateur a été supprimé
    if (response.status === 401 && this.onUnauthorizedCallback) {
      try {
        await this.onUnauthorizedCallback();
      } catch (callbackError) {
        console.error("Error in onUnauthorized callback:", callbackError);
      }
    }

    const error = new Error(
      errorData.message || errorData.error || `Erreur ${response.status}`
    );
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  /**
   * Parse la réponse JSON
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return await response.json();
    }
    return (await response.text()) as T;
  }

  /**
   * Méthode générique pour les appels API
   */
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const { body, headers, requireAuth = true, ...fetchOptions } = options;

    const url = this.buildUrl(endpoint);
    const requestHeaders = this.buildHeaders(headers);
    const requestBody = this.prepareBody(body);

    try {
      // Les cookies httpOnly sont envoyés automatiquement avec credentials: "include"
      // IMPORTANT: Pour le login/register/verify, on doit utiliser "include" même si requireAuth est false
      // pour recevoir/envoyer le cookie d'authentification
      const needsCredentials =
        requireAuth ||
        endpoint.includes("/auth/login") ||
        endpoint.includes("/auth/register") ||
        endpoint.includes("/auth/verify") ||
        endpoint.includes("/auth/logout");

      const response = await fetch(url, {
        ...fetchOptions,
        method: fetchOptions.method || "GET",
        headers: requestHeaders,
        body: requestBody,
        credentials: needsCredentials ? "include" : "omit", // Important pour envoyer/recevoir les cookies
      });

      // Log pour déboguer en production
      if (
        process.env.NODE_ENV === "production" &&
        typeof window !== "undefined" &&
        needsCredentials
      ) {
        const setCookieHeader = response.headers.get("Set-Cookie");
        const allHeaders = Array.from(response.headers.entries());
        console.log(`[apiClient] Requête vers ${endpoint}:`, {
          url,
          credentials: needsCredentials ? "include" : "omit",
          setCookieHeader: setCookieHeader || "aucun",
          status: response.status,
          // Vérifier si le header Set-Cookie contient SameSite=None
          hasSameSiteNone: setCookieHeader
            ? setCookieHeader.includes("SameSite=None")
            : false,
          hasSecure: setCookieHeader
            ? setCookieHeader.includes("Secure")
            : false,
          allHeaders: allHeaders.filter(
            ([key]) =>
              key.toLowerCase().includes("cookie") ||
              key.toLowerCase().includes("set-cookie")
          ),
        });
      }

      if (!response.ok) {
        await this.handleError(response);
      }

      return this.parseResponse<T>(response);
    } catch (error: any) {
      // Gérer les erreurs réseau (CORS, connexion refusée, timeout, etc.)
      if (
        error instanceof TypeError &&
        (error.message.includes("fetch") ||
          error.message.includes("Load failed") ||
          error.message.includes("Failed to fetch"))
      ) {
        const apiUrl = this.baseUrl;

        // Log détaillé pour le débogage en production
        if (
          process.env.NODE_ENV === "production" &&
          typeof window !== "undefined"
        ) {
          console.error("[ApiClient] Erreur réseau:", {
            endpoint,
            url,
            error: error.message,
            apiUrl,
            origin: window.location.origin,
            hasToken: !!this.getAuthToken(),
          });
        }

        // Pour le logout, ne pas lancer d'erreur car le cookie est déjà supprimé côté serveur
        if (endpoint.includes("/auth/logout")) {
          console.warn(
            "[ApiClient] Erreur réseau lors du logout, mais la déconnexion locale est effectuée"
          );
          // Retourner un objet vide pour indiquer que la déconnexion locale est OK
          return {} as T;
        }

        // Pour verifyAuth, on veut retourner une réponse par défaut au lieu de lancer une erreur
        // pour éviter que l'application reste bloquée
        if (endpoint.includes("/auth/verify")) {
          console.warn(
            "[ApiClient] Erreur réseau lors de verifyAuth, retour d'une réponse par défaut"
          );
          // Lancer une erreur spéciale qui sera catchée par verifyAuth
          throw new Error("Erreur de connexion au serveur");
        }

        throw new Error(
          `Erreur de connexion au serveur (${apiUrl}). Vérifiez que l'API Gateway est accessible et que CORS est correctement configuré.`
        );
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  /**
   * Construit une URL à partir d'un chemin relatif
   * Utilise toujours l'URL complète
   * @param path - Chemin relatif (ex: "/api/images/1")
   */
  getImageUrl(path: string): string {
    // Si le chemin commence déjà par http, on l'utilise tel quel
    if (path.startsWith("http")) {
      return path;
    }

    // Nettoyer le chemin
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    // Toujours construire l'URL complète
    return `${this.baseUrl}${cleanPath}`;
  }
}

// Instance singleton
export const apiClient = new ApiClient();
