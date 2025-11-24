/**
 * Handler pour la finalisation de paiement après succès Stripe
 * Orchestre l'appel entre Payment Service, Cart Service, Customer Service, Order Service et Email Service
 * Note: Les items sont enrichis avec productName lors de l'ajout au panier côté frontend
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";

/**
 * Helper pour créer une réponse d'erreur standardisée
 */
const createErrorResponse = (error: string, message: string) => ({
  error,
  message,
  timestamp: new Date().toISOString(),
});

/**
 * Helper pour transformer les items du panier en format order-service
 */
const transformItemsForOrder = (cartItems: any[]) => {
  return cartItems.map((item: any) => {
    const itemData: any = {
      productId: item.productId,
      quantity: item.quantity,
      unitPriceHT: item.unitPriceHT,
      unitPriceTTC: item.unitPriceTTC,
      vatRate: item.vatRate,
      totalPriceHT: item.totalPriceHT,
      totalPriceTTC: item.totalPriceTTC,
    };
    if (item.productName !== undefined) {
      itemData.productName = item.productName;
    }
    return itemData;
  });
};

/**
 * Helper pour transformer les items en format email-service
 */
const transformItemsForEmail = (items: any[]) => {
  return items.map((item: any) => ({
    name: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPriceTTC,
    totalPrice: item.totalPriceTTC,
    vatRate: item.vatRate,
  }));
};

