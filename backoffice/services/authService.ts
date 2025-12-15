/**
 * Service pour l'authentification
 * Gère tous les appels API liés à l'authentification
 */

import { apiClient } from "./apiClient";
import {
  UserPublicDTO,
  UserLoginDTO,
  UserCreateDTO,
  PasswordResetDTO,
  PasswordValidationDTO,
} from "dto";

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
 * Vérifie l'authentification depuis le serveur (cookie httpOnly)
 * L'API retourne directement { success, isAuthenticated, user } et non { data: {...} }
 */
export async function verifyAuth(): Promise<{
  success: boolean;
  isAuthenticated: boolean;
  user?: UserPublicDTO;
}> {
  try {
    // L'API Gateway retourne directement { success, isAuthenticated, user }
    // Pas de wrapper ApiResponse pour cet endpoint
    // apiClient.post retourne directement le type T (pas ApiResponse<T>)
    const response = await apiClient.post<{
      success: boolean;
      isAuthenticated: boolean;
      user?: UserPublicDTO;
    }>(`/api/auth/verify`, undefined, { requireAuth: false });

    // Vérifier que la réponse a la structure attendue
    if (typeof response !== "object" || response === null) {
      console.error("verifyAuth: Réponse invalide", response);
      throw new Error(
        "Format de réponse invalide pour la vérification d'authentification"
      );
    }

    // Si la réponse est dans un wrapper ApiResponse, extraire data
    if (
      "data" in response &&
      typeof response.data === "object" &&
      response.data !== null
    ) {
      return response.data as {
        success: boolean;
        isAuthenticated: boolean;
        user?: UserPublicDTO;
      };
    }

    // Sinon, la réponse est directement l'objet attendu
    return response as {
      success: boolean;
      isAuthenticated: boolean;
      user?: UserPublicDTO;
    };
  } catch (error: any) {
    // Log l'erreur pour le débogage
    console.error("verifyAuth error:", error);

    // Si c'est une erreur réseau ou de connexion, retourner une réponse par défaut
    if (
      error.message?.includes("fetch") ||
      error.message?.includes("network") ||
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("Erreur de connexion")
    ) {
      throw new Error(
        "Erreur de connexion au serveur. Vérifiez que l'API Gateway est accessible."
      );
    }
    throw error;
  }
}

/**
 * Connecte l'utilisateur avec email et mot de passe
 * L'API Gateway retourne directement { message, user } depuis le service auth
 */
export async function login(
  email: string,
  password: string
): Promise<AuthOperationResult> {
  try {
    const loginRequest: UserLoginDTO = {
      email,
      password,
    };

    console.log(`[AuthService] Tentative de login pour: ${email}`);

    // L'API Gateway retourne directement { message, user, token? } (pas de wrapper ApiResponse)
    const response = await apiClient.post<{
      message: string;
      user: UserPublicDTO;
      token?: string; // Token optionnel pour fonctionner même si cookies third-party sont bloqués
    }>(`/api/auth/login`, loginRequest, { requireAuth: false });

    console.log(`[AuthService] Réponse login reçue:`, {
      hasUser: !!response.user,
      hasToken: !!response.token,
      tokenLength: response.token?.length,
      responseKeys: Object.keys(response),
      fullResponse: response, // Log complet pour debug
    });

    // Stocker le token dans localStorage si disponible (fallback si cookies third-party bloqués)
    if (response.token && typeof window !== "undefined") {
      localStorage.setItem("auth_token", response.token);
      console.log(`[AuthService] ✅ Token stocké dans localStorage (longueur: ${response.token.length})`);
    } else {
      console.log(`[AuthService] ⚠️ Token non disponible dans la réponse ou window undefined`, {
        hasToken: !!response.token,
        windowDefined: typeof window !== "undefined",
      });
    }

    if (response.user) {
      return {
        success: true,
        user: response.user,
        message: response.message,
      };
    } else {
      return {
        success: false,
        error: response.message || "Erreur de connexion",
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erreur de connexion au serveur",
    };
  }
}

/**
 * Déconnecte l'utilisateur
 */
export async function logout(): Promise<void> {
  await apiClient.post(`/api/auth/logout`, undefined, { requireAuth: false });
  
  // Supprimer le token du localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    console.log("[AuthService] Token supprimé de localStorage");
  }
}

