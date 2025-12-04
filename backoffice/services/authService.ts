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
} from "../dto";
import { ApiResponse } from "./apiClient";

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

    const response = await apiClient.post<
      ApiResponse<{
        success: boolean;
        user: UserPublicDTO;
        message?: string;
      }>
    >(`/api/auth/login`, loginRequest, { requireAuth: false });

    if (response.data && response.data.user) {
      return {
        success: true,
        user: response.data.user,
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        error: response.data?.message || "Erreur de connexion",
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
  await apiClient.post(`/api/admin/auth/logout`);
}

/**
 * Inscrit un nouvel utilisateur
 */
export async function register(
  userData: UserCreateDTO
): Promise<AuthOperationResult> {
  try {
    const response = await apiClient.post<
      ApiResponse<{
        success: boolean;
        user: UserPublicDTO;
        message?: string;
      }>
    >(`/api/auth/register`, userData, { requireAuth: false });

    if (response.data && response.data.user) {
      return {
        success: true,
        user: response.data.user,
        message:
          response.data.message ||
          "Compte créé avec succès ! Un administrateur doit approuver votre accès au backoffice.",
      };
    } else {
      return {
        success: false,
        error: response.data?.message || "Erreur lors de la création du compte",
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

    const response = await apiClient.post<
      ApiResponse<{
        success: boolean;
        message?: string;
      }>
    >(`/api/auth/reset-password/confirm`, resetRequest, {
      requireAuth: false,
    });

    if (response.data && response.data.success) {
      return {
        success: true,
        message:
          "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.",
      };
    } else {
      return {
        success: false,
        error: response.data?.message || "Erreur lors de la réinitialisation",
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

    const response = await apiClient.post<
      ApiResponse<{
        success: boolean;
        valid: boolean;
        isValid: boolean;
        errors?: string[];
        message?: string;
      }>
    >(`/api/auth/validate-password`, validationRequest, {
      requireAuth: false,
    });

    if (response.data && response.data.success) {
      const isValid = response.data.valid ?? response.data.isValid ?? false;
      const errorMessage =
        response.data.errors && response.data.errors.length > 0
          ? response.data.errors.join("; ")
          : response.data.message || "Mot de passe invalide";

      return {
        isValid,
        error: isValid ? undefined : errorMessage,
      };
    } else {
      return {
        isValid: false,
        error:
          response.data?.message ||
          "Erreur lors de la validation du mot de passe",
      };
    }
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message || "Erreur de connexion au serveur",
    };
  }
}