export const handleFinalizePayment = async (req: Request, res: Response) => {
  try {
    const { csid, cartSessionId } = req.body || {};

    if (!csid) {
      return res
        .status(400)
        .json(
          createErrorResponse(
            "csid requis",
            "L'identifiant de session Stripe est obligatoire"
          )
        );
    }

    // 1. Appel au Payment Service pour récupérer la session Stripe complète avec metadata
    let paymentIntentId: string | undefined;
    let snapshot: any = null;
    let cartSessionIdFromStripe: string | undefined;

    try {
      const paymentResponse = await fetch(
        `${SERVICES.payment}/api/payment/session/${csid}`,
        {
          method: "GET",
          headers: {
            "X-Service-Request": "api-gateway",
          },
        }
      );

      if (paymentResponse.ok) {
        const paymentData = (await paymentResponse.json()) as any;
        paymentIntentId = paymentData.paymentIntentId;

        // Récupérer le cartSessionId et le snapshot depuis les metadata Stripe
        if (paymentData.session?.metadata) {
          cartSessionIdFromStripe = paymentData.session.metadata.cartSessionId;

          if (paymentData.session.metadata.checkoutSnapshot) {
            try {
              snapshot = JSON.parse(
                paymentData.session.metadata.checkoutSnapshot
              );
            } catch (parseError) {
              console.warn(
                "⚠️ Erreur lors du parsing du snapshot depuis Stripe:",
                parseError
              );
            }
          }
        }
      } else {
        console.warn("⚠️ Payment Service - session non trouvée");
      }
    } catch (error) {
      console.warn(
        "⚠️ Erreur lors de l'appel au Payment Service:",
        (error as any)?.message
      );
      paymentIntentId = undefined;
    }

    // 2. Récupérer le cartSessionId depuis les metadata Stripe ou le body
    const cartSessionIdToUse = cartSessionIdFromStripe || cartSessionId;

    if (!cartSessionIdToUse) {
      return res
        .status(400)
        .json(
          createErrorResponse(
            "cartSessionId requis",
            "L'identifiant de session du panier est obligatoire"
          )
        );
    }

    // 3. Vérifier que le snapshot a été récupéré depuis Stripe
    if (!snapshot) {
      return res
        .status(404)
        .json(
          createErrorResponse(
            "Snapshot introuvable",
            "Les données de checkout n'ont pas pu être récupérées depuis Stripe"
          )
        );
    }

    // 4. Appel au Cart Service pour récupérer uniquement le panier
    let cart: any;

    try {
      const cartResponse = await fetch(
        `${SERVICES.cart}/api/cart?sessionId=${cartSessionIdToUse}`,
        {
          method: "GET",
          headers: {
            "X-Service-Request": "api-gateway",
          },
        }
      );

      if (!cartResponse.ok) {
        if (cartResponse.status === 404) {
          return res
            .status(404)
            .json(
              createErrorResponse(
                "Panier introuvable",
                "Le panier n'existe pas pour cette session"
              )
            );
        }
        throw new Error(`Cart Service error: ${cartResponse.statusText}`);
      }

      const cartData = (await cartResponse.json()) as any;
      cart = cartData.cart;

      if (!cart) {
        return res
          .status(404)
          .json(
            createErrorResponse(
              "Panier introuvable",
              "Le panier n'existe pas pour cette session"
            )
          );
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'appel au Cart Service:", error);
      return res
        .status(500)
        .json(
          createErrorResponse(
            "Service de panier indisponible",
            "Veuillez réessayer plus tard"
          )
        );
    }

    // 3.1. Extraire et transformer les données pour order-service
    // Transformer les items du panier
    const items = transformItemsForOrder(cart.items || []);

    // Extraire les informations customer depuis le snapshot
    const customer = snapshot.customer || {};
    const customerEmail = customer.email || snapshot.email || "";

    // Extraire les adresses (gère camelCase et snake_case)
    const shippingAddress =
      snapshot.shippingAddress || snapshot.shipping_address || null;
    const billingAddress =
      snapshot.billingAddress || snapshot.billing_address || null;

    // 4. Appel au Customer Service pour résoudre le customerId
    let customerId: number | undefined;

    if (customerEmail) {
      try {
        const customerResponse = await fetch(
          `${SERVICES.customer}/api/customers/by-email/${encodeURIComponent(
            customerEmail
          )}/id`,
          {
            method: "GET",
            headers: {
              "X-Service-Request": "api-gateway",
            },
          }
        );

        if (customerResponse.ok) {
          const customerData = (await customerResponse.json()) as any;
          customerId = customerData.customerId;
        }
      } catch (error) {
        console.warn(
          "⚠️ Erreur lors de la résolution du customerId:",
          (error as any)?.message
        );
      }
    }

    // 5. Construire le payload pour order-service
    const addresses = [];
    if (shippingAddress) {
      addresses.push({
        addressType: "shipping",
        addressSnapshot: shippingAddress,
      });
    }
    if (billingAddress) {
      addresses.push({
        addressType: "billing",
        addressSnapshot: billingAddress,
      });
    }

    const orderPayload: any = {
      totalAmountHT: cart.subtotal,
      totalAmountTTC: cart.total,
      paymentMethod: "stripe",
      notes: snapshot.notes || undefined,
      items,
      addresses: addresses.length > 0 ? addresses : undefined,
    };

    if (customerId) {
      orderPayload.customerId = customerId;
    }

    if (customer && Object.keys(customer).length > 0) {
      orderPayload.customerSnapshot = customer;
    }

    if (paymentIntentId) {
      orderPayload.paymentIntentId = paymentIntentId;
    }

    // 6. Appel au Order Service pour créer la commande
    let orderId: number;

    try {
      const orderResponse = await fetch(
        `${SERVICES.order}/api/orders/from-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Service-Request": "api-gateway",
          },
          body: JSON.stringify(orderPayload),
        }
      );

      if (!orderResponse.ok) {
        const orderError = (await orderResponse.json()) as any;
        console.error(`❌ Order Service error: ${orderError.message}`);
        throw new Error(
          `Order Service error: ${
            orderError.message || orderResponse.statusText
          }`
        );
      }

      const orderData = (await orderResponse.json()) as any;
      orderId = orderData.order?.id;

      if (!orderId) {
        throw new Error("Order ID non retourné par le service");
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'appel au Order Service:", error);
      return res
        .status(500)
        .json(
          createErrorResponse(
            "Service de commande indisponible",
            (error as any)?.message ||
              "Erreur lors de la création de la commande"
          )
        );
    }

    // 7. Appel au Email Service pour envoyer l'email de confirmation (non-bloquant)
    try {
      const emailItems = transformItemsForEmail(items);

      const customerName = `${
        customer.firstName || shippingAddress?.firstName || ""
      } ${customer.lastName || shippingAddress?.lastName || ""}`.trim();

      const subtotal = Number(cart.subtotal || 0);
      const total = Number(cart.total || 0);
      const tax = total - subtotal;

      const emailPayload = {
        customerEmail,
        customerName,
        orderId,
        orderDate: new Date().toISOString(),
        items: emailItems,
        subtotal,
        tax,
        total,
        shippingAddress: {
          firstName: shippingAddress?.firstName || customer.firstName || "",
          lastName: shippingAddress?.lastName || customer.lastName || "",
          address: shippingAddress?.address || "",
          city: shippingAddress?.city || "",
          postalCode: shippingAddress?.postalCode || "",
          country: shippingAddress?.country || "",
        },
      };

      const emailResponse = await fetch(
        `${SERVICES.email}/api/email/order-confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Service-Request": "api-gateway",
          },
          body: JSON.stringify(emailPayload),
        }
      );

      if (!emailResponse.ok) {
        console.error("⚠️ Email Service error - email non envoyé");
      }
    } catch (error) {
      console.warn("⚠️ Erreur lors de l'envoi de l'email:", error);
    }

    return res.status(200).json({
      success: true,
      orderId,
      message: "Paiement finalisé avec succès",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Finalisation de paiement - erreur:", error);
    return res
      .status(500)
      .json(
        createErrorResponse(
          "Erreur interne du serveur",
          "Veuillez réessayer plus tard"
        )
      );
  }
};
