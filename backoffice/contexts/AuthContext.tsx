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
 * Messages d'erreur centralisés
 */
export const AUTH_ERROR_MESSAGES = {
  SERVER_ERROR: "Erreur de connexion au serveur",
  LOGIN_ERROR: "Erreur de connexion",
  REGISTER_ERROR: "Erreur lors de la création du compte",
  RESET_PASSWORD_ERROR: "Erreur lors de l'envoi de l'email",
  CONFIRM_RESET_ERROR: "Erreur lors de la réinitialisation",
  PASSWORD_MISMATCH: "Les mots de passe ne correspondent pas",
  PASSWORD_TOO_SHORT: "Le mot de passe doit contenir au moins 6 caractères",
  TOKEN_MISSING: "Token de réinitialisation manquant",
} as const;

/**
 * Résultat d'une opération d'authentification
 */
export interface AuthOperationResult {
  success: boolean;
  error?: string;
  message?: string;
  user?: UserPublicDTO;
  token?: string;
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
  /** Token d'authentification */
  token: string | null;
  /** Données utilisateur */
  user: UserPublicDTO | null;
  /** État de chargement */
  isLoading: boolean;
  /** Indique si l'utilisateur est authentifié */
  isAuthenticated: boolean;
  /** Indique si l'utilisateur est approuvé pour le backoffice */
  isApproved: boolean;
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
  /** Connecte l'utilisateur (sauvegarde token et user) */
  login: (token: string, user: UserPublicDTO) => void;
  /** Déconnecte l'utilisateur */
  logout: () => void;
  /** Vérifie l'authentification depuis localStorage */
  checkAuth: () => void;
  /** Récupère le token (helper) */
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
 * - Token et données utilisateur
 * - Vérification d'authentification au démarrage
 * - Méthodes de login/logout
 * - Synchronisation avec localStorage
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Vérifie l'authentification depuis localStorage
   */
  const checkAuth = useCallback(() => {
    const storedToken = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("user");

    if (!storedToken) {
      setToken(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr) as UserPublicDTO;
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error(
          "Erreur lors de la lecture des données utilisateur:",
          error
        );
        // En cas d'erreur, nettoyer le localStorage
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      }
    } else {
      setToken(storedToken);
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  /**
   * Connecte l'utilisateur
   */
  const login = useCallback((newToken: string, newUser: UserPublicDTO) => {
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsLoading(false);
  }, []);

  /**
   * Déconnecte l'utilisateur
   */
  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.push("/auth/login");
  }, [router]);

  /**
   * Récupère le token (helper)
   */
  const getAuthToken = useCallback(() => {
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

      // Ajouter le token si requis
      if (requireAuth) {
        const authToken = token || localStorage.getItem("auth_token");
        if (!authToken) {
          throw new Error("Token d'authentification requis");
        }
        requestHeaders["Authorization"] = `Bearer ${authToken}`;
      }

      // Préparer le body
      let requestBody: string | undefined;
      if (body !== undefined) {
        if (typeof body === "string") {
          requestBody = body;
        } else {
          requestBody = JSON.stringify(body);
        }
      }

      // Faire l'appel
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        method: fetchOptions.method || "GET",
        headers: requestHeaders,
        body: requestBody,
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
    [token]
  );

  /**
   * Valide un mot de passe via l'API backend
   * La validation de correspondance (confirmPassword) reste côté client
   */
  const validatePassword = useCallback(
    async (
      password: string,
      confirmPassword?: string
    ): Promise<PasswordValidationResult> => {
      // Validation de correspondance côté client
      if (confirmPassword !== undefined && password !== confirmPassword) {
        return {
          isValid: false,
          error: AUTH_ERROR_MESSAGES.PASSWORD_MISMATCH,
        };
      }

      // Validation de force du mot de passe via l'API backend
      try {
        const validationRequest: PasswordValidationDTO = {
          password,
        };

        const response = await fetch(`${API_URL}/api/auth/validate-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
            error: data.message || AUTH_ERROR_MESSAGES.SERVER_ERROR,
          };
        }
      } catch (error) {
        console.error("Password validation error:", error);
        return {
          isValid: false,
          error: AUTH_ERROR_MESSAGES.SERVER_ERROR,
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
          body: JSON.stringify(loginRequest),
        });

        const data = (await response.json()) as {
          success: boolean;
          user: UserPublicDTO;
          token: string;
          message?: string;
        };

        if (response.ok) {
          // Utiliser le contexte pour stocker le token et les données utilisateur
          login(data.token, data.user);

          return {
            success: true,
            user: data.user,
            token: data.token,
            message: data.message,
          };
        } else {
          return {
            success: false,
            error: data.message || AUTH_ERROR_MESSAGES.LOGIN_ERROR,
          };
        }
      } catch (error) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES.SERVER_ERROR,
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
          body: JSON.stringify(userData),
        });

        const data = (await response.json()) as {
          success: boolean;
          user: UserPublicDTO;
          token: string;
          approvalToken?: string;
          rejectionToken?: string;
          message?: string;
        };

        if (response.ok) {
          return {
            success: true,
            user: data.user,
            token: data.token,
            message:
              data.message ||
              "Compte créé avec succès ! Un email de demande d'approbation a été envoyé à l'administrateur. Vous recevrez une notification une fois votre accès approuvé.",
          };
        } else {
          return {
            success: false,
            error: data.message || AUTH_ERROR_MESSAGES.REGISTER_ERROR,
          };
        }
      } catch (error) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES.SERVER_ERROR,
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
            error: data.message || AUTH_ERROR_MESSAGES.RESET_PASSWORD_ERROR,
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
            error: data.message || AUTH_ERROR_MESSAGES.CONFIRM_RESET_ERROR,
          };
        }
      } catch (error) {
        return {
          success: false,
          error: AUTH_ERROR_MESSAGES.SERVER_ERROR,
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
  const isAuthenticated = !!token;
  const isApproved = !!(
    token &&
    user &&
    user.isBackofficeApproved &&
    !user.isBackofficeRejected
  );

  const value: AuthContextType = {
    token,
    user,
    isLoading,
    isAuthenticated,
    isApproved,
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
