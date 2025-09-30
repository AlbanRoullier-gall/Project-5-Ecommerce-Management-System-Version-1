/**
 * Email Mapper - Version simplifiée pour Gmail
 * Mapper pour les conversions DTO ↔ Service
 */

import { EmailSendDTO, EmailConfirmationDTO, EmailPublicDTO } from "../dto";

/**
 * Email Mapper class
 */
export class EmailMapper {
  /**
   * Convert EmailSendDTO to email service data
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
   * Convert EmailConfirmationDTO to email service data
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
   * Convert email service result to EmailPublicDTO
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
