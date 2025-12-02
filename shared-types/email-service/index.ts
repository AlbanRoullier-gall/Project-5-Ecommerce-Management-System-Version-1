/**
 * DTOs pour le service email
 * Types partagés pour l'API REST
 */

/**
 * DTO pour l'envoi d'email au client
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

// ===== TYPES SPÉCIFIQUES =====

/**
 * DTO pour l'envoi d'email client (contact form)
 * Le destinataire est déterminé côté serveur depuis ADMIN_EMAIL
 */
export interface EmailClientSendDTO {
  subject: string;
  message: string;
  clientName: string;
  clientEmail: string;
}

/**
 * DTO pour le formulaire de contact
 * Alias de EmailClientSendDTO pour plus de clarté dans le frontend
 * Le destinataire est déterminé automatiquement par le service depuis ADMIN_EMAIL
 */
export interface ContactFormDTO extends EmailClientSendDTO {}

/**
 * DTO pour l'envoi d'email de réinitialisation de mot de passe
 */
export interface EmailResetPasswordDTO {
  email: string;
  token: string;
  userName: string;
  resetUrl: string;
}

/**
 * DTO pour l'envoi d'email de rejet backoffice
 */
export interface EmailBackofficeRejectionDTO {
  userEmail: string;
  userFullName: string;
  user: {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}
