"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/router";
import { UserPublicDTO, UserCreateDTO } from "dto";
import {
  verifyAuth,
  login as loginService,
  logout as logoutService,
  register as registerService,
  requestPasswordReset as requestPasswordResetService,
  confirmPasswordReset as confirmPasswordResetService,
  validatePassword as validatePasswordService,
  type AuthOperationResult,
  type PasswordValidationResult,
} from "../services/authService";
import { apiClient } from "../services/apiClient";
import { API_URL } from "../config/api";
export type {
  AuthOperationResult,
  PasswordValidationResult,
} from "../config/api";

// Réexporter API_URL pour compatibilité
export { API_URL };

/**
 * État d'authentification
 */
interface AuthState {
  /** Données utilisateur (null si non authentifié, le token est dans un cookie httpOnly) */
  user: UserPublicDTO | null;
  /** État de chargement */
  isLoading: boolean;
  /** Indique si l'utilisateur est authentifié */
  isAuthenticated: boolean;
}

/**
 * Méthodes du contexte d'authentification
 */
interface AuthContextType extends AuthState {
  /** Connecte l'utilisateur (met à jour l'état local) */
  login: (user: UserPublicDTO) => void;
  /** Déconnecte l'utilisateur */
  logout: () => void;
  /** Vérifie l'authentification depuis le serveur (cookie httpOnly) */
  checkAuth: () => void;
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
 * - Délègue les appels API au service authService
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserPublicDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Nettoie l'état d'authentification
   */
  const clearAuthState = useCallback(() => {
    setUser(null);
  }, []);

  /**
   * Vérifie l'authentification depuis le serveur (cookie httpOnly)
   */
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await verifyAuth();

      if (data.success && data.isAuthenticated && data.user) {
        setUser(data.user);
      } else {
        clearAuthState();
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'authentification:",
        error
      );
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthState]);

  /**
   * Connecte l'utilisateur (met à jour l'état local)
   * Le token est dans un cookie httpOnly, on met juste à jour l'état
   */
  const login = useCallback((newUser: UserPublicDTO) => {
    setUser(newUser);
    setIsLoading(false);
  }, []);

  /**
   * Déconnecte l'utilisateur
   * Appelle l'API pour supprimer le cookie et met à jour l'état local
   */
  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      // Mettre à jour l'état local même si l'appel API échoue
      clearAuthState();
      router.push("/auth/login");
    }
  }, [clearAuthState, router]);

  /**
   * Connecte l'utilisateur avec email et mot de passe (appel API)
   */
  const loginWithCredentials = useCallback(
    async (email: string, password: string): Promise<AuthOperationResult> => {
      const result = await loginService(email, password);

      if (result.success && result.user) {
        // Mettre à jour l'état local après connexion réussie
        login(result.user);
      }

      return result;
    },
    [login]
  );

  /**
   * Inscrit un nouvel utilisateur (appel API)
   */
  const register = useCallback(
    async (userData: UserCreateDTO): Promise<AuthOperationResult> => {
      return registerService(userData);
    },
    []
  );

  /**
   * Demande une réinitialisation de mot de passe (appel API)
   */
  const requestPasswordReset = useCallback(
    async (email: string): Promise<AuthOperationResult> => {
      return requestPasswordResetService(email);
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
      return confirmPasswordResetService(token, newPassword);
    },
    []
  );

  /**
   * Valide un mot de passe via l'API backend
   */
  const validatePassword = useCallback(
    async (
      password: string,
      confirmPassword?: string
    ): Promise<PasswordValidationResult> => {
      return validatePasswordService(password, confirmPassword);
    },
    []
  );

  // Configurer le callback de déconnexion pour les erreurs 401
  // Cela permet de forcer une déconnexion si l'utilisateur a été supprimé
  // Ne se déclenche que si l'utilisateur était authentifié avant
  useEffect(() => {
    apiClient.setOnUnauthorized(() => {
      // Ne déclencher la déconnexion que si l'utilisateur était authentifié
      // Cela évite de déconnecter lors du chargement initial ou si l'utilisateur n'était pas connecté
      if (!user) {
        return; // L'utilisateur n'était pas connecté, ne rien faire
      }

      // Forcer la déconnexion en cas d'erreur 401
      // Nettoyer uniquement l'état local (ne pas appeler logoutService pour éviter une boucle)
      clearAuthState();
      router.push("/auth/login");
    });

    // Nettoyer le callback au démontage
    return () => {
      apiClient.setOnUnauthorized(null);
    };
  }, [user, clearAuthState, router]);

  // Vérifier l'authentification au montage
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Calculer les valeurs dérivées (mémorisé pour éviter les recalculs inutiles)
  const isAuthenticated = useMemo(() => !!user, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
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
 * const { user, isAuthenticated, logout } = useAuth();
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};
