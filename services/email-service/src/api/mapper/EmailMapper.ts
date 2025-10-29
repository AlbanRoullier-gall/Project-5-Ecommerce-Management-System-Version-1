/**
 * Email Mapper - Version simplifiée pour Gmail
 * Mapper pour les conversions DTO ↔ Service
 */

import { EmailSendDTO, EmailConfirmationDTO, EmailPublicDTO } from "../dto";

/**
 * Classe de mapping des e-mails
 */
export class EmailMapper {
  /**
   * Convertir EmailSendDTO en données pour le service d'e-mail
   */
  static emailSendDTOToServiceData(dto: EmailSendDTO): any {
    return {
      to: dto.to,
      subject: dto.subject,
      message: dto.message,
      clientName: dto.clientName,
      clientEmail: dto.clientEmail,
    };
  }

  /**
   * Convertir EmailConfirmationDTO en données pour le service d'e-mail
   */
  static emailConfirmationDTOToServiceData(dto: EmailConfirmationDTO): any {
    return {
      clientName: dto.clientName,
      clientEmail: dto.clientEmail,
      subject: dto.subject,
      message: dto.message,
      sentAt: dto.sentAt,
    };
  }

  /**
   * Convertir le résultat du service d'e-mail en EmailPublicDTO
   */
  static emailServiceResultToPublicDTO(result: any): EmailPublicDTO {
    return {
      messageId: result.messageId,
      status: result.status,
      recipient: result.recipient,
      subject: result.subject,
      sentAt: result.sentAt,
      error: result.error,
    };
  }
}
