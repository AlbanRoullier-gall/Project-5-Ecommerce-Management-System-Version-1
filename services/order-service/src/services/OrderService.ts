/**
 * OrderService
 * Logique métier pour la gestion des commandes
 *
 * Architecture : Service pattern
 * - Orchestration des repositories
 * - Logique métier des commandes
 * - Validation et transformation des données
 */
import { Pool } from "pg";
import Order, { OrderData } from "../models/Order";
import OrderItem, { OrderItemData } from "../models/OrderItem";
import CreditNote, { CreditNoteData } from "../models/CreditNote";
import CreditNoteItem, { CreditNoteItemData } from "../models/CreditNoteItem";
import OrderAddress, { OrderAddressData } from "../models/OrderAddress";
import OrderRepository, {
  OrderListOptions,
} from "../repositories/OrderRepository";
import OrderItemRepository from "../repositories/OrderItemRepository";
import CreditNoteRepository from "../repositories/CreditNoteRepository";
import CreditNoteItemRepository from "../repositories/CreditNoteItemRepository";
import OrderAddressRepository from "../repositories/OrderAddressRepository";

export default class OrderService {
  private orderRepository: OrderRepository;
  private orderItemRepository: OrderItemRepository;
  private creditNoteRepository: CreditNoteRepository;
  private creditNoteItemRepository: CreditNoteItemRepository;
  private orderAddressRepository: OrderAddressRepository;

  constructor(pool: Pool) {
    this.orderRepository = new OrderRepository(pool);
    this.orderItemRepository = new OrderItemRepository(pool);
    this.creditNoteRepository = new CreditNoteRepository(pool);
    this.creditNoteItemRepository = new CreditNoteItemRepository(pool);
    this.orderAddressRepository = new OrderAddressRepository(pool);
  }

  // ===== CRÉATION DE COMMANDES =====

