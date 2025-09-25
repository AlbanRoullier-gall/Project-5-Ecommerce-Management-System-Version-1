import { Request } from "express";

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

export interface WebsitePageData {
  id?: number;
  pageSlug: string;
  pageTitle: string;
  markdownContent: string;
  htmlContent?: string;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export interface WebsitePageUpdateData {
  pageSlug?: string;
  pageTitle?: string;
  markdownContent?: string;
}

export interface WebsitePageVersionData {
  id?: number;
  pageId: number;
  versionNumber: number;
  markdownContent: string;
  htmlContent?: string;
  createdAt?: Date | undefined;
}

export interface PageListOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PageListResult {
  pages: WebsitePageData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
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
