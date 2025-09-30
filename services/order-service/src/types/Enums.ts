/**
 * Enums for Order Service
 * Constrained values for type safety and consistency
 */

/**
 * Payment methods available in the system
 */
export enum PaymentMethod {
  CARD = "card",
  PAYPAL = "paypal",
  BANK_TRANSFER = "bank_transfer",
}

/**
 * Address types for orders
 */
export enum AddressType {
  BILLING = "billing",
  SHIPPING = "shipping",
}

/**
 * Order status values
 */
export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

/**
 * Credit note reasons
 */
export enum CreditNoteReason {
  RETURN = "return",
  DEFECT = "defect",
  CANCELLATION = "cancellation",
  DISCOUNT = "discount",
  OTHER = "other",
}
