/**
 * Order Mapper
 * Data transformation between DTOs and models
 *
 * Architecture : Mapper pattern
 * - DTO to Model conversion
 * - Model to DTO conversion
 * - Type safety and validation
 */

import {
  OrderCreateDTO,
  OrderUpdateDTO,
  OrderPublicDTO,
  OrderItemCreateDTO,
  OrderItemUpdateDTO,
  OrderItemPublicDTO,
  CreditNoteCreateDTO,
  CreditNoteUpdateDTO,
  CreditNotePublicDTO,
  CreditNoteItemCreateDTO,
  CreditNoteItemUpdateDTO,
  CreditNoteItemPublicDTO,
} from "../dto";
import {
  OrderAddressCreateDTO,
  OrderAddressUpdateDTO,
  OrderAddressPublicDTO,
} from "../dto";
import { OrderData } from "../../models/Order";
import { OrderItemData } from "../../models/OrderItem";
import { CreditNoteData } from "../../models/CreditNote";
import { CreditNoteItemData } from "../../models/CreditNoteItem";
import { OrderAddressData } from "../../models/OrderAddress";

/**
 * Order Mapper for data transformation
 */
export class OrderMapper {
  /**
   * Convert OrderCreateDTO to OrderData
   */
  static orderCreateDTOToOrderData(dto: OrderCreateDTO): Partial<OrderData> {
    return {
      customer_id: dto.customerId,
      customer_snapshot: dto.customerSnapshot || null,
      total_amount_ht: dto.totalAmountHT,
      total_amount_ttc: dto.totalAmountTTC,
      payment_method: dto.paymentMethod,
      notes: dto.notes || "",
    };
  }

  /**
   * Convert OrderUpdateDTO to OrderData
   */
  static orderUpdateDTOToOrderData(dto: OrderUpdateDTO): Partial<OrderData> {
    const data: Partial<OrderData> = {};
    if (dto.customerSnapshot !== undefined)
      data.customer_snapshot = dto.customerSnapshot;
    if (dto.totalAmountHT !== undefined)
      data.total_amount_ht = dto.totalAmountHT;
    if (dto.totalAmountTTC !== undefined)
      data.total_amount_ttc = dto.totalAmountTTC;
    if (dto.paymentMethod !== undefined)
      data.payment_method = dto.paymentMethod;
    if (dto.notes !== undefined) data.notes = dto.notes;
    return data;
  }

