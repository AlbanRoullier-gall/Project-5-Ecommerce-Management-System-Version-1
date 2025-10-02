/**
 * ControllerUtils
 * Utilitaires communs pour les contrôleurs
 */
import { Response } from "express";

export class ControllerUtils {
  /**
   * Gestion centralisée des erreurs
   */
  static handleError(
    res: Response,
    error: any,
    context: string = "Error"
  ): void {
    console.error(`${context}:`, error);

    if (error.message.includes("existe déjà")) {
      res.status(409).json({ error: error.message });
      return;
    }

    if (
      error.message.includes("invalide") ||
      error.message.includes("incorrect") ||
      error.message.includes("ne correspondent pas")
    ) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (error.message.includes("désactivé")) {
      res.status(401).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Erreur interne du serveur" });
  }

  /**
   * Convertir PasswordValidationResult en PasswordValidationCriteria
   */
  static createPasswordCriteria(validation: {
    isValid: boolean;
    errors: string[];
  }) {
    return {
      minLength: !validation.errors.some((error: string) =>
        error.includes("au moins 8 caractères")
      ),
      hasUppercase: !validation.errors.some((error: string) =>
        error.includes("majuscule")
      ),
      hasLowercase: !validation.errors.some((error: string) =>
        error.includes("minuscule")
      ),
      hasNumber: !validation.errors.some((error: string) =>
        error.includes("chiffre")
      ),
      hasSpecialChar: !validation.errors.some((error: string) =>
        error.includes("caractère spécial")
      ),
    };
  }

  /**
   * Convertir UserUpdateDTO en données de mise à jour
   */
  static convertUpdateDTO(userUpdateDTO: any): any {
    const updateData: any = {};
    if (userUpdateDTO.firstName !== undefined) {
      updateData.first_name = userUpdateDTO.firstName;
    }
    if (userUpdateDTO.lastName !== undefined) {
      updateData.last_name = userUpdateDTO.lastName;
    }
    if (userUpdateDTO.email !== undefined) {
      updateData.email = userUpdateDTO.email;
    }
    return updateData;
  }
}