/**
 * Inscrit un nouvel utilisateur
 * L'API Gateway retourne directement { message, user } depuis le service auth
 */
export async function register(
  userData: UserCreateDTO
): Promise<AuthOperationResult> {
  try {
    // L'API Gateway retourne directement { message, user } (pas de wrapper ApiResponse)
    const response = await apiClient.post<{
      message: string;
      user: UserPublicDTO;
    }>(`/api/auth/register`, userData, { requireAuth: false });

    if (response.user) {
      return {
        success: true,
        user: response.user,
        message:
          response.message ||
          "Compte créé avec succès ! Un administrateur doit approuver votre accès au backoffice.",
      };
    } else {
      return {
        success: false,
        error: response.message || "Erreur lors de la création du compte",
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erreur de connexion au serveur",
    };
  }
}

/**
 * Demande une réinitialisation de mot de passe
 */
export async function requestPasswordReset(
  email: string
): Promise<AuthOperationResult> {
  try {
    await apiClient.post(
      `/api/auth/reset-password`,
      { email },
      {
        requireAuth: false,
      }
    );

    return {
      success: true,
      message:
        "Un email de réinitialisation a été envoyé à votre adresse email.",
    };
  } catch (error: any) {
    // Pour la démo, on simule un succès même en cas d'erreur
    return {
      success: true,
      message:
        "Un email de réinitialisation a été envoyé à votre adresse email.",
    };
  }
}

/**
 * Confirme la réinitialisation de mot de passe
 * L'API Gateway retourne directement { success, message } depuis le service auth
 */
export async function confirmPasswordReset(
  token: string,
  newPassword: string
): Promise<AuthOperationResult> {
  try {
    const resetRequest: PasswordResetDTO = {
      token,
      newPassword,
    };

    // L'API Gateway retourne directement { success, message } (pas de wrapper ApiResponse)
    const response = await apiClient.post<{
      success: boolean;
      message?: string;
    }>(`/api/auth/reset-password/confirm`, resetRequest, {
      requireAuth: false,
    });

    if (response.success) {
      return {
        success: true,
        message:
          response.message ||
          "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.",
      };
    } else {
      return {
        success: false,
        error: response.message || "Erreur lors de la réinitialisation",
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erreur de connexion au serveur",
    };
  }
}

/**
 * Valide un mot de passe via l'API backend
 * L'API retourne directement { success, valid, isValid, errors, message }
 */
export async function validatePassword(
  password: string,
  confirmPassword?: string
): Promise<PasswordValidationResult> {
  try {
    const validationRequest: PasswordValidationDTO = {
      password,
      ...(confirmPassword !== undefined && { confirmPassword }),
    };

    // L'API retourne directement { success, valid, isValid, errors, message } (pas de wrapper ApiResponse)
    const response = await apiClient.post<{
      success: boolean;
      valid: boolean;
      isValid: boolean;
      errors?: string[];
      message?: string;
    }>(`/api/auth/validate-password`, validationRequest, {
      requireAuth: false,
    });

    if (response.success) {
      const isValid = response.valid ?? response.isValid ?? false;
      const errorMessage =
        response.errors && response.errors.length > 0
          ? response.errors.join("; ")
          : response.message || "Mot de passe invalide";

      return {
        isValid,
        error: isValid ? undefined : errorMessage,
      };
    } else {
      return {
        isValid: false,
        error:
          response.message || "Erreur lors de la validation du mot de passe",
      };
    }
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message || "Erreur de connexion au serveur",
    };
  }
}