  /**
   * Convert Order model to OrderPublicDTO
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
      customerFirstName: order.customerFirstName,
      customerLastName: order.customerLastName,
      customerEmail: order.customerEmail,
    };
  }

  // ===== ORDER ITEM MAPPERS =====

  /**
   * Convert OrderItemCreateDTO to OrderItemData
   */
  static orderItemCreateDTOToOrderItemData(
    dto: OrderItemCreateDTO
  ): OrderItemData {
    return {
      id: 0, // Will be set by the database
      order_id: dto.orderId,
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
   * Convert OrderItemUpdateDTO to OrderItemData
   */
  static orderItemUpdateDTOToOrderItemData(
    dto: OrderItemUpdateDTO
  ): Partial<OrderItemData> {
    const data: Partial<OrderItemData> = {};
    if (dto.productId !== undefined) data.product_id = dto.productId;
    if (dto.productName !== undefined) data.product_name = dto.productName;
    if (dto.quantity !== undefined) data.quantity = dto.quantity;
    if (dto.unitPriceHT !== undefined) data.unit_price_ht = dto.unitPriceHT;
    if (dto.unitPriceTTC !== undefined) data.unit_price_ttc = dto.unitPriceTTC;
    if (dto.vatRate !== undefined) data.vat_rate = dto.vatRate;
    if (dto.totalPriceHT !== undefined) data.total_price_ht = dto.totalPriceHT;
    if (dto.totalPriceTTC !== undefined)
      data.total_price_ttc = dto.totalPriceTTC;
    return data;
  }

  /**
   * Convert OrderItem model to OrderItemPublicDTO
   */
  static orderItemToPublicDTO(orderItem: any): OrderItemPublicDTO {
    return {
      id: orderItem.id,
      orderId: orderItem.orderId,
      productId: orderItem.productId,
      productName: orderItem.productName || "Produit",
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

  // ===== CREDIT NOTE MAPPERS =====

  /**
   * Convert CreditNoteCreateDTO to CreditNoteData
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
      description: dto.description || null,
      payment_method: dto.paymentMethod,
      notes: dto.notes || null,
    };
  }

  /**
   * Convert CreditNoteUpdateDTO to CreditNoteData
   */
  static creditNoteUpdateDTOToCreditNoteData(
    dto: CreditNoteUpdateDTO
  ): Partial<CreditNoteData> {
    const data: Partial<CreditNoteData> = {};
    if (dto.totalAmountHT !== undefined)
      data.total_amount_ht = dto.totalAmountHT;
    if (dto.totalAmountTTC !== undefined)
      data.total_amount_ttc = dto.totalAmountTTC;
    if (dto.reason !== undefined) data.reason = dto.reason;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.paymentMethod !== undefined)
      data.payment_method = dto.paymentMethod;
    if (dto.notes !== undefined) data.notes = dto.notes;
    return data;
  }

  /**
   * Convert CreditNote model to CreditNotePublicDTO
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
      createdAt: creditNote.createdAt,
      updatedAt: creditNote.updatedAt,
    };
  }

  // ===== CREDIT NOTE ITEM MAPPERS =====

  /**
   * Convert CreditNoteItemCreateDTO to CreditNoteItemData
   */
  static creditNoteItemCreateDTOToCreditNoteItemData(
    dto: CreditNoteItemCreateDTO
  ): Partial<CreditNoteItemData> {
    return {
      credit_note_id: dto.creditNoteId,
      product_id: dto.productId,
      quantity: dto.quantity,
      unit_price_ht: dto.unitPriceHT,
      unit_price_ttc: dto.unitPriceTTC,
      total_price_ht: dto.totalPriceHT,
      total_price_ttc: dto.totalPriceTTC,
    };
  }

  /**
   * Convert CreditNoteItemUpdateDTO to CreditNoteItemData
   */
  static creditNoteItemUpdateDTOToCreditNoteItemData(
    dto: CreditNoteItemUpdateDTO
  ): Partial<CreditNoteItemData> {
    const data: Partial<CreditNoteItemData> = {};
    if (dto.quantity !== undefined) data.quantity = dto.quantity;
    if (dto.unitPriceHT !== undefined) data.unit_price_ht = dto.unitPriceHT;
    if (dto.unitPriceTTC !== undefined) data.unit_price_ttc = dto.unitPriceTTC;
    if (dto.totalPriceHT !== undefined) data.total_price_ht = dto.totalPriceHT;
    if (dto.totalPriceTTC !== undefined)
      data.total_price_ttc = dto.totalPriceTTC;
    return data;
  }

  /**
   * Convert CreditNoteItem model to CreditNoteItemPublicDTO
   */
  static creditNoteItemToPublicDTO(
    creditNoteItem: any
  ): CreditNoteItemPublicDTO {
    return {
      id: creditNoteItem.id,
      creditNoteId: creditNoteItem.creditNoteId,
      productId: creditNoteItem.productId,
      quantity: creditNoteItem.quantity,
      unitPriceHT: creditNoteItem.unitPriceHT,
      unitPriceTTC: creditNoteItem.unitPriceTTC,
      vatRate: creditNoteItem.vatRate || 0,
      totalPriceHT: creditNoteItem.totalPriceHT,
      totalPriceTTC: creditNoteItem.totalPriceTTC,
      createdAt: creditNoteItem.createdAt,
      updatedAt: creditNoteItem.updatedAt,
    };
  }

  // ===== ORDER ADDRESS MAPPERS =====

  /**
   * Convert OrderAddressCreateDTO to OrderAddressData
   */
  static orderAddressCreateDTOToOrderAddressData(
    dto: OrderAddressCreateDTO
  ): Partial<OrderAddressData> {
    return {
      order_id: dto.orderId,
      address_type: dto.addressType,
      address_snapshot: dto.addressSnapshot,
    };
  }

  /**
   * Convert OrderAddressUpdateDTO to OrderAddressData
   */
  static orderAddressUpdateDTOToOrderAddressData(
    dto: OrderAddressUpdateDTO
  ): Partial<OrderAddressData> {
    const data: Partial<OrderAddressData> = {};
    if (dto.addressType !== undefined) data.address_type = dto.addressType;
    if (dto.addressSnapshot !== undefined)
      data.address_snapshot = dto.addressSnapshot;
    return data;
  }

  /**
   * Convert OrderAddress model to OrderAddressPublicDTO
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
