/**
 * Handlers pour les routes de paiement
 * Utilise les types partagés pour réduire les transformations
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";
import { proxyRequest } from "../proxy";
import { OrderCompleteDTO } from "../../../../shared-types/order-service";
import { CartItemPublicDTO } from "../../../../shared-types/cart-service";

/**
 * Helper pour créer une réponse d'erreur standardisée
 */
const createErrorResponse = (error: string, message: string) => ({
  error,
  message,
  timestamp: new Date().toISOString(),
});

/**
 * Transforme les items du panier (CartItemPublicDTO) en format OrderCompleteDTO
 * Simplifié : productName est maintenant requis dans CartItemPublicDTO
 */
const transformCartItemsToOrderItems = (
  cartItems: CartItemPublicDTO[]
): OrderCompleteDTO["items"] => {
  return cartItems.map((item) => ({
    productId: item.productId,
    productName: item.productName, // Plus besoin de fallback, productName est requis
    quantity: item.quantity,
    unitPriceHT: item.unitPriceHT,
    unitPriceTTC: item.unitPriceTTC,
    vatRate: item.vatRate,
    totalPriceHT: item.totalPriceHT,
    totalPriceTTC: item.totalPriceTTC,
  }));
};

/**
 * Handler pour la création de paiement
 * Simple proxy vers le payment-service
 */
export const handleCreatePayment = async (req: Request, res: Response) => {
  await proxyRequest(req, res, "payment");
};

export const handleFinalizePayment = async (req: Request, res: Response) => {
  try {
    const { csid, cartSessionId, checkoutData } = req.body || {};

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

    if (!cartSessionId) {
      return res
        .status(400)
        .json(
          createErrorResponse(
            "cartSessionId requis",
            "L'identifiant de session du panier est obligatoire"
          )
        );
    }

    if (!checkoutData) {
      return res
        .status(400)
        .json(
          createErrorResponse(
            "checkoutData requis",
            "Les données de checkout sont obligatoires"
          )
        );
    }

    // 1. Appel au Payment Service pour récupérer la session Stripe et vérifier le paiement
    let paymentIntentId: string | undefined;
    let customerIdFromMetadata: string | undefined;

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
        const paymentData = (await paymentResponse.json()) as {
          paymentIntentId?: string;
          metadata?: {
            customerId?: string;
            cartSessionId?: string;
          };
        };
        paymentIntentId = paymentData.paymentIntentId;
        customerIdFromMetadata = paymentData.metadata?.customerId;
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

    // 2. Extraire les données de checkout depuis le body
    const customerData = checkoutData.customerData || {};
    const addressData = checkoutData.addressData || {};
    const shippingAddressData = addressData.shipping || {};
    const billingAddressData = addressData.useSameBillingAddress
      ? shippingAddressData
      : addressData.billing || {};

    // Construire les adresses au format attendu
    const shippingAddress = shippingAddressData.address
      ? {
          firstName: customerData.firstName || "",
          lastName: customerData.lastName || "",
          address: shippingAddressData.address || "",
          city: shippingAddressData.city || "",
          postalCode: shippingAddressData.postalCode || "",
          country: shippingAddressData.countryName || "Belgique",
          phone: customerData.phoneNumber || "",
        }
      : null;

    const billingAddress =
      billingAddressData.address &&
      billingAddressData.address !== shippingAddressData.address
        ? {
            firstName: customerData.firstName || "",
            lastName: customerData.lastName || "",
            address: billingAddressData.address || "",
            city: billingAddressData.city || "",
            postalCode: billingAddressData.postalCode || "",
            country: billingAddressData.countryName || "Belgique",
            phone: customerData.phoneNumber || "",
          }
        : null;

    // 3. Récupérer le panier actif depuis le cart-service
    let cart: any;

    try {
      const cartResponse = await fetch(
        `${SERVICES.cart}/api/cart?sessionId=${cartSessionId}`,
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

      if (!cart || !cart.items || cart.items.length === 0) {
        return res
          .status(400)
          .json(createErrorResponse("Panier vide", "Le panier est vide"));
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

    // Transformer les items du panier en utilisant les types partagés
    const items = transformCartItemsToOrderItems(cart.items || []);

    // Extraire les informations customer depuis les données checkout
    const customer = customerData || {};
    const customerEmail = customer.email || "";

    // 4. Résoudre le customerId : utiliser celui des métadonnées Stripe si disponible, sinon le résoudre
    let customerId: number | undefined;

    if (customerIdFromMetadata) {
      // Utiliser le customerId depuis les métadonnées Stripe (déjà résolu au checkout)
      customerId = parseInt(customerIdFromMetadata, 10);
    } else if (customerEmail) {
      // Fallback : résoudre le customerId depuis l'email
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

    const orderPayload: OrderCompleteDTO = {
      totalAmountHT: cart.subtotal,
      totalAmountTTC: cart.total,
      paymentMethod: "stripe",
      items,
      ...(addresses.length > 0 && { addresses }),
      ...(customerId && { customerId }),
      ...(customer &&
        Object.keys(customer).length > 0 && { customerSnapshot: customer }),
      ...(paymentIntentId && { paymentIntentId }),
    };

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
      // Utiliser directement les items transformés
      const emailItems = items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPriceTTC,
        totalPrice: item.totalPriceTTC,
        vatRate: item.vatRate,
      }));

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