  /**
   * Créer une nouvelle commande
   * @param {Partial<OrderData>} orderData Données de la commande
   * @returns {Promise<Order>} Commande créée
   */
  async createOrder(orderData: Partial<OrderData>): Promise<Order> {
    try {
      // Validation des données obligatoires
      if (!orderData.customer_id) {
        throw new Error("Customer ID is required");
      }

      if (
        orderData.total_amount_ht === undefined ||
        orderData.total_amount_ht < 0
      ) {
        throw new Error("Total amount HT must be non-negative");
      }

      if (
        orderData.total_amount_ttc === undefined ||
        orderData.total_amount_ttc < 0
      ) {
        throw new Error("Total amount TTC must be non-negative");
      }

      if (
        !orderData.payment_method ||
        orderData.payment_method.trim().length === 0
      ) {
        throw new Error("Payment method is required");
      }

      // Créer la commande
      const order = await this.orderRepository.createOrder({
        id: 0, // Will be set by the database
        customer_id: orderData.customer_id,
        customer_snapshot: orderData.customer_snapshot || null,
        total_amount_ht: orderData.total_amount_ht,
        total_amount_ttc: orderData.total_amount_ttc,
        payment_method: orderData.payment_method,
        notes: orderData.notes || "",
        created_at: new Date(),
        updated_at: new Date(),
      });

      return order;
    } catch (error: any) {
      console.error("Error creating order:", error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  // ===== RÉCUPÉRATION DE COMMANDES =====

  /**
   * Récupérer une commande par ID
   * @param {number} id ID de la commande
   * @returns {Promise<Order | null>} Commande trouvée ou null
   */
  async getOrderById(id: number): Promise<Order | null> {
    try {
      if (!id || id <= 0) {
        throw new Error("Invalid order ID");
      }

      return await this.orderRepository.getOrderById(id);
    } catch (error: any) {
      console.error("Error getting order by ID:", error);
      throw new Error(`Failed to retrieve order: ${error.message}`);
    }
  }

  /**
   * Récupérer une commande par ID avec données jointes
   * @param {number} id ID de la commande
   * @returns {Promise<Order | null>} Commande avec données jointes ou null
   */
  async getOrderByIdWithJoins(id: number): Promise<Order | null> {
    try {
      if (!id || id <= 0) {
        throw new Error("Invalid order ID");
      }

      return await this.orderRepository.getOrderByIdWithJoins(id);
    } catch (error: any) {
      console.error("Error getting order by ID with joins:", error);
      throw new Error(`Failed to retrieve order: ${error.message}`);
    }
  }

  // ===== MISE À JOUR DE COMMANDES =====

  /**
   * Mettre à jour une commande
   * @param {number} id ID de la commande
   * @param {Partial<OrderData>} orderData Données à mettre à jour
   * @returns {Promise<Order | null>} Commande mise à jour ou null
   */
  async updateOrder(
    id: number,
    orderData: Partial<OrderData>
  ): Promise<Order | null> {
    try {
      if (!id || id <= 0) {
        throw new Error("Invalid order ID");
      }

      // Vérifier que la commande existe
      const existingOrder = await this.orderRepository.getOrderById(id);
      if (!existingOrder) {
        throw new Error("Order not found");
      }

      // Validation des données
      if (
        orderData.total_amount_ht !== undefined &&
        orderData.total_amount_ht < 0
      ) {
        throw new Error("Total amount HT must be non-negative");
      }

      if (
        orderData.total_amount_ttc !== undefined &&
        orderData.total_amount_ttc < 0
      ) {
        throw new Error("Total amount TTC must be non-negative");
      }

      if (
        orderData.payment_method !== undefined &&
        orderData.payment_method !== null &&
        orderData.payment_method.trim().length === 0
      ) {
        throw new Error("Payment method cannot be empty");
      }

      return await this.orderRepository.updateOrder(id, orderData);
    } catch (error: any) {
      console.error("Error updating order:", error);
      throw new Error(`Failed to update order: ${error.message}`);
    }
  }

  // ===== SUPPRESSION DE COMMANDES =====

  /**
   * Supprimer une commande
   * @param {number} id ID de la commande
   * @returns {Promise<boolean>} True si supprimée, false sinon
   */
  async deleteOrder(id: number): Promise<boolean> {
    try {
      if (!id || id <= 0) {
        throw new Error("Invalid order ID");
      }

      // Vérifier que la commande existe
      const existingOrder = await this.orderRepository.getOrderById(id);
      if (!existingOrder) {
        throw new Error("Order not found");
      }

      return await this.orderRepository.deleteOrder(id);
    } catch (error: any) {
      console.error("Error deleting order:", error);
      throw new Error(`Failed to delete order: ${error.message}`);
    }
  }

  // ===== LISTAGE DE COMMANDES =====

  /**
   * Lister les commandes avec pagination
   * @param {OrderListOptions} options Options de filtrage et pagination
   * @returns {Promise<{orders: Order[], pagination: any}>} Liste des commandes et pagination
   */
  async listOrders(
    options: OrderListOptions = {}
  ): Promise<{ orders: Order[]; pagination: any }> {
    try {
      return await this.orderRepository.listOrders(options);
    } catch (error: any) {
      console.error("Error listing orders:", error);
      throw new Error(`Failed to retrieve orders: ${error.message}`);
    }
  }

  // ===== STATISTIQUES DE COMMANDES =====

  /**
   * Obtenir les statistiques des commandes
   * @param {OrderListOptions} options Options de filtrage
   * @returns {Promise<any>} Statistiques des commandes
   */
  async getOrderStatistics(options: OrderListOptions = {}): Promise<any> {
    try {
      // Cette méthode pourrait être implémentée pour calculer des statistiques
      // Pour l'instant, retournons des données de base
      const { orders } = await this.listOrders(options);

      const totalOrders = orders.length;
      const totalAmount = orders.reduce(
        (sum, order) => sum + order.totalAmountTTC,
        0
      );
      const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

      return {
        totalOrders,
        totalAmount,
        averageOrderValue,
        orders: orders.map((order) => ({
          id: order.id,
          customerId: order.customerId,
          totalAmountTTC: order.totalAmountTTC,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
        })),
      };
    } catch (error: any) {
      console.error("Error getting order statistics:", error);
      throw new Error(`Failed to retrieve order statistics: ${error.message}`);
    }
  }

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Vérifier si une commande existe
   * @param {number} id ID de la commande
   * @returns {Promise<boolean>} True si existe, false sinon
   */
  async orderExists(id: number): Promise<boolean> {
    try {
      return await this.orderRepository.orderExists(id);
    } catch (error: any) {
      console.error("Error checking if order exists:", error);
      return false;
    }
  }

  // ===== GESTION DES ARTICLES DE COMMANDE =====

  /**
   * Créer un article de commande
   */
  async createOrderItem(orderItemData: OrderItemData): Promise<OrderItem> {
    return await this.orderItemRepository.createOrderItem(orderItemData);
  }

  /**
   * Récupérer un article de commande par ID
   */
  async getOrderItemById(id: number): Promise<OrderItem | null> {
    return await this.orderItemRepository.getOrderItemById(id);
  }

  /**
   * Mettre à jour un article de commande
   */
  async updateOrderItem(
    id: number,
    orderItemData: Partial<OrderItemData>
  ): Promise<OrderItem> {
    const result = await this.orderItemRepository.updateOrderItem(
      id,
      orderItemData
    );
    if (!result) {
      throw new Error("Order item not found");
    }
    return result;
  }

  /**
   * Supprimer un article de commande
   */
  async deleteOrderItem(id: number): Promise<boolean> {
    return await this.orderItemRepository.deleteOrderItem(id);
  }

  /**
   * Récupérer les articles d'une commande
   */
  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return await this.orderItemRepository.getOrderItemsByOrderId(orderId);
  }

  // ===== GESTION DES AVOIRS =====

  /**
   * Créer un avoir
   */
  async createCreditNote(creditNoteData: CreditNoteData): Promise<CreditNote> {
    return await this.creditNoteRepository.createCreditNote(creditNoteData);
  }

  /**
   * Lister les avoirs avec pagination/filtre (admin)
   */
  async listCreditNotes(
    options: OrderListOptions = {}
  ): Promise<{ creditNotes: CreditNote[]; pagination: any }> {
    return await this.creditNoteRepository.listAll(options);
  }

  /**
   * Récupérer un avoir par ID
   */
  async getCreditNoteById(id: number): Promise<CreditNote | null> {
    return await this.creditNoteRepository.getCreditNoteById(id);
  }

  /**
   * Mettre à jour un avoir
   */
  async updateCreditNote(
    id: number,
    creditNoteData: Partial<CreditNoteData>
  ): Promise<CreditNote> {
    return await this.creditNoteRepository.updateCreditNote(id, creditNoteData);
  }

  /**
   * Supprimer un avoir
   */
  async deleteCreditNote(id: number): Promise<boolean> {
    return await this.creditNoteRepository.deleteCreditNote(id);
  }

  /**
   * Récupérer les avoirs d'un client
   */
  async getCreditNotesByCustomerId(customerId: number): Promise<CreditNote[]> {
    return await this.creditNoteRepository.getCreditNotesByCustomerId(
      customerId
    );
  }

  // ===== GESTION DES ARTICLES D'AVOIRS =====

  /**
   * Créer un article d'avoir
   */
  async createCreditNoteItem(
    creditNoteItemData: CreditNoteItemData
  ): Promise<CreditNoteItem> {
    return await this.creditNoteItemRepository.createCreditNoteItem(
      creditNoteItemData
    );
  }

  /**
   * Récupérer un article d'avoir par ID
   */
  async getCreditNoteItemById(id: number): Promise<CreditNoteItem | null> {
    return await this.creditNoteItemRepository.getCreditNoteItemById(id);
  }

  /**
   * Mettre à jour un article d'avoir
   */
  async updateCreditNoteItem(
    id: number,
    creditNoteItemData: Partial<CreditNoteItemData>
  ): Promise<CreditNoteItem> {
    return await this.creditNoteItemRepository.updateCreditNoteItem(
      id,
      creditNoteItemData
    );
  }

  /**
   * Supprimer un article d'avoir
   */
  async deleteCreditNoteItem(id: number): Promise<boolean> {
    return await this.creditNoteItemRepository.deleteCreditNoteItem(id);
  }

  /**
   * Récupérer les articles d'un avoir
   */
  async getCreditNoteItemsByCreditNoteId(
    creditNoteId: number
  ): Promise<CreditNoteItem[]> {
    return await this.creditNoteItemRepository.getCreditNoteItemsByCreditNoteId(
      creditNoteId
    );
  }

  // ===== GESTION DES ADRESSES DE COMMANDE =====

  /**
   * Créer une adresse de commande
   */
  async createOrderAddress(
    orderAddressData: OrderAddressData
  ): Promise<OrderAddress> {
    return await this.orderAddressRepository.createOrderAddress(
      orderAddressData
    );
  }

  /**
   * Récupérer une adresse de commande par ID
   */
  async getOrderAddressById(id: number): Promise<OrderAddress | null> {
    return await this.orderAddressRepository.getOrderAddressById(id);
  }

  /**
   * Mettre à jour une adresse de commande
   */
  async updateOrderAddress(
    id: number,
    orderAddressData: Partial<OrderAddressData>
  ): Promise<OrderAddress> {
    return await this.orderAddressRepository.updateOrderAddress(
      id,
      orderAddressData
    );
  }

  /**
   * Supprimer une adresse de commande
   */
  async deleteOrderAddress(id: number): Promise<boolean> {
    return await this.orderAddressRepository.deleteOrderAddress(id);
  }

  /**
   * Récupérer les adresses d'une commande
   */
  async getOrderAddressesByOrderId(orderId: number): Promise<OrderAddress[]> {
    return await this.orderAddressRepository.getOrderAddressesByOrderId(
      orderId
    );
  }
}
