import { Request } from "express";

/**
 * Types spécifiques à la base de données du service payment
 * Types uniques qui ne sont pas dans shared-types
 */

export interface AuthenticatedRequest extends Request {
  user: {
    customerId: number;
    email: string;
    role: string;
  };
  headers: { [key: string]: string | string[] | undefined };
  params: { [key: string]: string };
  body: any;
}
