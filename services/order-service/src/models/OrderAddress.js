const { Pool } = require('pg');

class OrderAddress {
  constructor(data) {
    this.id = data.id;
    this.orderId = data.order_id;
    this.type = data.type; // 'shipping' or 'billing'
    this.addressSnapshot = data.address_snapshot;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Format address for display
  formatAddress() {
    if (!this.addressSnapshot) return '';
    
    const address = this.addressSnapshot;
    const parts = [];
    
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);
    
    return parts.join(', ');
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      type: this.type,
      addressSnapshot: this.addressSnapshot,
      formattedAddress: this.formatAddress(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Convert to database format
  toDbFormat() {
    return {
      id: this.id,
      order_id: this.orderId,
      type: this.type,
      address_snapshot: this.addressSnapshot,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }
}

module.exports = OrderAddress;
