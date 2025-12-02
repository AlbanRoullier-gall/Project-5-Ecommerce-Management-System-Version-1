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
import OrderAddress from "../models/OrderAddress";
import OrderRepository, {
  OrderListOptions,
} from "../repositories/OrderRepository";
import OrderItemRepository from "../repositories/OrderItemRepository";
import CreditNoteRepository from "../repositories/CreditNoteRepository";
import CreditNoteItemRepository from "../repositories/CreditNoteItemRepository";
import OrderAddressRepository from "../repositories/OrderAddressRepository";
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
   * Créer une commande depuis un panier avec checkoutData
   * Accepte le panier avec checkoutData et construit le payload en interne
   *
   * @param data - Données contenant le panier avec checkoutData et les métadonnées de paiement
   * @returns Commande créée
   */
  async createOrderFromCart(data: {
    cart: {
      items: Array<{
        id: string;
        productId: number;
        productName: string;
        description?: string | null;
        imageUrl?: string | null;
        quantity: number;
        unitPriceHT: number;
        unitPriceTTC: number;
        vatRate: number;
        totalPriceHT: number;
        totalPriceTTC: number;
      }>;
      subtotal: number;
      tax: number;
      total: number;
      checkoutData?: {
        customerData?: {
          email: string;
          firstName?: string;
          lastName?: string;
          phoneNumber?: string;
        } | null;
        addressData?: {
          shipping?: {
            address?: string;
            postalCode?: string;
            city?: string;
            countryName?: string;
          };
          billing?: {
            address?: string;
            postalCode?: string;
            city?: string;
            countryName?: string;
          };
          useSameBillingAddress?: boolean;
        } | null;
      } | null;
    };
    customerId: number;
    paymentIntentId?: string;
    paymentMethod?: string;
  }): Promise<Order> {
    // Valider que le panier n'est pas vide
    if (!data.cart || !data.cart.items || data.cart.items.length === 0) {
      throw new Error("Le panier est vide");
    }

    // Valider que checkoutData est présent
    if (
      !data.cart.checkoutData ||
      !data.cart.checkoutData.customerData?.email
    ) {
      throw new Error("Les données checkout sont obligatoires");
    }

    // Extraire customerData et addressData depuis checkoutData
    const checkoutData = data.cart.checkoutData;
    const customerData = checkoutData.customerData!;
    const addressData = checkoutData.addressData || {
      shipping: {},
      billing: {},
      useSameBillingAddress: true,
    };

    // Construire le payload pour la méthode interne
    const orderPayload = {
      cart: data.cart,
      customerId: data.customerId,
      customerData: {
        email: customerData.email,
        ...(customerData.firstName !== undefined && {
          firstName: customerData.firstName,
        }),
        ...(customerData.lastName !== undefined && {
          lastName: customerData.lastName,
        }),
        ...(customerData.phoneNumber !== undefined && {
          phoneNumber: customerData.phoneNumber,
        }),
      },
      addressData: {
        shipping: addressData.shipping || {},
        billing: addressData.billing || {},
        useSameBillingAddress: addressData.useSameBillingAddress ?? true,
      },
      ...(data.paymentIntentId !== undefined && {
        paymentIntentId: data.paymentIntentId,
      }),
      paymentMethod: data.paymentMethod || "stripe",
    };

    return await this._createOrderFromCartInternal(orderPayload);
  }

  /**
   * Méthode interne pour créer une commande complète depuis un panier
   * Transforme le panier en commande et crée tout en base de données avec une transaction
   * @param {Object} data Données contenant le panier et les informations de commande
   * @returns {Promise<Order>} Commande créée
   */
  private async _createOrderFromCartInternal(data: {
    cart: any; // CartPublicDTO
    customerId?: number;
    customerSnapshot?: any; // Optionnel, sera construit à partir de customerData si non fourni
    customerData: {
      email: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
    };
    addressData: {
      shipping: {
        address?: string;
        postalCode?: string;
        city?: string;
        countryName?: string;
      };
      billing?: {
        address?: string;
        postalCode?: string;
        city?: string;
        countryName?: string;
      };
      useSameBillingAddress: boolean;
    };
    paymentIntentId?: string;
    paymentMethod: string;
  }): Promise<Order> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // Valider que le panier n'est pas vide
      if (!data.cart || !data.cart.items || data.cart.items.length === 0) {
        throw new Error("Le panier est vide");
      }

      // Construire le customerSnapshot à partir de customerData si non fourni
      let customerSnapshot = data.customerSnapshot;
      if (!customerSnapshot && data.customerData) {
        customerSnapshot = {
          firstName: data.customerData.firstName || "",
          lastName: data.customerData.lastName || "",
          email: data.customerData.email,
          phoneNumber: data.customerData.phoneNumber || null,
        };
      }

      // Validation
      if (!data.customerId && !customerSnapshot) {
        throw new Error("Customer ID or customer snapshot is required");
      }

      // Créer la commande via le repository avec le client de transaction
      const orderData: Partial<OrderData> & {
        payment_intent_id?: string | null;
      } = {
        customer_id: data.customerId || 0, // 0 sera traité comme null par le repository
        customer_snapshot: customerSnapshot || null,
        total_amount_ht: data.cart.subtotal,
        total_amount_ttc: data.cart.total,
        payment_method: data.paymentMethod,
        notes: "",
        created_at: new Date(),
        updated_at: new Date(),
        payment_intent_id: data.paymentIntentId || null,
      };

      const order = await this.orderRepository.createOrder(orderData, client);

      // Vérifier que l'ID de la commande a été généré
      if (!order.id) {
        throw new Error("Order ID was not generated after creation");
      }

      const orderId = order.id;

      // Créer les items via le repository avec le client de transaction
      // Harmonisation complète des données depuis Cart vers Order
      for (const item of data.cart.items || []) {
        // Validation que productName est présent et non vide
        this.validateProductName(item.productName, item.productId);

        const itemData: OrderItemData = {
          id: 0, // Sera défini par la base de données
          order_id: orderId,
          product_id: item.productId,
          product_name: item.productName.trim(), // Nettoyer et garantir non vide
          description: item.description ?? null, // Transférer la description
          image_url: item.imageUrl ?? null, // Transférer l'image URL
          quantity: item.quantity,
          unit_price_ht: item.unitPriceHT,
          unit_price_ttc: item.unitPriceTTC,
          vat_rate: item.vatRate,
          total_price_ht: item.totalPriceHT,
          total_price_ttc: item.totalPriceTTC,
          created_at: item.createdAt,
          updated_at: new Date(),
        };
        await this.orderItemRepository.createOrderItem(itemData, client);
      }

      // Construire les adresses
      const shippingAddressData = data.addressData.shipping || {};
      const billingAddressData = data.addressData.useSameBillingAddress
        ? shippingAddressData
        : data.addressData.billing || {};

      // Créer l'adresse de livraison si fournie
      if (shippingAddressData.address) {
        const shippingAddress = new OrderAddress({
          id: 0, // Sera défini par la base de données
          order_id: orderId,
          address_type: "shipping" as any,
          address_snapshot: {
            firstName: data.customerData.firstName || "",
            lastName: data.customerData.lastName || "",
            address: shippingAddressData.address || "",
            city: shippingAddressData.city || "",
            postalCode: shippingAddressData.postalCode || "",
            country: shippingAddressData.countryName || "",
            phone: data.customerData.phoneNumber || "",
          },
          created_at: new Date(),
          updated_at: new Date(),
        });
        await this.orderAddressRepository.save(shippingAddress, client);
      }

      // Créer l'adresse de facturation si différente de l'adresse de livraison
      if (
        billingAddressData.address &&
        billingAddressData.address !== shippingAddressData.address
      ) {
        const billingAddress = new OrderAddress({
          id: 0, // Sera défini par la base de données
          order_id: orderId,
          address_type: "billing" as any,
          address_snapshot: {
            firstName: data.customerData.firstName || "",
            lastName: data.customerData.lastName || "",
            address: billingAddressData.address || "",
            city: billingAddressData.city || "",
            postalCode: billingAddressData.postalCode || "",
            country: billingAddressData.countryName || "",
            phone: data.customerData.phoneNumber || "",
          },
          created_at: new Date(),
          updated_at: new Date(),
        });
        await this.orderAddressRepository.save(billingAddress, client);
      }

      await client.query("COMMIT");
      return order;
    } catch (error: any) {
      await client.query("ROLLBACK");
      console.error("Error creating order from cart:", error);
      throw new Error(
        `Erreur lors de la création de la commande: ${error.message}`
      );
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

  /**
   * Génère la liste des années disponibles pour les statistiques
   * Règle métier : de 2025 à l'année actuelle + 5
   * @returns {number[]} Liste des années disponibles
   */
  generateAvailableYears(): number[] {
    const currentYear = new Date().getFullYear();
    const startYear = 2025;
    const endYear = currentYear + 5;
    const years: number[] = [];

    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }

    return years;
  }

  /**
   * Calcule l'année par défaut recommandée pour les statistiques
   * Logique : année courante si elle a des données, sinon année la plus récente avec des données
   * @param availableYears Liste des années disponibles
   * @returns Année par défaut recommandée
   */
  private async calculateDefaultYear(
    availableYears: number[]
  ): Promise<number> {
    const currentYear = new Date().getFullYear();

    // Si l'année courante est disponible et a des données, l'utiliser
    if (availableYears.includes(currentYear)) {
      const currentYearOptions: OrderListOptions = { year: currentYear };
      const currentYearOrders = await this.orderRepository.listOrders({
        ...currentYearOptions,
        page: 1,
        limit: 1,
      });
      if ((currentYearOrders.pagination?.total || 0) > 0) {
        return currentYear;
      }
    }

    // Sinon, trouver l'année la plus récente avec des données
    // Parcourir les années en ordre décroissant
    const sortedYears = [...availableYears].sort((a, b) => b - a);
    for (const year of sortedYears) {
      const yearOptions: OrderListOptions = { year };
      const yearOrders = await this.orderRepository.listOrders({
        ...yearOptions,
        page: 1,
        limit: 1,
      });
      if ((yearOrders.pagination?.total || 0) > 0) {
        return year;
      }
    }

    // Fallback : année courante si aucune année n'a de données
    return currentYear;
  }

  /**
   * Obtenir les statistiques formatées pour le dashboard
   * @param {number} year Année pour filtrer les statistiques
   * @returns {Promise<DashboardStatisticsResponseDTO>} Statistiques formatées avec années disponibles
   */
  async getDashboardStatistics(year: number): Promise<{
    statistics: {
      ordersCount: number;
      totalRevenue: number;
      totalRevenueHT: number;
    };
    year: number;
    availableYears: number[];
    defaultYear: number;
  }> {
    try {
      const options: OrderListOptions = { year };

      // Récupérer le nombre de commandes pour l'année
      const ordersList = await this.orderRepository.listOrders({
        ...options,
        page: 1,
        limit: 1, // On n'a besoin que de la pagination
      });
      const ordersCount = ordersList.pagination?.total || 0;

      // Récupérer les totaux (revenus)
      const statistics = await this.getOrderStatistics(options);

      // Générer les années disponibles
      const availableYears = this.generateAvailableYears();

      // Calculer l'année par défaut recommandée
      const defaultYear = await this.calculateDefaultYear(availableYears);

      return {
        statistics: {
          ordersCount,
          totalRevenue: statistics.totalAmountTTC,
          totalRevenueHT: statistics.totalAmountHT,
        },
        year,
        availableYears,
        defaultYear,
      };
    } catch (error: any) {
      console.error("Error getting dashboard statistics:", error);
      throw new Error(
        `Failed to retrieve dashboard statistics: ${error.message}`
      );
    }
  }

  // ===== GESTION DES ARTICLES DE COMMANDE =====

  /**
   * Récupérer un article de commande par ID
   */
  async getOrderItemById(id: number): Promise<OrderItem | null> {
    return await this.orderItemRepository.getOrderItemById(id);
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

  /**
   * Récupérer plusieurs articles par leurs IDs
   */
  async getOrderItemsByIds(itemIds: number[]): Promise<OrderItem[]> {
    return await this.orderItemRepository.getOrderItemsByIds(itemIds);
  }

  // ===== GESTION DES AVOIRS =====

  /**
   * Créer un avoir
   * Si items est fourni, tout est créé en transaction atomique
   * Si items n'est pas fourni, création simple de l'avoir uniquement
   */
  async createCreditNote(
    creditNoteData: CreditNoteData,
    items?: Array<{
      productId: number;
      productName: string;
      quantity: number;
      unitPriceHT: number;
      unitPriceTTC: number;
      vatRate: number;
      totalPriceHT: number;
      totalPriceTTC: number;
    }>
  ): Promise<CreditNote> {
    // Si des items sont fournis, utiliser une transaction pour créer l'avoir et ses items
    if (items && items.length > 0) {
      const client = await this.pool.connect();
      try {
        await client.query("BEGIN");

        const creditNote = await this.creditNoteRepository.createCreditNote(
          creditNoteData,
          client
        );

        // Vérifier que l'ID de l'avoir a été généré
        if (!creditNote.id) {
          throw new Error("Credit note ID was not generated after creation");
        }

        const creditNoteId = creditNote.id;

        // Créer les items via le repository avec le client de transaction
        for (const item of items) {
          // Validation que productName est présent et non vide
          this.validateProductName(item.productName, item.productId);

          const itemData: CreditNoteItemData = {
            id: 0, // Sera défini par la base de données
            credit_note_id: creditNoteId,
            product_id: item.productId,
            product_name: item.productName.trim(),
            quantity: item.quantity,
            unit_price_ht: item.unitPriceHT,
            unit_price_ttc: item.unitPriceTTC,
            vat_rate: item.vatRate,
            total_price_ht: item.totalPriceHT,
            total_price_ttc: item.totalPriceTTC,
            created_at: new Date(),
            updated_at: new Date(),
          };
          await this.creditNoteItemRepository.createCreditNoteItem(
            itemData,
            client
          );
        }

        await client.query("COMMIT");
        return creditNote;
      } catch (error: any) {
        await client.query("ROLLBACK");
        console.error("Error creating credit note with items:", error);
        throw new Error(
          `Erreur lors de la création de l'avoir: ${error.message}`
        );
      } finally {
        client.release();
      }
    } else {
      // Comportement classique : création simple avec totaux fournis
      return await this.creditNoteRepository.createCreditNote(creditNoteData);
    }
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
   * Récupérer une adresse de commande par ID
   */
  async getOrderAddressById(id: number): Promise<OrderAddress | null> {
    return await this.orderAddressRepository.getOrderAddressById(id);
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

  // ===== MÉTHODES PRIVÉES =====

  /**
   * Valider que le nom du produit est présent et non vide
   * @param {string | undefined} productName Nom du produit
   * @param {number} productId ID du produit (pour le message d'erreur)
   * @throws {Error} Si le nom du produit est invalide
   */
  private validateProductName(
    productName: string | undefined,
    productId: number
  ): void {
    if (!productName || productName.trim().length === 0) {
      throw new Error(`Product name is required for product ID ${productId}`);
    }
  }

  /**
   * Mapper un item pour l'export (normalisation des propriétés)
   * @param {any} item Item à mapper
   * @returns {any} Item mappé
   */
  private mapItemForExport(item: any): any {
    return {
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
    };
  }

  /**
   * Mapper une commande pour l'export avec ses items et adresses
   * @param {Order} order Commande à mapper
   * @param {OrderItem[]} items Items de la commande
   * @param {OrderAddress[]} addresses Adresses de la commande
   * @returns {any} Commande mappée pour l'export
   */
  private mapOrderForExport(
    order: Order,
    items: OrderItem[],
    addresses: OrderAddress[]
  ): any {
    const totals = Order.calculateTotalsFromItems(
      items,
      order.totalAmountHT,
      order.totalAmountTTC
    );

    return {
      id: order.id,
      customerId: order.customerId,
      customerSnapshot: order.customerSnapshot,
      totalAmountHT: parseFloat(totals.totalHT.toFixed(2)),
      totalAmountTTC: parseFloat(totals.totalTTC.toFixed(2)),
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      delivered: order.delivered,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: items ? items.map((item) => this.mapItemForExport(item)) : [],
      addresses: addresses
        ? addresses.map((address: any) => ({
            id: address.id,
            orderId: address.orderId,
            addressType: address.addressType || address.type,
            addressSnapshot: address.addressSnapshot || address,
          }))
        : [],
    };
  }

  /**
   * Mapper un avoir pour l'export avec ses items
   * @param {CreditNote} creditNote Avoir à mapper
   * @param {CreditNoteItem[]} items Items de l'avoir
   * @returns {any} Avoir mappé pour l'export
   */
  private mapCreditNoteForExport(
    creditNote: CreditNote,
    items: CreditNoteItem[]
  ): any {
    const totals = CreditNote.calculateTotalsFromItems(
      items,
      creditNote.totalAmountHT,
      creditNote.totalAmountTTC
    );

    return {
      id: creditNote.id,
      customerId: creditNote.customerId,
      orderId: creditNote.orderId,
      reason: creditNote.reason,
      description: creditNote.description,
      issueDate: creditNote.issueDate,
      paymentMethod: creditNote.paymentMethod,
      totalAmountHT: parseFloat(totals.totalHT.toFixed(2)),
      totalAmountTTC: parseFloat(totals.totalTTC.toFixed(2)),
      notes: creditNote.notes,
      createdAt: creditNote.createdAt,
      updatedAt: creditNote.updatedAt,
      items: items ? items.map((item) => this.mapItemForExport(item)) : [],
    };
  }

  /**
   * Sérialiser les données d'export en JSON pour garantir la sérialisation
   * @param {any} data Données à sérialiser
   * @returns {any} Données sérialisées
   */
  private serializeExportData(data: { orders: any[]; creditNotes: any[] }): {
    orders: any[];
    creditNotes: any[];
  } {
    const jsonString = JSON.stringify(data);
    console.log(
      `📏 Taille JSON: ${(jsonString.length / 1024 / 1024).toFixed(2)} MB`
    );

    const serializedData = JSON.parse(jsonString);

    // Vérification finale
    if (serializedData.orders.length !== data.orders.length) {
      console.error(
        `❌ ERREUR: Perte de données lors de la sérialisation! ${data.orders.length} -> ${serializedData.orders.length}`
      );
    }

    return serializedData;
  }

  /**
   * Obtenir les commandes et avoirs pour l'export d'année
   */
  async getYearExportData(year: number): Promise<{
    orders: any[];
    creditNotes: any[];
  }> {
    try {
      // Obtenir les commandes de l'année
      const orders = await this.orderRepository.getOrdersByYear(year);
      console.log(
        `📊 Export pour l'année ${year}: ${orders.length} commandes trouvées`
      );

      // Traiter chaque commande avec ses items et adresses
      console.log(`🔄 Traitement de ${orders.length} commandes...`);
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          try {
            const items = await this.getOrderItemsByOrderId(order.id);
            const addresses = await this.getOrderAddressesByOrderId(order.id);
            return this.mapOrderForExport(order, items, addresses);
          } catch (error) {
            console.error(
              `❌ Erreur lors du traitement de la commande ${order.id}:`,
              error
            );
            // Retourner la commande sans items/adresses en cas d'erreur
            return this.mapOrderForExport(order, [], []);
          }
        })
      );

      console.log(
        `✅ ${ordersWithDetails.length} commandes traitées avec succès`
      );

      // Obtenir les avoirs de l'année
      const creditNotes = await this.creditNoteRepository.getCreditNotesByYear(
        year
      );
      console.log(
        `📊 Export pour l'année ${year}: ${creditNotes.length} avoirs trouvés`
      );

      // Traiter chaque avoir avec ses items
      const creditNotesWithItems = await Promise.all(
        creditNotes.map(async (creditNote) => {
          try {
            const items = await this.getCreditNoteItemsByCreditNoteId(
              creditNote.id
            );
            console.log(`📋 Credit Note #${creditNote.id} items:`, {
              itemsCount: items?.length || 0,
            });
            return this.mapCreditNoteForExport(creditNote, items);
          } catch (error) {
            console.error(
              `❌ Erreur lors du traitement de l'avoir ${creditNote.id}:`,
              error
            );
            return this.mapCreditNoteForExport(creditNote, []);
          }
        })
      );

      console.log(
        `📦 Avant sérialisation: ${ordersWithDetails.length} commandes, ${creditNotesWithItems.length} avoirs`
      );

      // Sérialiser et retourner
      const dataToSerialize = {
        orders: ordersWithDetails,
        creditNotes: creditNotesWithItems,
      };

      const serializedData = this.serializeExportData(dataToSerialize);

      console.log(
        `✅ Export sérialisé: ${serializedData.orders.length} commandes, ${serializedData.creditNotes.length} avoirs`
      );

      return serializedData;
    } catch (error) {
      console.error("Error getting year export data:", error);
      throw error;
    }
  }
}
