/**
 * Service de validation
 * Centralise les appels API de validation pour les formulaires
 */

import { apiClient } from "./apiClient";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
  error?: string;
}

/**
 * Valide les données d'un produit
 */
export async function validateProduct(data: any): Promise<ValidationResult> {
  try {
    const response = await apiClient.post<ValidationResult>(
      "/api/products/validate",
      data,
      { requireAuth: false }
    );

    return response;
  } catch (error: any) {
    if (error.data) {
      return error.data;
    }
    throw error;
  }
}

/**
 * Valide les données d'une catégorie
 */
export async function validateCategory(data: any): Promise<ValidationResult> {
  try {
    const response = await apiClient.post<ValidationResult>(
      "/api/categories/validate",
      data,
      { requireAuth: false }
    );

    return response;
  } catch (error: any) {
    if (error.data) {
      return error.data;
    }
    throw error;
  }
}

/**
 * Valide les données d'un client
 */
export async function validateCustomer(data: any): Promise<ValidationResult> {
  try {
    const response = await apiClient.post<ValidationResult>(
      "/api/customers/validate",
      data,
      { requireAuth: false }
    );

    return response;
  } catch (error: any) {
    if (error.data) {
      return error.data;
    }
    throw error;
  }
}

/**
 * Valide les données d'une adresse
 */
export async function validateAddress(data: any): Promise<ValidationResult> {
  try {
    const response = await apiClient.post<ValidationResult>(
      "/api/customers/addresses/validate",
      data,
      { requireAuth: false }
    );

    return response;
  } catch (error: any) {
    if (error.data) {
      return error.data;
    }
    throw error;
  }
}

