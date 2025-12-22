/**
 * Sanitization Middleware
 * Protects against XSS attacks by sanitizing user input
 *
 * This middleware sanitizes request bodies before they reach the handlers,
 * ensuring that potentially malicious HTML/JavaScript is neutralized.
 */

import { Request, Response, NextFunction } from "express";
// Import sanitization utilities from shared-types
// Utiliser le path alias - tsconfig-paths le résoudra à l'exécution
import {
  sanitizeRequestBody,
  sanitizeObject,
} from "@tfe/shared-types/common/sanitize";

/**
 * Middleware to sanitize request body
 * Sanitizes common user input fields to prevent XSS attacks
 *
 * This should be applied BEFORE validation middleware to ensure
 * that validation works on sanitized data
 */
export function sanitizationMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // Only sanitize POST, PUT, PATCH requests with a body
  if (
    !["POST", "PUT", "PATCH"].includes(req.method) ||
    !req.body ||
    typeof req.body !== "object"
  ) {
    return next();
  }

  try {
    // Sanitize the request body
    // This will recursively sanitize all string fields in the body
    req.body = sanitizeRequestBody(req.body);

    // Also sanitize query parameters if they contain user input
    if (req.query && typeof req.query === "object") {
      // Convert query to a sanitizable object
      const queryObj: Record<string, any> = {};
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === "string") {
          queryObj[key] = value;
        }
      }
      const sanitizedQuery = sanitizeObject(queryObj);
      // Update query with sanitized values
      for (const [key, value] of Object.entries(sanitizedQuery)) {
        if (typeof value === "string") {
          req.query[key] = value;
        }
      }
    }

    next();
  } catch (error) {
    console.error("Error in sanitization middleware:", error);
    // If sanitization fails, continue anyway (don't block the request)
    // but log the error for investigation
    next();
  }
}

/**
 * Selective sanitization middleware
 * Only sanitizes specific fields that are known to be user-generated content
 *
 * @param fields - List of field names to sanitize
 * @returns Middleware function
 */
export function selectiveSanitizationMiddleware(fields: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (
      !["POST", "PUT", "PATCH"].includes(req.method) ||
      !req.body ||
      typeof req.body !== "object"
    ) {
      return next();
    }

    try {
      req.body = sanitizeObject(req.body, fields, false);
      next();
    } catch (error) {
      console.error("Error in selective sanitization middleware:", error);
      next();
    }
  };
}

/**
 * Sanitization middleware for specific routes
 * Use this for routes that need custom sanitization rules
 *
 * Example: Routes that allow HTML (like rich text editors) would use allowHtml: true
 */
export function createSanitizationMiddleware(options: {
  allowHtml?: boolean;
  fields?: string[];
}) {
  const { allowHtml = false, fields } = options;

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (
      !["POST", "PUT", "PATCH"].includes(req.method) ||
      !req.body ||
      typeof req.body !== "object"
    ) {
      return next();
    }

    try {
      if (fields) {
        req.body = sanitizeObject(req.body, fields, allowHtml);
      } else {
        req.body = sanitizeRequestBody(req.body);
      }
      next();
    } catch (error) {
      console.error("Error in custom sanitization middleware:", error);
      next();
    }
  };
}
