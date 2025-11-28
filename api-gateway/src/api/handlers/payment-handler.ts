/**
 * Handlers pour les routes de paiement
 * Orchestre les appels aux services (pas de logique métier)
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";
import { proxyRequest } from "../proxy";
import { OrderCompleteDTO } from "../../../../shared-types/order-service";
import { CartPublicDTO } from "../../../../shared-types/cart-service";
import { PaymentMapper } from "../../mappers";
import { EmailMapper } from "../../mappers";

/**
 * Helper pour créer une réponse d'erreur standardisée
 */
const createErrorResponse = (error: string, message: string) => ({
  error,
  message,
  timestamp: new Date().toISOString(),
});

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

    // Validation HTTP basique (pas de logique métier)
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

    // 1. Récupérer la session de paiement depuis payment-service
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
    }

    // 2. Récupérer le panier depuis cart-service
    let cart: CartPublicDTO;

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

      const cartData = (await cartResponse.json()) as { cart: CartPublicDTO };
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

    // 3. Extraire les données de checkout
    const customerData = checkoutData.customerData || {};
    const addressData = checkoutData.addressData || {};
    const shippingAddressData = addressData.shipping || {};
    const billingAddressData = addressData.useSameBillingAddress
      ? shippingAddressData
      : addressData.billing || {};

    // 4. Résoudre le customerId
    let customerId: number | undefined;

    if (customerIdFromMetadata) {
      customerId = parseInt(customerIdFromMetadata, 10);
    } else if (customerData.email) {
      try {
        const customerResponse = await fetch(
          `${SERVICES.customer}/api/customers/resolve-or-create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Service-Request": "api-gateway",
            },
            body: JSON.stringify(customerData),
          }
        );

        if (customerResponse.ok) {
          const customerDataResponse = (await customerResponse.json()) as {
            success: boolean;
            customerId: number;
          };
          customerId = customerDataResponse.customerId;
        }
      } catch (error) {
        console.warn(
          "⚠️ Erreur lors de la résolution du customerId:",
          (error as any)?.message
        );
      }
    }

    // 5. Mapper les items du panier vers les items de commande (mapping simple)
    const orderItems = PaymentMapper.cartItemsToOrderItems(cart.items);

    // 6. Construire les adresses (construction simple, pas de logique métier)
    const addresses: OrderCompleteDTO["addresses"] = [];

    if (shippingAddressData.address) {
      addresses.push({
        addressType: "shipping",
        addressSnapshot: {
          firstName: customerData.firstName || "",
          lastName: customerData.lastName || "",
          address: shippingAddressData.address || "",
          city: shippingAddressData.city || "",
          postalCode: shippingAddressData.postalCode || "",
          country: shippingAddressData.countryName || "Belgique",
          phone: customerData.phoneNumber || "",
        },
      });
    }

    if (
      billingAddressData.address &&
      billingAddressData.address !== shippingAddressData.address
    ) {
      addresses.push({
        addressType: "billing",
        addressSnapshot: {
          firstName: customerData.firstName || "",
          lastName: customerData.lastName || "",
          address: billingAddressData.address || "",
          city: billingAddressData.city || "",
          postalCode: billingAddressData.postalCode || "",
          country: billingAddressData.countryName || "Belgique",
          phone: customerData.phoneNumber || "",
        },
      });
    }

    // 7. Construire le payload OrderCompleteDTO
    const orderPayload: OrderCompleteDTO = {
      totalAmountHT: cart.subtotal,
      totalAmountTTC: cart.total,
      paymentMethod: "stripe",
      items: orderItems,
      ...(addresses.length > 0 && { addresses }),
      ...(customerId && { customerId }),
      ...(customerData &&
        Object.keys(customerData).length > 0 && {
          customerSnapshot: customerData,
        }),
      ...(paymentIntentId && { paymentIntentId }),
    };

    // 8. Appeler order-service pour créer la commande
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

      const orderData = (await orderResponse.json()) as {
        order: { id: number };
      };
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

    // 9. Appeler email-service pour envoyer l'email de confirmation (non-bloquant)
    try {
      // Construire l'adresse de livraison
      const shippingAddress = {
        firstName:
          shippingAddressData.address && customerData.firstName
            ? customerData.firstName
            : "",
        lastName:
          shippingAddressData.address && customerData.lastName
            ? customerData.lastName
            : "",
        address: shippingAddressData.address || "",
        city: shippingAddressData.city || "",
        postalCode: shippingAddressData.postalCode || "",
        country: shippingAddressData.countryName || "Belgique",
      };

      // Mapper les données de commande vers les données d'email (mapping simple)
      const emailData = EmailMapper.orderToEmailData(
        orderItems,
        customerData,
        shippingAddress,
        {
          subtotal: cart.subtotal,
          tax: cart.tax,
          total: cart.total,
        },
        orderId
      );

      const emailResponse = await fetch(
        `${SERVICES.email}/api/email/order-confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Service-Request": "api-gateway",
          },
          body: JSON.stringify(emailData),
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
