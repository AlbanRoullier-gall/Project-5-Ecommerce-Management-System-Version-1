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
      const { error } = schema.validate(req.body);
      if (error) {
        res
          .status(400)
          .json({ error: error.details[0]?.message || "Validation error" });
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
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        confirmPassword: Joi.string().optional(),
        firstName: Joi.string().max(100).required(),
        lastName: Joi.string().max(100).required(),
        role: Joi.string().valid("customer").optional(),
      }),

      loginSchema: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      }),

      changePasswordSchema: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(8).required(),
      }),

      passwordValidationSchema: Joi.object({
        password: Joi.string().required(),
      }),
    };
  }
}
