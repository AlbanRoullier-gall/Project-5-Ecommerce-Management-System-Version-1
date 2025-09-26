import { Request } from "express";

/**
 * Types spécifiques à la base de données du service website-content
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

// Database row types
export interface WebsitePageDbRow {
  id: number;
  page_slug: string;
  page_title: string;
  markdown_content: string;
  html_content: string;
  created_at: Date;
  updated_at: Date;
}

export interface WebsitePageVersionDbRow {
  id: number;
  page_id: number;
  version_number: number;
  markdown_content: string;
  html_content: string;
  created_at: Date;
}
