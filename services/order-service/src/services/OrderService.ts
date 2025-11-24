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
import { OrderFromCheckoutDTO } from "../api/dto/index";

export default class OrderService {
  private pool: Pool;
  private orderRepository: OrderRepository;
  private orderItemRepository: OrderItemRepository;
  private creditNoteRepository: CreditNoteRepository;
  private creditNoteItemRepository: CreditNoteItemRepository;
  private orderAddressRepository: OrderAddressRepository;

  constructor(pool: Pool) {
    this.pool = pool;
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
        id: 0, // Sera défini par la base de données
        customer_id: orderData.customer_id,
        customer_snapshot: orderData.customer_snapshot || null,
        total_amount_ht: orderData.total_amount_ht,
        total_amount_ttc: orderData.total_amount_ttc,
        payment_method: orderData.payment_method,
        notes: orderData.notes || "",
        // @ts-ignore - champ étendu autorisé à passer par le repo pour supporter l'idempotence sur le paiement
        payment_intent_id: (orderData as any).payment_intent_id || null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return order;
    } catch (error: any) {
      console.error("Error creating order:", error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  /**
   * Créer une commande complète depuis un checkout (order + items + addresses)
   * Utilise une transaction PostgreSQL pour garantir l'atomicité
   * Réutilise la logique des repositories mais avec un client de transaction
   */
  async createOrderFromCheckout(
    checkoutData: OrderFromCheckoutDTO
  ): Promise<Order> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // Validation
      if (!checkoutData.customerId && !checkoutData.customerSnapshot) {
        throw new Error("Customer ID or customer snapshot is required");
      }

      // Créer la commande (réutilise la logique du repository mais avec le client de transaction)
      const orderQuery = `
        INSERT INTO orders (customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
                           payment_method, notes, payment_intent_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (payment_intent_id) WHERE payment_intent_id IS NOT NULL DO UPDATE SET updated_at = NOW()
        RETURNING id, customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
                  payment_method, notes, created_at, updated_at
      `;
      const orderValues = [
        checkoutData.customerId || null,
        checkoutData.customerSnapshot || null,
        checkoutData.totalAmountHT,
        checkoutData.totalAmountTTC,
        checkoutData.paymentMethod,
        checkoutData.notes || "",
        checkoutData.paymentIntentId || null,
      ];
      const orderResult = await client.query(orderQuery, orderValues);
      const order = new Order(orderResult.rows[0] as OrderData);

      // Créer les items (réutilise la logique du repository)
      for (const item of checkoutData.items || []) {
        const itemQuery = `
          INSERT INTO order_items (order_id, product_id, product_name, quantity, 
                                  unit_price_ht, unit_price_ttc, vat_rate, 
                                  total_price_ht, total_price_ttc, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
          RETURNING id, order_id, product_id, product_name, quantity, 
                    unit_price_ht, unit_price_ttc, vat_rate, 
                    total_price_ht, total_price_ttc, created_at, updated_at
        `;
        await client.query(itemQuery, [
          order.id,
          item.productId,
          item.productName,
          item.quantity,
          item.unitPriceHT,
          item.unitPriceTTC,
          item.vatRate,
          item.totalPriceHT,
          item.totalPriceTTC,
        ]);
      }

      // Créer les adresses (réutilise la logique du repository)
      for (const address of checkoutData.addresses || []) {
        const addressQuery = `
          INSERT INTO order_addresses (order_id, type, address_snapshot, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
          RETURNING id, order_id, type AS address_type, address_snapshot, created_at, updated_at
        `;
        await client.query(addressQuery, [
          order.id,
          address.addressType,
          address.addressSnapshot, // PostgreSQL gère automatiquement la conversion JSONB
        ]);
      }

      await client.query("COMMIT");
      return order;
    } catch (error: any) {
      await client.query("ROLLBACK");
      console.error("Error creating order from checkout:", error);
      throw new Error(`Failed to create order from checkout: ${error.message}`);
    } finally {
      client.release();
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
      // Récupérer les totaux bruts des commandes (HT/TTC)
      const ordersTotals = await this.orderRepository.getOrdersTotals(options);

      // Récupérer les totaux des avoirs (HT/TTC)
      const creditNotesTotals =
        await this.creditNoteRepository.getCreditNotesTotals(options);

      // Revenus nets = Commandes - Avoirs
      const totalAmountHT = Math.max(
        0,
        Number((ordersTotals.totalHT - creditNotesTotals.totalHT).toFixed(2))
      );
      const totalAmountTTC = Math.max(
        0,
        Number((ordersTotals.totalTTC - creditNotesTotals.totalTTC).toFixed(2))
      );

      return { totalAmountHT, totalAmountTTC };
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

  /**
   * Mettre à jour l'état de livraison d'une commande
   * @param {number} orderId ID de la commande
   * @param {boolean} delivered État de livraison
   * @returns {Promise<Order | null>} Commande mise à jour ou null
   */
  async updateDeliveryStatus(
    orderId: number,
    delivered: boolean
  ): Promise<Order | null> {
    try {
      return await this.orderRepository.updateDeliveryStatus(
        orderId,
        delivered
      );
    } catch (error) {
      console.error("Error updating delivery status:", error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'un avoir
   * @param {number} creditNoteId ID de l'avoir
   * @param {string} status Nouveau statut
   * @returns {Promise<CreditNote>} Avoir mis à jour
   */
  async updateCreditNoteStatus(
    creditNoteId: number,
    status: string
  ): Promise<CreditNote> {
    try {
      return await this.creditNoteRepository.updateStatus(creditNoteId, status);
    } catch (error) {
      console.error("Error updating credit note status:", error);
      throw error;
    }
  }

  /**
   * Obtenir les commandes et avoirs pour l'export d'année
   */
  async getYearExportData(year: number): Promise<{
    orders: any[];
    creditNotes: any[];
  }> {
    try {
      // Obtenir les commandes de l'année en utilisant le repository
      const orders = await this.orderRepository.getOrdersByYear(year);

      console.log(
        `📊 Export pour l'année ${year}: ${orders.length} commandes trouvées`
      );

      // Obtenir les articles et adresses pour chaque commande en utilisant les repositories
      // Recalculer les totaux à partir des items pour garantir l'exactitude
      // Créer de nouveaux objets pour s'assurer que toutes les propriétés sont bien sérialisées
      console.log(`🔄 Traitement de ${orders.length} commandes...`);
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          try {
            const items = await this.orderItemRepository.getItemsByOrderId(
              order.id
            );
            const addresses =
              await this.orderAddressRepository.getAddressesByOrderId(order.id);

            // Recalculer les totaux à partir des items pour garantir l'exactitude
            let totalHT = parseFloat(String(order.totalAmountHT || 0));
            let totalTTC = parseFloat(String(order.totalAmountTTC || 0));
            if (items && items.length > 0) {
              totalHT = items.reduce(
                (sum: number, item: any) =>
                  sum + parseFloat(String(item.totalPriceHT || 0)),
                0
              );
              totalTTC = items.reduce(
                (sum: number, item: any) =>
                  sum + parseFloat(String(item.totalPriceTTC || 0)),
                0
              );
            }

            // S'assurer que les totaux sont des nombres
            totalHT = isNaN(totalHT) ? 0 : Number(totalHT);
            totalTTC = isNaN(totalTTC) ? 0 : Number(totalTTC);

            // Créer un nouvel objet avec toutes les propriétés explicitement
            return {
              id: order.id,
              customerId: order.customerId,
              customerSnapshot: order.customerSnapshot,
              totalAmountHT: parseFloat(totalHT.toFixed(2)),
              totalAmountTTC: parseFloat(totalTTC.toFixed(2)),
              paymentMethod: order.paymentMethod,
              notes: order.notes,
              delivered: order.delivered,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
              items: items
                ? items.map((item: any) => ({
                    id: item.id,
                    orderId: item.orderId,
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    unitPriceHT: item.unitPriceHT,
                    unitPriceTTC: item.unitPriceTTC,
                    vatRate: item.vatRate,
                    totalPriceHT: item.totalPriceHT,
                    totalPriceTTC: item.totalPriceTTC,
                  }))
                : [],
              addresses: addresses
                ? addresses.map((address: any) => ({
                    id: address.id,
                    orderId: address.orderId,
                    addressType: address.addressType || address.type,
                    addressSnapshot: address.addressSnapshot || address,
                  }))
                : [],
            };
          } catch (error) {
            console.error(
              `❌ Erreur lors du traitement de la commande ${order.id}:`,
              error
            );
            // Retourner la commande sans items/adresses en cas d'erreur
            return {
              id: order.id,
              customerId: order.customerId,
              customerSnapshot: order.customerSnapshot,
              totalAmountHT: order.totalAmountHT || 0,
              totalAmountTTC: order.totalAmountTTC || 0,
              paymentMethod: order.paymentMethod,
              notes: order.notes,
              delivered: order.delivered,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
              items: [],
              addresses: [],
            };
          }
        })
      );

      console.log(
        `✅ ${ordersWithDetails.length} commandes traitées avec succès`
      );

      // Obtenir les avoirs de l'année en utilisant le repository
      const creditNotes = await this.creditNoteRepository.getCreditNotesByYear(
        year
      );

      console.log(
        `📊 Export pour l'année ${year}: ${creditNotes.length} avoirs trouvés`
      );

      // Obtenir les articles d'avoir pour chaque avoir en utilisant le repository
      // Créer de nouveaux objets pour s'assurer que les items sont bien sérialisés
      const creditNotesWithItems = await Promise.all(
        creditNotes.map(async (creditNote) => {
          const items =
            await this.creditNoteItemRepository.getItemsByCreditNoteId(
              creditNote.id
            );
          // Debug log
          console.log(`📋 Credit Note #${creditNote.id} items:`, {
            itemsCount: items?.length || 0,
            items: items,
          });
          // Recalculer les totaux à partir des items pour garantir l'exactitude
          let totalHT = parseFloat(String(creditNote.totalAmountHT || 0));
          let totalTTC = parseFloat(String(creditNote.totalAmountTTC || 0));
          if (items && items.length > 0) {
            totalHT = items.reduce(
              (sum: number, item: any) =>
                sum + parseFloat(String(item.totalPriceHT || 0)),
              0
            );
            totalTTC = items.reduce(
              (sum: number, item: any) =>
                sum + parseFloat(String(item.totalPriceTTC || 0)),
              0
            );
          }

          // S'assurer que les totaux sont des nombres
          totalHT = isNaN(totalHT) ? 0 : Number(totalHT);
          totalTTC = isNaN(totalTTC) ? 0 : Number(totalTTC);

          // Créer un nouvel objet avec toutes les propriétés explicitement pour garantir la sérialisation
          // Les objets PostgreSQL peuvent avoir des propriétés non-énumérables
          return {
            id: creditNote.id,
            customerId: creditNote.customerId,
            orderId: creditNote.orderId,
            reason: creditNote.reason,
            description: creditNote.description,
            issueDate: creditNote.issueDate,
            paymentMethod: creditNote.paymentMethod,
            totalAmountHT: parseFloat(totalHT.toFixed(2)),
            totalAmountTTC: parseFloat(totalTTC.toFixed(2)),
            notes: creditNote.notes,
            createdAt: creditNote.createdAt,
            updatedAt: creditNote.updatedAt,
            items: items
              ? items.map((item: any) => ({
                  id: item.id,
                  productId: item.productId,
                  productName: item.productName,
                  quantity: item.quantity,
                  unitPriceHT: item.unitPriceHT,
                  unitPriceTTC: item.unitPriceTTC,
                  vatRate: item.vatRate,
                  totalPriceHT: item.totalPriceHT,
                  totalPriceTTC: item.totalPriceTTC,
                }))
              : [],
          };
        })
      );

      // Vérifier avant sérialisation
      console.log(
        `📦 Avant sérialisation: ${ordersWithDetails.length} commandes, ${creditNotesWithItems.length} avoirs`
      );

      // Forcer la sérialisation JSON pour garantir que tous les objets sont bien sérialisables
      const dataToSerialize = {
        orders: ordersWithDetails,
        creditNotes: creditNotesWithItems,
      };

      const jsonString = JSON.stringify(dataToSerialize);
      console.log(
        `📏 Taille JSON: ${(jsonString.length / 1024 / 1024).toFixed(2)} MB`
      );

      const serializedData = JSON.parse(jsonString);

      console.log(
        `✅ Export sérialisé: ${serializedData.orders.length} commandes, ${serializedData.creditNotes.length} avoirs`
      );

      // Vérification finale
      if (serializedData.orders.length !== ordersWithDetails.length) {
        console.error(
          `❌ ERREUR: Perte de données lors de la sérialisation! ${ordersWithDetails.length} -> ${serializedData.orders.length}`
        );
      }

      return serializedData;
    } catch (error) {
      console.error("Error getting year export data:", error);
      throw error;
    }
  }
}
