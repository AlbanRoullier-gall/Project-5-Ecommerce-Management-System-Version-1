/**
 * Service pour le checkout
 * Gère tous les appels API liés au checkout
 */

import { apiClient } from "./apiClient";
import { CustomerResolveOrCreateDTO, AddressesCreateDTO } from "../dto";
import { logger } from "./logger";

/**
 * Structure des données checkout stockées
 */
export interface CheckoutData {
  customerData: CustomerResolveOrCreateDTO;
  addressData: AddressesCreateDTO;
}

/**
 * Résultat de validation d'adresse
 */
export interface AddressValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Erreur de validation par champ
 */
export interface FieldValidationError {
  field: string;
  message: string;
}

/**
 * Résultat de validation des données client
 */
export interface CustomerValidationResult {
  isValid: boolean;
  errors?: FieldValidationError[];
  generalError?: string;
}

/**
 * Résultat de la finalisation de commande
 */
export interface CompleteOrderResult {
  success: boolean;
  error?: string;
  paymentUrl?: string;
}

/**
 * Charge les données checkout depuis le serveur
 */
export async function getCheckoutData(): Promise<CheckoutData | null> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data?: CheckoutData;
    }>("/api/cart/checkout-data");

    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error: any) {
    // Si 404, c'est normal (pas de données checkout)
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Sauvegarde les données checkout sur le serveur
 */
export async function saveCheckoutData(data: CheckoutData): Promise<void> {
  await apiClient.post("/api/cart/checkout-data", data);
}

/**
 * Valide les adresses de livraison et de facturation
 */
export async function validateAddresses(
  addressData: AddressesCreateDTO
): Promise<AddressValidationResult> {
  try {
    const response = await apiClient.post<{
      isValid: boolean;
      error?: string;
    }>("/api/customers/addresses/validate", addressData);

    if (!response.isValid) {
      return {
        isValid: false,
        error: response.error || "Erreur lors de la validation des adresses",
      };
    }

    return { isValid: true };
  } catch (error: any) {
    logger.error("Erreur lors de la validation des adresses", error);
    return {
      isValid: false,
      error: "Erreur lors de la validation des adresses",
    };
  }
}

/**
 * Valide les données client
 */
export async function validateCustomerData(
  customerData: CustomerResolveOrCreateDTO
): Promise<CustomerValidationResult> {
  try {
    const response = await apiClient.post<{
      isValid: boolean;
      errors?: FieldValidationError[];
      message?: string;
    }>("/api/customers/validate", customerData);

    if (!response.isValid) {
      return {
        isValid: false,
        errors: response.errors || [],
        generalError:
          response.message || "Erreur lors de la validation des données client",
      };
    }

    return { isValid: true };
  } catch (error: any) {
    logger.error("Erreur lors de la validation des données client", error);
    return {
      isValid: false,
      generalError: "Erreur lors de la validation des données client",
    };
  }
}

/**
 * Finalise la commande et crée la session de paiement Stripe
 */
export async function completeCheckout(payload: {
  successUrl: string;
  cancelUrl: string;
  termsAccepted: boolean;
}): Promise<CompleteOrderResult> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      paymentUrl?: string;
      error?: string;
      message?: string;
    }>("/api/checkout/complete", payload);

    if (response.success && response.paymentUrl) {
      return {
        success: true,
        paymentUrl: response.paymentUrl,
      };
    }

    return {
      success: false,
      error: response.error || response.message || "URL de paiement non reçue",
    };
  } catch (error: any) {
    const errorData = error.data || {};
    return {
      success: false,
      error:
        errorData.message ||
        errorData.error ||
        error.message ||
        "Erreur lors de la finalisation de la commande",
    };
  }
}
