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
 */
export interface EmailClientSendDTO {
  to: {
    email: string;
    name?: string;
  };
  subject: string;
  message: string;
  clientName: string;
  clientEmail: string;
}

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
 * DTO pour l'envoi d'email de demande d'approbation backoffice
 */
export interface EmailBackofficeApprovalRequestDTO {
  userFullName: string;
  userEmail: string;
  user: {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  approvalUrl: string;
  rejectionUrl: string;
}

/**
 * DTO pour l'envoi d'email de confirmation d'approbation backoffice
 */
export interface EmailBackofficeApprovalConfirmationDTO {
  userEmail: string;
  userFullName: string;
  user: {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  backofficeUrl: string;
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
