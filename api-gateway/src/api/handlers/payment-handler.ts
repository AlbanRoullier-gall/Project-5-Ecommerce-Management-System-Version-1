/**
 * Handler pour la finalisation de paiement après succès Stripe
 * Orchestre l'appel entre Payment Service, Cart Service, Customer Service, Order Service et Email Service
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";

export const handleFinalizePayment = async (req: Request, res: Response) => {
  try {
    const { csid, cartSessionId } = req.body || {};
    console.log(
      `🔄 Finalisation de paiement: csid=${csid}, cartSessionId=${cartSessionId}`
    );

    if (!csid) {
      return res.status(400).json({
        error: "csid requis",
        message: "L'identifiant de session Stripe est obligatoire",
        timestamp: new Date().toISOString(),
      });
    }

    // 1. Appel au Payment Service pour récupérer le paymentIntentId
    console.log("📞 Appel au Payment Service...");
    let paymentIntentId: string | undefined;

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
        console.log(
          `✅ PaymentIntentId récupéré: ${paymentIntentId ? "Oui" : "Non"}`
        );
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

    // 2. Vérifier le cartSessionId
    if (!cartSessionId) {
      return res.status(400).json({
        error: "cartSessionId requis",
        message: "L'identifiant de session du panier est obligatoire",
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Appel au Cart Service pour récupérer les données préparées
    console.log("📞 Appel au Cart Service...");
    let preparedData: any;

    try {
      const cartResponse = await fetch(
        `${SERVICES.cart}/api/cart/prepare-order-data/${cartSessionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Service-Request": "api-gateway",
          },
        }
      );

      if (!cartResponse.ok) {
        if (cartResponse.status === 404) {
          return res.status(404).json({
            error: "Données de checkout introuvables",
            message: "Panier ou snapshot non trouvé pour cette session",
            timestamp: new Date().toISOString(),
          });
        }
        throw new Error(`Cart Service error: ${cartResponse.statusText}`);
      }

      const cartData = (await cartResponse.json()) as any;
      preparedData = cartData.data;

      if (!preparedData) {
        return res.status(404).json({
          error: "Données de checkout introuvables",
          message: "Panier ou snapshot non trouvé pour cette session",
          timestamp: new Date().toISOString(),
        });
      }

      console.log("✅ Données du panier récupérées");
    } catch (error) {
      console.error("❌ Erreur lors de l'appel au Cart Service:", error);
      return res.status(500).json({
        error: "Service de panier indisponible",
        message: "Veuillez réessayer plus tard",
        timestamp: new Date().toISOString(),
      });
    }

    // 4. Appel au Customer Service pour résoudre le customerId
    console.log("📞 Appel au Customer Service...");
    let customerId: number | undefined;

    if (preparedData.customerEmail) {
      try {
        const customerResponse = await fetch(
          `${SERVICES.customer}/api/customers/by-email/${encodeURIComponent(
            preparedData.customerEmail
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
          console.log(
            `✅ CustomerId résolu: ${customerId ? customerId : "Non trouvé"}`
          );
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
    if (preparedData.shippingAddress) {
      addresses.push({
        addressType: "shipping",
        addressSnapshot: preparedData.shippingAddress,
      });
    }
    if (preparedData.billingAddress) {
      addresses.push({
        addressType: "billing",
        addressSnapshot: preparedData.billingAddress,
      });
    }

    const orderPayload: any = {
      totalAmountHT: preparedData.totalAmountHT,
      totalAmountTTC: preparedData.totalAmountTTC,
      paymentMethod: "stripe",
      notes: preparedData.notes,
      items: preparedData.items,
      addresses: addresses.length > 0 ? addresses : undefined,
    };

    if (customerId) {
      orderPayload.customerId = customerId;
    }

    if (preparedData.customer) {
      orderPayload.customerSnapshot = preparedData.customer;
    }

    if (paymentIntentId) {
      orderPayload.paymentIntentId = paymentIntentId;
    }

    // 6. Appel au Order Service pour créer la commande
    console.log("📞 Appel au Order Service...");
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

      console.log(`✅ Commande créée avec succès: ${orderId}`);
    } catch (error) {
      console.error("❌ Erreur lors de l'appel au Order Service:", error);
      return res.status(500).json({
        error: "Service de commande indisponible",
        message:
          (error as any)?.message ||
          "Erreur lors de la création de la commande",
        timestamp: new Date().toISOString(),
      });
    }

    // 7. Appel au Email Service pour envoyer l'email de confirmation (non-bloquant)
    console.log("📧 Appel au Email Service...");

    try {
      const customer = preparedData.customer || {};
      const customerEmail = preparedData.customerEmail || "";
      const shipping = preparedData.shippingAddress || {};

      const items = (preparedData.items || []).map((item: any) => ({
        name: item.productName || `Produit #${item.productId}`,
        quantity: item.quantity,
        unitPrice: item.unitPriceTTC,
        totalPrice: item.totalPriceTTC,
        vatRate: item.vatRate,
      }));

      const customerName = `${
        customer.firstName || shipping?.firstName || ""
      } ${customer.lastName || shipping?.lastName || ""}`.trim();

      const subtotal = Number(preparedData.totalAmountHT || 0);
      const total = Number(preparedData.totalAmountTTC || 0);
      const tax = total - subtotal;

      const emailPayload = {
        customerEmail,
        customerName,
        orderId,
        orderDate: new Date().toISOString(),
        items,
        subtotal,
        tax,
        total,
        shippingAddress: {
          firstName: shipping?.firstName || customer.firstName || "",
          lastName: shipping?.lastName || customer.lastName || "",
          address: shipping?.address || "",
          city: shipping?.city || "",
          postalCode: shipping?.postalCode || "",
          country: shipping?.country || "",
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
      } else {
        console.log("✅ Email de confirmation envoyé");
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
    return res.status(500).json({
      error: "Erreur interne du serveur",
      message: "Veuillez réessayer plus tard",
      timestamp: new Date().toISOString(),
    });
  }
};
