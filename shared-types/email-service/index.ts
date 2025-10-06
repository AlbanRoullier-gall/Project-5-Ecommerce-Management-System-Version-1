/**
 * DTOs pour le service email
 * Types partagés pour l'API REST
 */

// ===== TYPES BASÉS SUR LES MODÈLES EXISTANTS =====

/**
 * Email recipient interface
 */
export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * DTO pour l'envoi d'email
 * Basé sur les besoins du service email
 */
export interface EmailSendDTO {
  to: EmailRecipient;
  subject: string;
  message: string;
  clientName: string;
  clientEmail: string;
}

/**
 * DTO pour la confirmation d'email
 * Utilisé pour les réponses internes
 */
export interface EmailConfirmationDTO {
  clientName: string;
  clientEmail: string;
  subject: string;
  message: string;
  sentAt: Date;
}

/**
 * DTO public pour un email
 * Basé sur les données retournées par l'API
 */
export interface EmailPublicDTO {
  messageId: string;
  status: "sent" | "failed";
  recipient: string;
  subject: string;
  sentAt: Date | null;
  error?: string;
}

// ===== TYPES SPÉCIFIQUES =====

/**
 * DTO pour les options d'envoi d'email
 */
export interface EmailOptionsDTO {
  priority?: "low" | "normal" | "high";
  template?: string;
  attachments?: EmailAttachmentDTO[];
}

/**
 * DTO pour les pièces jointes
 */
export interface EmailAttachmentDTO {
  filename: string;
  content: string; // Base64
  contentType: string;
}

/**
 * DTO pour la réponse de liste d'emails
 */
export interface EmailListDTO {
  emails: EmailPublicDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
