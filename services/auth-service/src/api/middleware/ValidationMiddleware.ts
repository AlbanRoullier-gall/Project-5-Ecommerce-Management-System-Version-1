/**
 * ValidationMiddleware
 * Middlewares de validation des données
 */
import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export class ValidationMiddleware {
  /**
   * Middleware de validation générique
   */
  static validateRequest = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error } = schema.validate(req.body, {
        abortEarly: false,
        messages: {
          "string.empty": "Le champ {#label} est requis",
          "string.min":
            "Le champ {#label} doit contenir au moins {#limit} caractères",
          "string.max":
            "Le champ {#label} ne doit pas dépasser {#limit} caractères",
          "string.email":
            "Le champ {#label} doit être une adresse email valide",
          "any.required": "Le champ {#label} est requis",
          "any.only":
            "Le champ {#label} doit être l'une des valeurs suivantes: {#valids}",
        },
      });
      if (error) {
        const messages = error.details.map((detail) => detail.message);
        res
          .status(400)
          .json({ error: messages.join("; ") || "Erreur de validation" });
        return;
      }
      next();
    };
  };

  /**
   * Schémas de validation centralisés
   */
  static getValidationSchemas() {
    return {
      registerSchema: Joi.object({
        email: Joi.string().email().required().label("Email").messages({
          "string.empty": "L'email est requis",
          "string.email": "L'email doit être une adresse email valide",
          "any.required": "L'email est requis",
        }),
        password: Joi.string()
          .min(8)
          .required()
          .label("Mot de passe")
          .messages({
            "string.empty": "Le mot de passe est requis",
            "string.min": "Le mot de passe doit contenir au moins 8 caractères",
            "any.required": "Le mot de passe est requis",
          }),
        confirmPassword: Joi.string()
          .optional()
          .label("Confirmation du mot de passe"),
        firstName: Joi.string().max(100).required().label("Prénom").messages({
          "string.empty": "Le prénom est requis",
          "string.max": "Le prénom ne doit pas dépasser 100 caractères",
          "any.required": "Le prénom est requis",
        }),
        lastName: Joi.string().max(100).required().label("Nom").messages({
          "string.empty": "Le nom est requis",
          "string.max": "Le nom ne doit pas dépasser 100 caractères",
          "any.required": "Le nom est requis",
        }),
        role: Joi.string().valid("customer").optional().label("Rôle"),
      }),

      loginSchema: Joi.object({
        email: Joi.string().email().required().label("Email").messages({
          "string.empty": "L'email est requis",
          "string.email": "L'email doit être une adresse email valide",
          "any.required": "L'email est requis",
        }),
        password: Joi.string().required().label("Mot de passe").messages({
          "string.empty": "Le mot de passe est requis",
          "any.required": "Le mot de passe est requis",
        }),
      }),

      passwordValidationSchema: Joi.object({
        password: Joi.string().required().label("Mot de passe").messages({
          "string.empty": "Le mot de passe est requis",
          "any.required": "Le mot de passe est requis",
        }),
      }),
    };
  }
}
