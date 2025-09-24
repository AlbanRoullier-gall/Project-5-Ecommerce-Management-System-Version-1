const { Pool } = require('pg');
const OrderAddress = require('../models/OrderAddress');

class OrderAddressRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async getById(id) {
    const query = 'SELECT * FROM order_addresses WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new OrderAddress(result.rows[0]);
  }

  async listByOrder(orderId) {
    const query = 'SELECT * FROM order_addresses WHERE order_id = $1 ORDER BY created_at ASC';
    const result = await this.pool.query(query, [orderId]);
    
    return result.rows.map(row => new OrderAddress(row));
  }

  async listByType(orderId, type) {
    const query = 'SELECT * FROM order_addresses WHERE order_id = $1 AND type = $2 ORDER BY created_at ASC';
    const result = await this.pool.query(query, [orderId, type]);
    
    return result.rows.map(row => new OrderAddress(row));
  }

  async save(address) {
    const dbData = address.toDbFormat();
    const query = `
      INSERT INTO order_addresses (order_id, type, address_snapshot, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      dbData.order_id,
      dbData.type,
      JSON.stringify(dbData.address_snapshot),
      dbData.created_at || new Date(),
      dbData.updated_at || new Date()
    ];
    
    const result = await this.pool.query(query, values);
    return new OrderAddress(result.rows[0]);
  }

  async update(address) {
    const dbData = address.toDbFormat();
    const query = `
      UPDATE order_addresses 
      SET type = $2, address_snapshot = $3, updated_at = $4
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [
      dbData.id,
      dbData.type,
      JSON.stringify(dbData.address_snapshot),
      new Date()
    ];
    
    const result = await this.pool.query(query, values);
    return new OrderAddress(result.rows[0]);
  }

  async delete(address) {
    const query = 'DELETE FROM order_addresses WHERE id = $1';
    await this.pool.query(query, [address.id]);
  }

  async deleteById(id) {
    const query = 'DELETE FROM order_addresses WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  async deleteByOrder(orderId) {
    const query = 'DELETE FROM order_addresses WHERE order_id = $1';
    await this.pool.query(query, [orderId]);
  }
}

module.exports = OrderAddressRepository;
