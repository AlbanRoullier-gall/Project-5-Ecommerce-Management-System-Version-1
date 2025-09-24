/**
 * Middlewares de validation pour l'API Gateway
 * Utilise les types partagés pour valider les requêtes
 */

import { Request, Response, NextFunction } from "express";
// Les types sont utilisés pour la validation mais pas importés directement

// ===========================================
// TYPES POUR LA VALIDATION
// ===========================================

interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ===========================================
// FONCTIONS DE VALIDATION
// ===========================================

/**
 * Valide les données de connexion
 */
const validateLoginRequest = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  if (
    !data.email ||
    typeof data.email !== "string" ||
    !data.email.includes("@")
  ) {
    errors.push({
      field: "email",
      message: "Email is required and must be a valid email address",
      value: data.email,
    });
  }

  if (
    !data.password ||
    typeof data.password !== "string" ||
    data.password.length < 6
  ) {
    errors.push({
      field: "password",
      message: "Password is required and must be at least 6 characters",
      value: data.password,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valide les données d'inscription
 */
const validateRegisterRequest = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  if (
    !data.email ||
    typeof data.email !== "string" ||
    !data.email.includes("@")
  ) {
    errors.push({
      field: "email",
      message: "Email is required and must be a valid email address",
      value: data.email,
    });
  }

  if (
    !data.password ||
    typeof data.password !== "string" ||
    data.password.length < 6
  ) {
    errors.push({
      field: "password",
      message: "Password is required and must be at least 6 characters",
      value: data.password,
    });
  }

  if (
    !data.firstName ||
    typeof data.firstName !== "string" ||
    data.firstName.trim().length === 0
  ) {
    errors.push({
      field: "firstName",
      message: "First name is required",
      value: data.firstName,
    });
  }

  if (
    !data.lastName ||
    typeof data.lastName !== "string" ||
    data.lastName.trim().length === 0
  ) {
    errors.push({
      field: "lastName",
      message: "Last name is required",
      value: data.lastName,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valide les données de contact
 */
const validateContactForm = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    errors.push({
      field: "name",
      message: "Name is required",
      value: data.name,
    });
  }

  if (
    !data.email ||
    typeof data.email !== "string" ||
    !data.email.includes("@")
  ) {
    errors.push({
      field: "email",
      message: "Email is required and must be a valid email address",
      value: data.email,
    });
  }

  if (
    !data.subject ||
    typeof data.subject !== "string" ||
    data.subject.trim().length === 0
  ) {
    errors.push({
      field: "subject",
      message: "Subject is required",
      value: data.subject,
    });
  }

  if (
    !data.message ||
    typeof data.message !== "string" ||
    data.message.trim().length === 0
  ) {
    errors.push({
      field: "message",
      message: "Message is required",
      value: data.message,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valide les données de création de produit
 */
const validateCreateProductRequest = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    errors.push({
      field: "name",
      message: "Product name is required",
      value: data.name,
    });
  }

  if (
    data.price === undefined ||
    typeof data.price !== "number" ||
    data.price < 0
  ) {
    errors.push({
      field: "price",
      message: "Price is required and must be a positive number",
      value: data.price,
    });
  }

  if (
    data.vatRate === undefined ||
    typeof data.vatRate !== "number" ||
    data.vatRate < 0 ||
    data.vatRate > 100
  ) {
    errors.push({
      field: "vatRate",
      message: "VAT rate is required and must be between 0 and 100",
      value: data.vatRate,
    });
  }

  if (
    !data.categoryId ||
    typeof data.categoryId !== "number" ||
    data.categoryId <= 0
  ) {
    errors.push({
      field: "categoryId",
      message: "Category ID is required and must be a positive number",
      value: data.categoryId,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valide les données de mise à jour de produit
 */
const validateUpdateProductRequest = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Pour les mises à jour, tous les champs sont optionnels mais doivent être valides s'ils sont présents
  if (
    data.name !== undefined &&
    (typeof data.name !== "string" || data.name.trim().length === 0)
  ) {
    errors.push({
      field: "name",
      message: "Product name must be a non-empty string",
      value: data.name,
    });
  }

  if (
    data.price !== undefined &&
    (typeof data.price !== "number" || data.price < 0)
  ) {
    errors.push({
      field: "price",
      message: "Price must be a positive number",
      value: data.price,
    });
  }

  if (
    data.vatRate !== undefined &&
    (typeof data.vatRate !== "number" || data.vatRate < 0 || data.vatRate > 100)
  ) {
    errors.push({
      field: "vatRate",
      message: "VAT rate must be between 0 and 100",
      value: data.vatRate,
    });
  }

  if (
    data.categoryId !== undefined &&
    (typeof data.categoryId !== "number" || data.categoryId <= 0)
  ) {
    errors.push({
      field: "categoryId",
      message: "Category ID must be a positive number",
      value: data.categoryId,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valide les données de création de catégorie
 */
const validateCreateCategoryRequest = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    errors.push({
      field: "name",
      message: "Category name is required",
      value: data.name,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valide les données de mise à jour de catégorie
 */
const validateUpdateCategoryRequest = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  if (
    data.name !== undefined &&
    (typeof data.name !== "string" || data.name.trim().length === 0)
  ) {
    errors.push({
      field: "name",
      message: "Category name must be a non-empty string",
      value: data.name,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ===========================================
// MIDDLEWARES DE VALIDATION
// ===========================================

/**
 * Middleware de validation pour la connexion
 */
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const validation = validateLoginRequest(req.body);

  if (!validation.isValid) {
    res.status(400).json({
      error: "Validation failed",
      message: "Invalid login data",
      details: validation.errors,
    });
    return;
  }

  next();
};

/**
 * Middleware de validation pour l'inscription
 */
export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const validation = validateRegisterRequest(req.body);

  if (!validation.isValid) {
    res.status(400).json({
      error: "Validation failed",
      message: "Invalid registration data",
      details: validation.errors,
    });
    return;
  }

  next();
};

/**
 * Middleware de validation pour le formulaire de contact
 */
export const validateContact = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const validation = validateContactForm(req.body);

  if (!validation.isValid) {
    res.status(400).json({
      error: "Validation failed",
      message: "Invalid contact form data",
      details: validation.errors,
    });
    return;
  }

  next();
};

/**
 * Middleware de validation pour la création de produit
 */
export const validateCreateProduct = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const validation = validateCreateProductRequest(req.body);

  if (!validation.isValid) {
    res.status(400).json({
      error: "Validation failed",
      message: "Invalid product data",
      details: validation.errors,
    });
    return;
  }

  next();
};

/**
 * Middleware de validation pour la mise à jour de produit
 */
export const validateUpdateProduct = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const validation = validateUpdateProductRequest(req.body);

  if (!validation.isValid) {
    res.status(400).json({
      error: "Validation failed",
      message: "Invalid product update data",
      details: validation.errors,
    });
    return;
  }

  next();
};

/**
 * Middleware de validation pour la création de catégorie
 */
export const validateCreateCategory = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const validation = validateCreateCategoryRequest(req.body);

  if (!validation.isValid) {
    res.status(400).json({
      error: "Validation failed",
      message: "Invalid category data",
      details: validation.errors,
    });
    return;
  }

  next();
};

/**
 * Middleware de validation pour la mise à jour de catégorie
 */
export const validateUpdateCategory = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const validation = validateUpdateCategoryRequest(req.body);

  if (!validation.isValid) {
    res.status(400).json({
      error: "Validation failed",
      message: "Invalid category update data",
      details: validation.errors,
    });
    return;
  }

  next();
};
