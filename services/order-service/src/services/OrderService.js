/**
 * OrderService
 * Business logic layer for order management
 */
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const CreditNote = require("../models/CreditNote");
const CreditNoteItem = require("../models/CreditNoteItem");
const OrderRepository = require("../repositories/OrderRepository");
const OrderItemRepository = require("../repositories/OrderItemRepository");
const CreditNoteRepository = require("../repositories/CreditNoteRepository");
const CreditNoteItemRepository = require("../repositories/CreditNoteItemRepository");

class OrderService {
  constructor(pool) {
    this.orderRepository = new OrderRepository(pool);
    this.orderItemRepository = new OrderItemRepository(pool);
    this.creditNoteRepository = new CreditNoteRepository(pool);
    this.creditNoteItemRepository = new CreditNoteItemRepository(pool);
  }

  // Order management methods

  /**
   * Create a new order
   * @param {Object} data Order data
   * @returns {Promise<Order>} Created order
   */
  async createOrder(data) {
    try {
      // Create order entity
      const order = new Order(data);

      // Save order
      const savedOrder = await this.orderRepository.save(order);

      // If items are provided, add them to the order
      if (data.items && Array.isArray(data.items)) {
        for (const itemData of data.items) {
          await this.addOrderItem(savedOrder.id, itemData);
        }

        // Recalculate totals
        await this.recalculateOrderTotals(savedOrder.id);
      }

      return await this.orderRepository.getByIdWithJoins(savedOrder.id);
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  /**
   * Update order
   * @param {number} id Order ID
   * @param {Object} data Update data
   * @returns {Promise<Order>} Updated order
   */
  async updateOrder(id, data) {
    try {
      const order = await this.orderRepository.getById(id);
      if (!order) {
        throw new Error("Order not found");
      }

      // Update order entity
      Object.assign(order, data);
      order.id = id; // Ensure ID is preserved

      const updatedOrder = await this.orderRepository.update(order);

      // If items are being updated, recalculate totals
      if (data.items !== undefined) {
        await this.recalculateOrderTotals(id);
      }

      return await this.orderRepository.getByIdWithJoins(id);
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  }

  /**
   * Delete order
   * @param {number} id Order ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteOrder(id) {
    try {
      const order = await this.orderRepository.getById(id);
      if (!order) {
        throw new Error("Order not found");
      }

      // Delete all order items first
      await this.orderItemRepository.deleteAllByOrder(id);

      // Delete order
      return await this.orderRepository.delete(order);
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  }

  /**
   * Get order by ID
   * @param {number} id Order ID
   * @returns {Promise<Order|null>} Order or null if not found
   */
  async getOrderById(id) {
    try {
      return await this.orderRepository.getByIdWithJoins(id);
    } catch (error) {
      console.error("Error getting order by ID:", error);
      throw error;
    }
  }

  /**
   * List orders with pagination and search
   * @param {Object} options Pagination and search options
   * @returns {Promise<Object>} Orders and pagination info
   */
  async listOrders(options = {}) {
    try {
      return await this.orderRepository.listAll(options);
    } catch (error) {
      console.error("Error listing orders:", error);
      throw error;
    }
  }

  /**
   * List orders by customer
   * @param {number} customerId Customer ID
   * @returns {Promise<Order[]>} Array of orders
   */
  async listOrdersByCustomer(customerId) {
    try {
      return await this.orderRepository.listByCustomer(customerId);
    } catch (error) {
      console.error("Error listing orders by customer:", error);
      throw error;
    }
  }

  /**
   * Get order statistics
   * @param {Object} options Statistics options
   * @returns {Promise<Object>} Order statistics
   */
  async getOrderStatistics(options = {}) {
    try {
      return await this.orderRepository.getStatistics(options);
    } catch (error) {
      console.error("Error getting order statistics:", error);
      throw error;
    }
  }

  // Order item management methods

  /**
   * Add item to order
   * @param {number} orderId Order ID
   * @param {Object} itemData Item data
   * @returns {Promise<OrderItem>} Created order item
   */
  async addOrderItem(orderId, itemData) {
    try {
      // Verify order exists
      const order = await this.orderRepository.getById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      // Create order item entity
      const item = new OrderItem({
        ...itemData,
        orderId,
      });

      // Calculate item totals
      item.calculateItemTotal();

      return await this.orderItemRepository.save(item);
    } catch (error) {
      console.error("Error adding order item:", error);
      throw error;
    }
  }

  /**
   * Update order item
   * @param {number} itemId Item ID
   * @param {Object} itemData Item data
   * @returns {Promise<OrderItem>} Updated order item
   */
  async updateOrderItem(itemId, itemData) {
    try {
      const item = await this.orderItemRepository.getById(itemId);
      if (!item) {
        throw new Error("Order item not found");
      }

      // Update item entity
      Object.assign(item, itemData);
      item.id = itemId; // Ensure ID is preserved

      // Recalculate item totals
      item.calculateItemTotal();

      const updatedItem = await this.orderItemRepository.update(item);

      // Recalculate order totals
      await this.recalculateOrderTotals(item.orderId);

      return updatedItem;
    } catch (error) {
      console.error("Error updating order item:", error);
      throw error;
    }
  }

  /**
   * Delete order item
   * @param {number} itemId Item ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteOrderItem(itemId) {
    try {
      const item = await this.orderItemRepository.getById(itemId);
      if (!item) {
        throw new Error("Order item not found");
      }

      const orderId = item.orderId;
      const deleted = await this.orderItemRepository.delete(item);

      if (deleted) {
        // Recalculate order totals
        await this.recalculateOrderTotals(orderId);
      }

      return deleted;
    } catch (error) {
      console.error("Error deleting order item:", error);
      throw error;
    }
  }

  /**
   * List order items
   * @param {number} orderId Order ID
   * @returns {Promise<OrderItem[]>} Array of order items
   */
  async listOrderItems(orderId) {
    try {
      return await this.orderItemRepository.listByOrder(orderId);
    } catch (error) {
      console.error("Error listing order items:", error);
      throw error;
    }
  }

  /**
   * Recalculate order totals
   * @param {number} orderId Order ID
   * @returns {Promise<Object>} Updated totals
   */
  async recalculateOrderTotals(orderId) {
    try {
      const totals = await this.orderItemRepository.getOrderTotals(orderId);

      // Update order with new totals
      const order = await this.orderRepository.getById(orderId);
      if (order) {
        order.totalAmountHT = totals.totalHT;
        order.totalAmountTTC = totals.totalTTC;
        await this.orderRepository.update(order);
      }

      return totals;
    } catch (error) {
      console.error("Error recalculating order totals:", error);
      throw error;
    }
  }

  // Credit note management methods

  /**
   * Create a new credit note
   * @param {Object} data Credit note data
   * @returns {Promise<CreditNote>} Created credit note
   */
  async createCreditNote(data) {
    try {
      // Create credit note entity
      const creditNote = new CreditNote(data);

      // Save credit note
      const savedCreditNote = await this.creditNoteRepository.save(creditNote);

      // If items are provided, add them to the credit note
      if (data.items && Array.isArray(data.items)) {
        for (const itemData of data.items) {
          await this.addCreditNoteItem(savedCreditNote.id, itemData);
        }

        // Recalculate totals
        await this.recalculateCreditNoteTotals(savedCreditNote.id);
      }

      return await this.creditNoteRepository.getById(savedCreditNote.id);
    } catch (error) {
      console.error("Error creating credit note:", error);
      throw error;
    }
  }

  /**
   * Update credit note
   * @param {number} id Credit note ID
   * @param {Object} data Update data
   * @returns {Promise<CreditNote>} Updated credit note
   */
  async updateCreditNote(id, data) {
    try {
      const creditNote = await this.creditNoteRepository.getById(id);
      if (!creditNote) {
        throw new Error("Credit note not found");
      }

      // Update credit note entity
      Object.assign(creditNote, data);
      creditNote.id = id; // Ensure ID is preserved

      const updatedCreditNote = await this.creditNoteRepository.update(
        creditNote
      );

      // If items are being updated, recalculate totals
      if (data.items !== undefined) {
        await this.recalculateCreditNoteTotals(id);
      }

      return await this.creditNoteRepository.getById(id);
    } catch (error) {
      console.error("Error updating credit note:", error);
      throw error;
    }
  }

  /**
   * Delete credit note
   * @param {number} id Credit note ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteCreditNote(id) {
    try {
      const creditNote = await this.creditNoteRepository.getById(id);
      if (!creditNote) {
        throw new Error("Credit note not found");
      }

      // Delete all credit note items first
      await this.creditNoteItemRepository.deleteAllByCreditNote(id);

      // Delete credit note
      return await this.creditNoteRepository.delete(creditNote);
    } catch (error) {
      console.error("Error deleting credit note:", error);
      throw error;
    }
  }

  /**
   * Get credit note by ID
   * @param {number} id Credit note ID
   * @returns {Promise<CreditNote|null>} Credit note or null if not found
   */
  async getCreditNoteById(id) {
    try {
      return await this.creditNoteRepository.getById(id);
    } catch (error) {
      console.error("Error getting credit note by ID:", error);
      throw error;
    }
  }

  /**
   * List credit notes with pagination and search
   * @param {Object} options Pagination and search options
   * @returns {Promise<Object>} Credit notes and pagination info
   */
  async listCreditNotes(options = {}) {
    try {
      return await this.creditNoteRepository.listAll(options);
    } catch (error) {
      console.error("Error listing credit notes:", error);
      throw error;
    }
  }

  /**
   * List credit notes by customer
   * @param {number} customerId Customer ID
   * @returns {Promise<CreditNote[]>} Array of credit notes
   */
  async listCreditNotesByCustomer(customerId) {
    try {
      return await this.creditNoteRepository.listByCustomer(customerId);
    } catch (error) {
      console.error("Error listing credit notes by customer:", error);
      throw error;
    }
  }

  /**
   * List credit notes by order
   * @param {number} orderId Order ID
   * @returns {Promise<CreditNote[]>} Array of credit notes
   */
  async listCreditNotesByOrder(orderId) {
    try {
      return await this.creditNoteRepository.listByOrder(orderId);
    } catch (error) {
      console.error("Error listing credit notes by order:", error);
      throw error;
    }
  }

  /**
   * Get credit note statistics
   * @param {Object} options Statistics options
   * @returns {Promise<Object>} Credit note statistics
   */
  async getCreditNoteStatistics(options = {}) {
    try {
      return await this.creditNoteRepository.getStatistics(options);
    } catch (error) {
      console.error("Error getting credit note statistics:", error);
      throw error;
    }
  }

  // Credit note item management methods

  /**
   * Add item to credit note
   * @param {number} creditNoteId Credit note ID
   * @param {Object} itemData Item data
   * @returns {Promise<CreditNoteItem>} Created credit note item
   */
  async addCreditNoteItem(creditNoteId, itemData) {
    try {
      // Verify credit note exists
      const creditNote = await this.creditNoteRepository.getById(creditNoteId);
      if (!creditNote) {
        throw new Error("Credit note not found");
      }

      // Create credit note item entity
      const item = new CreditNoteItem({
        ...itemData,
        creditNoteId,
      });

      // Calculate item totals
      item.calculateItemTotal();

      return await this.creditNoteItemRepository.save(item);
    } catch (error) {
      console.error("Error adding credit note item:", error);
      throw error;
    }
  }

  /**
   * Update credit note item
   * @param {number} itemId Item ID
   * @param {Object} itemData Item data
   * @returns {Promise<CreditNoteItem>} Updated credit note item
   */
  async updateCreditNoteItem(itemId, itemData) {
    try {
      const item = await this.creditNoteItemRepository.getById(itemId);
      if (!item) {
        throw new Error("Credit note item not found");
      }

      // Update item entity
      Object.assign(item, itemData);
      item.id = itemId; // Ensure ID is preserved

      // Recalculate item totals
      item.calculateItemTotal();

      const updatedItem = await this.creditNoteItemRepository.update(item);

      // Recalculate credit note totals
      await this.recalculateCreditNoteTotals(item.creditNoteId);

      return updatedItem;
    } catch (error) {
      console.error("Error updating credit note item:", error);
      throw error;
    }
  }

  /**
   * Delete credit note item
   * @param {number} itemId Item ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteCreditNoteItem(itemId) {
    try {
      const item = await this.creditNoteItemRepository.getById(itemId);
      if (!item) {
        throw new Error("Credit note item not found");
      }

      const creditNoteId = item.creditNoteId;
      const deleted = await this.creditNoteItemRepository.delete(item);

      if (deleted) {
        // Recalculate credit note totals
        await this.recalculateCreditNoteTotals(creditNoteId);
      }

      return deleted;
    } catch (error) {
      console.error("Error deleting credit note item:", error);
      throw error;
    }
  }

  /**
   * List credit note items
   * @param {number} creditNoteId Credit note ID
   * @returns {Promise<CreditNoteItem[]>} Array of credit note items
   */
  async listCreditNoteItems(creditNoteId) {
    try {
      return await this.creditNoteItemRepository.listByCreditNote(creditNoteId);
    } catch (error) {
      console.error("Error listing credit note items:", error);
      throw error;
    }
  }

  /**
   * Recalculate credit note totals
   * @param {number} creditNoteId Credit note ID
   * @returns {Promise<Object>} Updated totals
   */
  async recalculateCreditNoteTotals(creditNoteId) {
    try {
      const totals = await this.creditNoteItemRepository.getCreditNoteTotals(
        creditNoteId
      );

      // Update credit note with new totals
      const creditNote = await this.creditNoteRepository.getById(creditNoteId);
      if (creditNote) {
        creditNote.totalAmountHT = totals.totalHT;
        creditNote.totalAmountTTC = totals.totalTTC;
        await this.creditNoteRepository.update(creditNote);
      }

      return totals;
    } catch (error) {
      console.error("Error recalculating credit note totals:", error);
      throw error;
    }
  }
}

module.exports = OrderService;
