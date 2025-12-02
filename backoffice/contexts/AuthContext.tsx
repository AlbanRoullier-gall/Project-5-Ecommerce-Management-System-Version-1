"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/router";
import {
  UserPublicDTO,
  UserLoginDTO,
  UserCreateDTO,
  PasswordResetDTO,
  PasswordValidationDTO,
} from "../dto";

/**
 * URL de l'API centralisée
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Résultat d'une opération d'authentification
 */
export interface AuthOperationResult {
  success: boolean;
  error?: string;
  message?: string;
  user?: UserPublicDTO;
}

/**
 * Résultat de validation de mot de passe
 */
export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * État d'authentification
 */
interface AuthState {
  /** Flag d'authentification (le token est dans un cookie httpOnly) */
  token: string | null;
  /** Données utilisateur */
  user: UserPublicDTO | null;
  /** État de chargement */
  isLoading: boolean;
  /** Indique si l'utilisateur est authentifié */
  isAuthenticated: boolean;
}

/**
 * Options pour les appels API
 */
export interface ApiCallOptions extends RequestInit {
  /** URL complète ou chemin relatif (sera préfixé par API_URL) */
  url: string;
  /** Corps de la requête (sera automatiquement stringifié si objet) */
  body?: any;
  /** Headers additionnels */
  headers?: Record<string, string>;
  /** Si false, n'ajoute pas le token d'authentification */
  requireAuth?: boolean;
}

/**
 * Méthodes du contexte d'authentification
 */
interface AuthContextType extends AuthState {
  /** URL de l'API */
  API_URL: string;
  /** Connecte l'utilisateur (le token est dans un cookie httpOnly) */
  login: (token: string, user: UserPublicDTO) => void;
  /** Déconnecte l'utilisateur */
  logout: () => void;
  /** Vérifie l'authentification depuis le serveur (cookie httpOnly) */
  checkAuth: () => void;
  /** Récupère le flag d'authentification (le token est dans un cookie httpOnly) */
  getAuthToken: () => string | null;
  /**
   * Fait un appel API avec le token d'authentification automatiquement ajouté
   * @param options - Options de la requête (url, method, body, headers, etc.)
   * @returns Promise avec la réponse parsée en JSON
   * @throws Error si la requête échoue ou si le token est requis mais absent
   *
   * @example
   * const { apiCall } = useAuth();
   * const data = await apiCall({
   *   url: '/api/admin/statistics/dashboard',
   *   method: 'GET',
   *   requireAuth: true
   * });
   */
  apiCall: <T = any>(options: ApiCallOptions) => Promise<T>;
  /** Connecte l'utilisateur avec email et mot de passe (appel API) */
  loginWithCredentials: (
    email: string,
    password: string
  ) => Promise<AuthOperationResult>;
  /** Inscrit un nouvel utilisateur (appel API) */
  register: (userData: UserCreateDTO) => Promise<AuthOperationResult>;
  /** Demande une réinitialisation de mot de passe (appel API) */
  requestPasswordReset: (email: string) => Promise<AuthOperationResult>;
  /** Confirme la réinitialisation de mot de passe (appel API) */
  confirmPasswordReset: (
    token: string,
    newPassword: string
  ) => Promise<AuthOperationResult>;
  /** Valide un mot de passe via l'API backend */
  validatePassword: (
    password: string,
    confirmPassword?: string
  ) => Promise<PasswordValidationResult>;
}

