/**
 * DTOs pour le service email
 * Types partagés pour l'API REST
 */

/**
 * DTO pour l'envoi d'email
 * Basé sur les besoins du service email
 */
export interface EmailSendDTO {
  to: {
    email: string;
    name?: string;
  };
  subject: string;
  message: string;
  clientName: string;
  clientEmail: string;
}
