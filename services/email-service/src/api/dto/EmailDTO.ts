/**
 * Email DTOs - Version simplifiée pour Gmail
 * Data transfer objects pour l'envoi d'emails via Gmail
 */

/**
 * Email recipient interface
 */
export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Email d'envoi client (simplifié)
 */
export interface EmailSendDTO {
  to: EmailRecipient;
  subject: string;
  message: string;
  clientName: string;
  clientEmail: string;
}

/**
 * Email de confirmation (interne)
 */
export interface EmailConfirmationDTO {
  clientName: string;
  clientEmail: string;
  subject: string;
  message: string;
  sentAt: Date;
}

/**
 * Email public DTO (pour les réponses API)
 */
export interface EmailPublicDTO {
  messageId: string;
  status: "sent" | "failed";
  recipient: string;
  subject: string;
  sentAt: Date | null;
  error?: string;
}
