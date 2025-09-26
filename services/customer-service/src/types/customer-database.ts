import { Request } from "express";

/**
 * Types spécifiques à la base de données du service customer
 * Types uniques qui ne sont pas dans shared-types
 */

export interface AuthenticatedRequest extends Request {
  user: {
    customerId: number;
    email: string;
    role: string;
  };
}
