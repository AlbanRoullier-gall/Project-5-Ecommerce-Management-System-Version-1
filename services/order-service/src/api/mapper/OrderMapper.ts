/**
 * Mapper des Commandes
 * Transformation de données entre DTOs et modèles
 *
 * Architecture : Pattern Mapper
 * - Conversion DTO vers Modèle
 * - Conversion Modèle vers DTO
 * - Sécurité des types et validation
 */

import {
  OrderPublicDTO,
  OrderItemPublicDTO,
  CreditNoteCreateDTO,
  CreditNotePublicDTO,
  CreditNoteItemCreateDTO,
  CreditNoteItemPublicDTO,
} from "../dto";
import { OrderAddressPublicDTO } from "../dto";
import { CreditNoteData } from "../../models/CreditNote";
import { CreditNoteItemData } from "../../models/CreditNoteItem";

/**
 * Mapper des Commandes pour la transformation de données
 */
export class OrderMapper {
  /**
   * Convertir le modèle Order en OrderPublicDTO
   */
  static orderToPublicDTO(order: any): OrderPublicDTO {
    return {
      id: order.id,
      customerId: order.customerId,
      customerSnapshot: order.customerSnapshot,
      totalAmountHT: order.totalAmountHT,
      totalAmountTTC: order.totalAmountTTC,
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      delivered: order.delivered ?? false,
      customerFirstName: order.customerFirstName,
      customerLastName: order.customerLastName,
      customerEmail: order.customerEmail,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  // ===== MAPPERS DES ARTICLES DE COMMANDE =====

  /**
   * Convertir le modèle OrderItem en OrderItemPublicDTO
   * Harmonisé avec CartItemPublicDTO
   */
  static orderItemToPublicDTO(orderItem: any): OrderItemPublicDTO {
    return {
      id: orderItem.id,
      orderId: orderItem.orderId,
      productId: orderItem.productId,
      productName: orderItem.productName || "", // Garantir une valeur non vide
      description: orderItem.description ?? null,
      imageUrl: orderItem.imageUrl ?? null,
      quantity: orderItem.quantity,
      unitPriceHT: orderItem.unitPriceHT,
      unitPriceTTC: orderItem.unitPriceTTC,
      vatRate: orderItem.vatRate || 21,
      totalPriceHT: orderItem.totalPriceHT,
      totalPriceTTC: orderItem.totalPriceTTC,
      createdAt: orderItem.createdAt,
      updatedAt: orderItem.updatedAt,
    };
  }

  // ===== MAPPERS DES AVOIRS =====

  /**
   * Convertir CreditNoteCreateDTO en CreditNoteData
   */
  static creditNoteCreateDTOToCreditNoteData(
    dto: CreditNoteCreateDTO
  ): Partial<CreditNoteData> {
    return {
      customer_id: dto.customerId,
      order_id: dto.orderId,
      total_amount_ht: dto.totalAmountHT,
      total_amount_ttc: dto.totalAmountTTC,
      reason: dto.reason,
      description: dto.description ?? null,
      issue_date: dto.issueDate ? new Date(dto.issueDate) : null,
      payment_method: dto.paymentMethod || "",
      notes: dto.notes ?? null,
    };
  }

  /**
   * Convertir le modèle CreditNote en CreditNotePublicDTO
   */
  static creditNoteToPublicDTO(creditNote: any): CreditNotePublicDTO {
    return {
      id: creditNote.id,
      customerId: creditNote.customerId,
      orderId: creditNote.orderId,
      totalAmountHT: creditNote.totalAmountHT,
      totalAmountTTC: creditNote.totalAmountTTC,
      reason: creditNote.reason,
      description: creditNote.description,
      issueDate: creditNote.issueDate,
      paymentMethod: creditNote.paymentMethod,
      notes: creditNote.notes,
      status: creditNote.status || "pending",
      createdAt: creditNote.createdAt,
      updatedAt: creditNote.updatedAt,
    };
  }

  // ===== MAPPERS DES ARTICLES D'AVOIR =====

  /**
   * Convertir CreditNoteItemCreateDTO en CreditNoteItemData
   */
  static creditNoteItemCreateDTOToCreditNoteItemData(
    dto: CreditNoteItemCreateDTO
  ): CreditNoteItemData {
    return {
      id: 0, // Sera défini par la base de données
      credit_note_id: dto.creditNoteId,
      product_id: dto.productId,
      product_name: dto.productName,
      quantity: dto.quantity,
      unit_price_ht: dto.unitPriceHT,
      unit_price_ttc: dto.unitPriceTTC,
      vat_rate: dto.vatRate,
      total_price_ht: dto.totalPriceHT,
      total_price_ttc: dto.totalPriceTTC,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Convertir le modèle CreditNoteItem en CreditNoteItemPublicDTO
   */
  static creditNoteItemToPublicDTO(
    creditNoteItem: any
  ): CreditNoteItemPublicDTO {
    return {
      id: creditNoteItem.id,
      creditNoteId: creditNoteItem.creditNoteId,
      productId: creditNoteItem.productId,
      productName: creditNoteItem.productName,
      quantity: creditNoteItem.quantity,
      unitPriceHT: creditNoteItem.unitPriceHT,
      unitPriceTTC: creditNoteItem.unitPriceTTC,
      totalPriceHT: creditNoteItem.totalPriceHT,
      totalPriceTTC: creditNoteItem.totalPriceTTC,
      createdAt: creditNoteItem.createdAt,
      updatedAt: creditNoteItem.updatedAt,
    };
  }

  // ===== MAPPERS DES ADRESSES DE COMMANDE =====

  /**
   * Convertir le modèle OrderAddress en OrderAddressPublicDTO
   */
  static orderAddressToPublicDTO(orderAddress: any): OrderAddressPublicDTO {
    return {
      id: orderAddress.id,
      orderId: orderAddress.orderId,
      addressType: orderAddress.addressType,
      addressSnapshot: orderAddress.addressSnapshot,
      createdAt: orderAddress.createdAt,
      updatedAt: orderAddress.updatedAt,
    };
  }
}
