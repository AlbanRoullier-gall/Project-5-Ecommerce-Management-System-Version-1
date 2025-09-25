import { OrderAddressData, OrderAddressDbRow } from "../types";

export default class OrderAddress {
  public id: number | null;
  public orderId: number | null;
  public type: "shipping" | "billing";
  public addressSnapshot: any;
  public createdAt: Date | null;
  public updatedAt: Date | null;

  constructor(data: OrderAddressData = {} as OrderAddressData) {
    this.id = data.id ?? null;
    this.orderId = data.orderId ?? null;
    this.type = data.type ?? "shipping";
    this.addressSnapshot = data.addressSnapshot ?? null;
    this.createdAt = data.createdAt ?? null;
    this.updatedAt = data.updatedAt ?? null;
  }

  // Format address for display
  formatAddress(): string {
    if (!this.addressSnapshot) return "";

    const address = this.addressSnapshot;
    const parts: string[] = [];

    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);

    return parts.join(", ");
  }

  // Convert to JSON for API responses
  toJSON(): any {
    return {
      id: this.id,
      orderId: this.orderId,
      type: this.type,
      addressSnapshot: this.addressSnapshot,
      formattedAddress: this.formatAddress(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Convert to database format
  toDbFormat(): OrderAddressDbRow {
    return {
      id: this.id!,
      order_id: this.orderId!,
      type: this.type,
      address_snapshot: this.addressSnapshot,
      created_at: this.createdAt!,
      updated_at: this.updatedAt!,
    };
  }

  /**
   * Create entity from database row
   * @param {Object} row Database row
   * @returns {OrderAddress} OrderAddress instance
   */
  static fromDbRow(row: OrderAddressDbRow): OrderAddress {
    return new OrderAddress({
      id: row.id,
      orderId: row.order_id,
      type: row.type as "shipping" | "billing",
      addressSnapshot: row.address_snapshot,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
