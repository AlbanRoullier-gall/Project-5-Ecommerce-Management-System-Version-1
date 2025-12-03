/**
 * Service pour le formulaire de contact
 * Gère l'envoi d'emails de contact
 */

import { apiClient } from "./apiClient";
import { ContactFormDTO } from "../dto";

/**
 * Réponse de l'API d'envoi d'email
 */
interface EmailSendResponse {
  success: boolean;
  message?: string;
  messageId?: string;
  recipient?: string;
  subject?: string;
  sentAt?: string;
  timestamp?: string;
}

/**
 * Envoie un email de contact
 */
export async function sendContactEmail(
  data: ContactFormDTO
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiClient.post<EmailSendResponse>(
      "/api/email/send",
      data
    );

    // Retourner uniquement les champs nécessaires pour le hook
    return {
      success: response.success ?? true,
      message: response.message,
    };
  } catch (error: any) {
    // Si l'erreur vient de apiClient, elle contient déjà les informations nécessaires
    // Si l'email a été envoyé (status 201) mais qu'il y a une erreur de parsing,
    // on considère que c'est un succès
    if (error.status === 201 || (error.data && error.data.success)) {
      return {
        success: true,
        message: error.data?.message || "Email envoyé avec succès",
      };
    }

    // Sinon, on propage l'erreur
    throw error;
  }
}