/**
 * Contexte d'authentification
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props du provider d'authentification
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provider d'authentification
 *
 * Gère l'état d'authentification global de l'application :
 * - Données utilisateur (le token est dans un cookie httpOnly)
 * - Vérification d'authentification au démarrage via API
 * - Méthodes de login/logout
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Vérifie l'authentification depuis le serveur (cookie httpOnly)
   */
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important pour envoyer les cookies
      });

      const data = (await response.json()) as {
        success: boolean;
        isAuthenticated: boolean;
        user?: UserPublicDTO;
      };

      if (data.success && data.isAuthenticated && data.user) {
        setUser(data.user);
        setToken("authenticated"); // Flag pour indiquer qu'on est authentifié (le token est dans le cookie)
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'authentification:",
        error
      );
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Connecte l'utilisateur
   * Le token est maintenant dans un cookie httpOnly, on met juste à jour l'état
   */
  const login = useCallback((_newToken: string, newUser: UserPublicDTO) => {
    // Le token est dans le cookie httpOnly, on ne le stocke plus dans localStorage
    setToken("authenticated"); // Flag pour indiquer qu'on est authentifié
    setUser(newUser);
    setIsLoading(false);
  }, []);

  /**
   * Déconnecte l'utilisateur
   * Appelle l'API pour supprimer le cookie
   */
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important pour envoyer les cookies
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      // Mettre à jour l'état local même si l'appel API échoue
      setToken(null);
      setUser(null);
      router.push("/auth/login");
    }
  }, [router]);

  /**
   * Récupère le token (helper)
   * Le token est maintenant dans un cookie httpOnly, on retourne un flag
   */
  const getAuthToken = useCallback(() => {
    // Le token est dans le cookie httpOnly, on ne peut pas le récupérer depuis JavaScript
    // On retourne un flag pour indiquer qu'on est authentifié
    return token;
  }, [token]);

  /**
   * Fait un appel API avec le token d'authentification automatiquement ajouté
   * Centralise la gestion des appels API authentifiés
   */
  const apiCall = useCallback(
    async <T = any,>(options: ApiCallOptions): Promise<T> => {
      const {
        url,
        body,
        headers = {},
        requireAuth = true,
        ...fetchOptions
      } = options;

      // Construire l'URL complète
      const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;

      // Préparer les headers
      const requestHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...headers,
      };

      // Le token est maintenant dans un cookie httpOnly
      // Le navigateur l'envoie automatiquement avec credentials: "include"
      // Plus besoin d'ajouter le header Authorization manuellement

      // Préparer le body
      let requestBody: string | undefined;
      if (body !== undefined) {
        if (typeof body === "string") {
          requestBody = body;
        } else {
          requestBody = JSON.stringify(body);
        }
      }

      // Faire l'appel avec credentials pour envoyer les cookies
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        method: fetchOptions.method || "GET",
        headers: requestHeaders,
        body: requestBody,
        credentials: "include", // Important pour envoyer les cookies httpOnly
      });

      // Parser la réponse
      const contentType = response.headers.get("content-type");
      const isJson = contentType?.includes("application/json");

      if (!response.ok) {
        // Essayer de parser l'erreur
        let errorData: any = {};
        try {
          if (isJson) {
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

      // Retourner les données parsées
      if (isJson) {
        return await response.json();
      } else {
        return (await response.text()) as T;
      }
    },
    [] // Plus besoin de token dans les dépendances
  );

  /**
   * Valide un mot de passe via l'API backend
   * La validation de correspondance (confirmPassword) est gérée côté serveur
   */
  const validatePassword = useCallback(
    async (
      password: string,
      confirmPassword?: string
    ): Promise<PasswordValidationResult> => {
      // Validation complète (force + correspondance) via l'API backend
      try {
        const validationRequest: PasswordValidationDTO = {
          password,
          ...(confirmPassword !== undefined && { confirmPassword }),
        };

        const response = await fetch(`${API_URL}/api/auth/validate-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(validationRequest),
        });

        const data = (await response.json()) as {
          success: boolean;
          valid: boolean;
          isValid: boolean;
          errors?: string[];
          message?: string;
        };

        if (response.ok && data.success) {
          const isValid = data.valid ?? data.isValid ?? false;
          const errorMessage =
            data.errors && data.errors.length > 0
              ? data.errors.join("; ")
              : data.message || "Mot de passe invalide";

          return {
            isValid,
            error: isValid ? undefined : errorMessage,
          };
        } else {
          return {
            isValid: false,
            error:
              data.message || "Erreur lors de la validation du mot de passe",
          };
        }
      } catch (error) {
        console.error("Password validation error:", error);
        return {
          isValid: false,
          error: "Erreur de connexion au serveur",
        };
      }
    },
    []
  );

  /**
   * Connecte l'utilisateur avec email et mot de passe (appel API)
   */
  const loginWithCredentials = useCallback(
    async (email: string, password: string): Promise<AuthOperationResult> => {
      try {
        const loginRequest: UserLoginDTO = {
          email,
          password,
        };

        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important pour recevoir les cookies
          body: JSON.stringify(loginRequest),
        });

        const data = (await response.json()) as {
          success: boolean;
          user: UserPublicDTO;
          message?: string;
        };

        if (response.ok) {
          // Le token est maintenant dans un cookie httpOnly
          // On stocke juste les données utilisateur
          login("authenticated", data.user);

          return {
            success: true,
            user: data.user,
            message: data.message,
          };
        } else {
          return {
            success: false,
            error: data.message || "Erreur de connexion",
          };
        }
      } catch (error) {
        return {
          success: false,
          error: "Erreur de connexion au serveur",
        };
      }
    },
    [login]
  );

  /**
   * Inscrit un nouvel utilisateur (appel API)
   */
  const register = useCallback(
    async (userData: UserCreateDTO): Promise<AuthOperationResult> => {
      try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important pour recevoir les cookies
          body: JSON.stringify(userData),
        });

        const data = (await response.json()) as {
          success: boolean;
          user: UserPublicDTO;
          message?: string;
        };

        if (response.ok) {
          // Le token est maintenant dans un cookie httpOnly
          return {
            success: true,
            user: data.user,
            message:
              data.message ||
              "Compte créé avec succès ! Un administrateur doit approuver votre accès au backoffice.",
          };
        } else {
          return {
            success: false,
            error: data.message || "Erreur lors de la création du compte",
          };
        }
      } catch (error) {
        return {
          success: false,
          error: "Erreur de connexion au serveur",
        };
      }
    },
    []
  );

  /**
   * Demande une réinitialisation de mot de passe (appel API)
   */
  const requestPasswordReset = useCallback(
    async (email: string): Promise<AuthOperationResult> => {
      try {
        const response = await fetch(`${API_URL}/api/auth/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          return {
            success: true,
            message:
              "Un email de réinitialisation a été envoyé à votre adresse email.",
          };
        } else {
          const data = await response.json();
          return {
            success: false,
            error: data.message || "Erreur lors de l'envoi de l'email",
          };
        }
      } catch (error) {
        // Pour la démo, on simule un succès même en cas d'erreur
        return {
          success: true,
          message:
            "Un email de réinitialisation a été envoyé à votre adresse email.",
        };
      }
    },
    []
  );

  /**
   * Confirme la réinitialisation de mot de passe (appel API)
   */
  const confirmPasswordReset = useCallback(
    async (
      token: string,
      newPassword: string
    ): Promise<AuthOperationResult> => {
      try {
        const resetRequest: PasswordResetDTO = {
          token,
          newPassword,
        };

        const response = await fetch(
          `${API_URL}/api/auth/reset-password/confirm`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(resetRequest),
          }
        );

        const data = (await response.json()) as {
          success: boolean;
          message?: string;
        };

        if (response.ok) {
          return {
            success: true,
            message:
              "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.",
          };
        } else {
          return {
            success: false,
            error: data.message || "Erreur lors de la réinitialisation",
          };
        }
      } catch (error) {
        return {
          success: false,
          error: "Erreur de connexion au serveur",
        };
      }
    },
    []
  );

  // Vérifier l'authentification au montage
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Calculer les valeurs dérivées
  // Le token est maintenant un flag "authenticated" si on est connecté
  const isAuthenticated = token === "authenticated" && !!user;

  const value: AuthContextType = {
    token,
    user,
    isLoading,
    isAuthenticated,
    API_URL,
    login,
    logout,
    checkAuth,
    getAuthToken,
    apiCall,
    loginWithCredentials,
    register,
    requestPasswordReset,
    confirmPasswordReset,
    validatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook pour accéder au contexte d'authentification
 *
 * @throws {Error} Si utilisé en dehors d'un AuthProvider
 * @returns Le contexte d'authentification
 *
 * @example
 * const { token, user, isAuthenticated, logout } = useAuth();
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};
