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
import CreditNote, { CreditNoteData } from "../../models/CreditNote";
import { CreditNoteItemData } from "../../models/CreditNoteItem";

/**
 * Mapper des Commandes pour la transformation de données
 */
export class OrderMapper {
  /**
   * Arrondir un nombre à 2 décimales
   */
  private static roundTo2Decimals(value: number | null | undefined): number {
    if (value === null || value === undefined || isNaN(value)) {
      return 0;
    }
    return parseFloat(Number(value).toFixed(2));
  }

  /**
   * Convertir le modèle Order en OrderPublicDTO
   */
  static orderToPublicDTO(order: any): OrderPublicDTO {
    const totalAmountHT = this.roundTo2Decimals(order.totalAmountHT);
    const totalAmountTTC = this.roundTo2Decimals(order.totalAmountTTC);
    const totalVAT = this.roundTo2Decimals(totalAmountTTC - totalAmountHT);

    return {
      id: order.id,
      customerId: order.customerId,
      customerFirstName: order.customerFirstName,
      customerLastName: order.customerLastName,
      customerEmail: order.customerEmail,
      customerPhoneNumber: order.customerPhoneNumber,
      totalAmountHT,
      totalAmountTTC,
      totalVAT,
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      delivered: order.delivered ?? false,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  // ===== MAPPERS DES ARTICLES DE COMMANDE =====

  /**
   * Convertir le modèle OrderItem en OrderItemPublicDTO
   * Harmonisé avec CartItemPublicDTO
   * Structure simplifiée grâce à BaseItemDTO
   */
  static orderItemToPublicDTO(orderItem: any): OrderItemPublicDTO {
    return {
      id: orderItem.id, // Spécifique à Order (auto-increment)
      orderId: orderItem.orderId, // Spécifique à Order
      productId: orderItem.productId,
      productName: orderItem.productName || "",
      description: orderItem.description ?? null,
      imageUrl: orderItem.imageUrl ?? null,
      quantity: orderItem.quantity,
      vatRate: orderItem.vatRate || 21,
      unitPriceHT: this.roundTo2Decimals(orderItem.unitPriceHT),
      unitPriceTTC: this.roundTo2Decimals(orderItem.unitPriceTTC),
      totalPriceHT: this.roundTo2Decimals(orderItem.totalPriceHT),
      totalPriceTTC: this.roundTo2Decimals(orderItem.totalPriceTTC),
      createdAt: orderItem.createdAt,
      updatedAt: orderItem.updatedAt, // Spécifique à Order
    };
  }

  // ===== MAPPERS DES AVOIRS =====

  /**
   * Convertir CreditNoteCreateDTO en CreditNoteData
   * Si items est fourni, les totaux sont calculés automatiquement à partir des items
   * Sinon, les totaux doivent être fournis dans le DTO
   */
  static creditNoteCreateDTOToCreditNoteData(
    dto: CreditNoteCreateDTO
  ): CreditNoteData {
    let totalAmountHT: number;
    let totalAmountTTC: number;

    // Si des items sont fournis, calculer les totaux via le modèle CreditNote
    if (dto.items && dto.items.length > 0) {
      const totals = CreditNote.calculateTotalsFromItems(dto.items);
      totalAmountHT = totals.totalHT;
      totalAmountTTC = totals.totalTTC;
    } else {
      // Sinon, utiliser les totaux fournis
      if (!dto.totalAmountHT || !dto.totalAmountTTC) {
        throw new Error(
          "totalAmountHT and totalAmountTTC are required when items are not provided"
        );
      }
      totalAmountHT = dto.totalAmountHT;
      totalAmountTTC = dto.totalAmountTTC;
    }

    return {
      id: 0, // Sera défini par la base de données
      customer_id: dto.customerId,
      order_id: dto.orderId,
      total_amount_ht: totalAmountHT,
      total_amount_ttc: totalAmountTTC,
      reason: dto.reason,
      description: dto.description ?? null,
      issue_date: dto.issueDate ? new Date(dto.issueDate) : null,
      payment_method: dto.paymentMethod || "",
      notes: dto.notes ?? null,
      status: "pending",
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Convertir le modèle CreditNote en CreditNotePublicDTO
   */
  static creditNoteToPublicDTO(creditNote: any): CreditNotePublicDTO {
    const totalAmountHT = this.roundTo2Decimals(creditNote.totalAmountHT);
    const totalAmountTTC = this.roundTo2Decimals(creditNote.totalAmountTTC);
    const totalVAT = this.roundTo2Decimals(totalAmountTTC - totalAmountHT);

    return {
      id: creditNote.id,
      customerId: creditNote.customerId,
      orderId: creditNote.orderId,
      totalAmountHT,
      totalAmountTTC,
      totalVAT,
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
      unitPriceHT: this.roundTo2Decimals(creditNoteItem.unitPriceHT),
      unitPriceTTC: this.roundTo2Decimals(creditNoteItem.unitPriceTTC),
      totalPriceHT: this.roundTo2Decimals(creditNoteItem.totalPriceHT),
      totalPriceTTC: this.roundTo2Decimals(creditNoteItem.totalPriceTTC),
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
      firstName: orderAddress.firstName,
      lastName: orderAddress.lastName,
      address: orderAddress.address,
      postalCode: orderAddress.postalCode,
      city: orderAddress.city,
      countryName: orderAddress.countryName,
      phone: orderAddress.phone,
      createdAt: orderAddress.createdAt,
      updatedAt: orderAddress.updatedAt,
    };
  }
}
