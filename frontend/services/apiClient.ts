/**
 * Client API centralisé
 * Gère tous les appels HTTP avec configuration centralisée
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
 * Client API avec gestion centralisée des erreurs et headers
 */
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getBaseUrl();
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
   * Récupère le sessionId depuis le localStorage (fallback si cookie non disponible)
   */
  private getCartSessionId(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("cart_session_id");
    } catch {
      return null;
    }
  }

  /**
   * Sauvegarde le sessionId dans le localStorage (fallback si cookie non disponible)
   */
  private setCartSessionId(sessionId: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("cart_session_id", sessionId);
    } catch {
      // Ignorer les erreurs de localStorage (mode privé, quota dépassé, etc.)
    }
  }

  /**
   * Extrait le sessionId depuis les headers de réponse
   * Le serveur envoie le sessionId dans le header X-Cart-Session-Id pour le fallback localStorage
   */
  private extractSessionIdFromResponse(response: Response): void {
    // Le serveur envoie le sessionId dans un header personnalisé (pour le fallback localStorage)
    // car les cookies httpOnly ne peuvent pas être lus par JavaScript
    const sessionId = response.headers.get("X-Cart-Session-Id");
    if (sessionId) {
      this.setCartSessionId(sessionId);
      // Log en développement pour vérifier que le sessionId est bien extrait
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[ApiClient] SessionId extrait et stocké: ${sessionId.substring(
            0,
            20
          )}...`
        );
      }
    } else if (process.env.NODE_ENV === "development") {
      // Log en développement si le header n'est pas présent
      console.warn(
        "[ApiClient] Header X-Cart-Session-Id non trouvé dans la réponse",
        response.url
      );
    }
  }

  /**
   * Construit les headers par défaut
   */
  private buildHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    // Ajouter le sessionId depuis localStorage si disponible (fallback pour cookies)
    // L'API Gateway utilisera ce header si le cookie n'est pas disponible
    const sessionId = this.getCartSessionId();
    if (sessionId) {
      headers["x-cart-session-id"] = sessionId;
      // Log en développement pour vérifier que le sessionId est bien envoyé
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[ApiClient] SessionId envoyé dans header: ${sessionId.substring(
            0,
            20
          )}...`
        );
      }
    } else if (process.env.NODE_ENV === "development") {
      // Log en développement si aucun sessionId n'est disponible
      console.warn("[ApiClient] Aucun sessionId disponible dans localStorage");
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
    const { body, headers, ...fetchOptions } = options;

    const url = this.buildUrl(endpoint);
    const requestHeaders = this.buildHeaders(headers);
    const requestBody = this.prepareBody(body);

    const response = await fetch(url, {
      ...fetchOptions,
      method: fetchOptions.method || "GET",
      headers: requestHeaders,
      body: requestBody,
      credentials: "include", // Important pour envoyer les cookies
    });

    // IMPORTANT: Extraire le sessionId depuis la réponse AVANT de vérifier si elle est OK
    // Le serveur envoie toujours le sessionId dans le header, même en cas d'erreur
    // Cela permet de maintenir la cohérence du sessionId même si la requête échoue
    this.extractSessionIdFromResponse(response);

    if (!response.ok) {
      await this.handleError(response);
    }

    return this.parseResponse<T>(response);
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
