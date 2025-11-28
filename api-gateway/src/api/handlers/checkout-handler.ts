/**
 * Handler pour l'orchestration complète du checkout
 * Orchestre les appels aux services pour finaliser une commande
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";
import { PaymentCreateDTO } from "../../../../shared-types/payment-service";

/**
 * Interface pour les données de checkout reçues du frontend
 */
interface CheckoutCompleteRequest {
  cartSessionId: string;
  customerData: {
    firstName?: string;
    lastName?: string;
    email: string;
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
  successUrl: string;
  cancelUrl: string;
}

/**
 * Orchestre le processus complet de checkout
 * POST /api/checkout/complete
 */
export const handleCheckoutComplete = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const body = req.body as CheckoutCompleteRequest;

    // Validation des données requises
    if (!body.cartSessionId) {
      res.status(400).json({
        error: "cartSessionId requis",
        message: "L'identifiant de session du panier est obligatoire",
      });
      return;
    }

    if (!body.customerData?.email) {
      res.status(400).json({
        error: "Email requis",
        message: "L'email du client est obligatoire",
      });
      return;
    }

    // 1. Récupérer le panier
    let cart: any;
    try {
      const cartResponse = await fetch(
        `${SERVICES.cart}/api/cart?sessionId=${body.cartSessionId}`,
        {
          headers: {
            "X-Service-Request": "api-gateway",
          },
        }
      );

      if (!cartResponse.ok) {
        if (cartResponse.status === 404) {
          res.status(404).json({
            error: "Panier introuvable",
            message: "Le panier n'existe pas pour cette session",
          });
          return;
        }
        throw new Error(`Cart Service error: ${cartResponse.statusText}`);
      }

      const cartData = (await cartResponse.json()) as any;
      cart = cartData.cart;

      if (!cart || !cart.items || cart.items.length === 0) {
        res.status(400).json({
          error: "Panier vide",
          message: "Votre panier est vide",
        });
        return;
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'appel au Cart Service:", error);
      res.status(500).json({
        error: "Service de panier indisponible",
        message: "Veuillez réessayer plus tard",
      });
      return;
    }

    // 2. Vérifier si le client existe déjà (par email), sinon le créer
    let customerId: number;
    const emailEncoded = encodeURIComponent(body.customerData.email);

    try {
      const existingCustomerResponse = await fetch(
        `${SERVICES.customer}/api/customers/by-email/${emailEncoded}`,
        {
          headers: {
            "X-Service-Request": "api-gateway",
          },
        }
      );

      if (existingCustomerResponse.ok) {
        // Client existant : récupérer son ID
        const existingData = (await existingCustomerResponse.json()) as any;
        customerId = existingData.customer.customerId;
      } else {
        // Client inexistant : créer un nouveau client
        const customerResponse = await fetch(
          `${SERVICES.customer}/api/customers`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Service-Request": "api-gateway",
            },
            body: JSON.stringify(body.customerData),
          }
        );

        if (!customerResponse.ok) {
          const errorData = (await customerResponse.json()) as any;
          res.status(customerResponse.status).json({
            error: "Erreur lors de la création du client",
            message: errorData.message || "Impossible de créer le client",
          });
          return;
        }

        const customerResponseData = (await customerResponse.json()) as any;
        customerId = customerResponseData.customer.customerId;
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'appel au Customer Service:", error);
      res.status(500).json({
        error: "Service client indisponible",
        message: "Veuillez réessayer plus tard",
      });
      return;
    }

    // 3. Préparer les données de paiement pour Stripe
    const paymentItems = cart.items.map((item: any) => ({
      name: item.productName || "Produit",
      description: item.description || "",
      price: Math.round(item.unitPriceTTC * 100), // en centimes
      quantity: item.quantity,
      currency: "eur",
    }));

    // 4. Préparer le payload pour créer la session de paiement Stripe
    // Les métadonnées Stripe contiennent uniquement les identifiants essentiels
    // Les données checkout complètes sont envoyées par le frontend à la finalisation
    const customerName = `${body.customerData.firstName || ""} ${
      body.customerData.lastName || ""
    }`.trim();
    const paymentCustomer = {
      email: body.customerData.email,
      ...(customerName && { name: customerName }),
      ...(body.customerData.phoneNumber && {
        phone: body.customerData.phoneNumber,
      }),
    };

    const paymentCreateDTO: PaymentCreateDTO = {
      customer: paymentCustomer,
      items: paymentItems,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
      metadata: {
        customerId: customerId.toString(),
        cartSessionId: body.cartSessionId,
      },
    };

    // 5. Créer la session de paiement Stripe
    try {
      const paymentResponse = await fetch(
        `${SERVICES.payment}/api/payment/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Service-Request": "api-gateway",
          },
          body: JSON.stringify(paymentCreateDTO),
        }
      );

      if (!paymentResponse.ok) {
        const errorData = (await paymentResponse
          .json()
          .catch(() => ({}))) as any;
        res.status(paymentResponse.status).json({
          error: "Erreur lors de la création du paiement",
          message:
            errorData.message ||
            errorData.error ||
            "Impossible de créer la session de paiement",
        });
        return;
      }

      // Le payment-service retourne { success: true, paymentUrl: "...", payment: {...} }
      const paymentData = (await paymentResponse.json()) as {
        success: boolean;
        paymentUrl: string;
        payment?: any;
      };

      if (!paymentData.success || !paymentData.paymentUrl) {
        res.status(500).json({
          error: "URL de paiement non reçue",
          message: "La session de paiement n'a pas retourné d'URL",
        });
        return;
      }

      // 6. Retourner l'URL de redirection vers Stripe
      res.json({
        success: true,
        paymentUrl: paymentData.paymentUrl,
      });
    } catch (error) {
      console.error("❌ Erreur lors de l'appel au Payment Service:", error);
      res.status(500).json({
        error: "Service de paiement indisponible",
        message: "Veuillez réessayer plus tard",
      });
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'orchestration du checkout:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      message:
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors du traitement de votre commande",
    });
  }
};
