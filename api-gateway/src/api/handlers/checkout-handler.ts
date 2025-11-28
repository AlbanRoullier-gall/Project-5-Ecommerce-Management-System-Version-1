/**
 * Handler pour l'orchestration complète du checkout
 * Orchestre les appels aux services (pas de logique métier)
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";
import {
  PaymentCreateDTO,
  PaymentCustomer,
} from "../../../../shared-types/payment-service";
import { CartPublicDTO } from "../../../../shared-types/cart-service";
import { CheckoutMapper } from "../../mappers";

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
 * Helper pour créer une réponse d'erreur standardisée
 */
const createErrorResponse = (error: string, message: string) => ({
  error,
  message,
  timestamp: new Date().toISOString(),
});

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

    // Validation HTTP basique (pas de logique métier)
    if (!body.cartSessionId) {
      res
        .status(400)
        .json(
          createErrorResponse(
            "cartSessionId requis",
            "L'identifiant de session du panier est obligatoire"
          )
        );
      return;
    }

    if (!body.customerData?.email) {
      res
        .status(400)
        .json(
          createErrorResponse(
            "Email requis",
            "L'email du client est obligatoire"
          )
        );
      return;
    }

    // 1. Récupérer le panier depuis cart-service
    let cart: CartPublicDTO;
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
          res
            .status(404)
            .json(
              createErrorResponse(
                "Panier introuvable",
                "Le panier n'existe pas pour cette session"
              )
            );
          return;
        }
        throw new Error(`Cart Service error: ${cartResponse.statusText}`);
      }

      const cartData = (await cartResponse.json()) as { cart: CartPublicDTO };
      cart = cartData.cart;

      if (!cart || !cart.items || cart.items.length === 0) {
        res
          .status(400)
          .json(createErrorResponse("Panier vide", "Votre panier est vide"));
        return;
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'appel au Cart Service:", error);
      res
        .status(500)
        .json(
          createErrorResponse(
            "Service de panier indisponible",
            "Veuillez réessayer plus tard"
          )
        );
      return;
    }

    // 2. Résoudre/créer le client via customer-service
    let customerId: number;
    try {
      const customerResponse = await fetch(
        `${SERVICES.customer}/api/customers/resolve-or-create`,
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
          error: "Erreur lors de la résolution/création du client",
          message:
            errorData.message || "Impossible de résoudre ou créer le client",
        });
        return;
      }

      const customerResponseData = (await customerResponse.json()) as {
        success: boolean;
        customerId: number;
      };
      customerId = customerResponseData.customerId;
    } catch (error) {
      console.error("❌ Erreur lors de l'appel au Customer Service:", error);
      res
        .status(500)
        .json(
          createErrorResponse(
            "Service client indisponible",
            "Veuillez réessayer plus tard"
          )
        );
      return;
    }

    // 3. Mapper les items du panier vers les items de paiement (mapping simple)
    const paymentItems = CheckoutMapper.cartItemsToPaymentItems(cart.items);

    // 4. Construire le payload PaymentCreateDTO
    const customerName = `${body.customerData.firstName || ""} ${
      body.customerData.lastName || ""
    }`.trim();
    const paymentCustomer: PaymentCustomer = {
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

    // 5. Appeler payment-service pour créer la session
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

      const paymentData = (await paymentResponse.json()) as {
        success: boolean;
        paymentUrl: string;
        payment?: any;
      };

      if (!paymentData.success || !paymentData.paymentUrl) {
        res
          .status(500)
          .json(
            createErrorResponse(
              "URL de paiement non reçue",
              "La session de paiement n'a pas retourné d'URL"
            )
          );
        return;
      }

      // 6. Retourner l'URL de redirection vers Stripe
      res.json({
        success: true,
        paymentUrl: paymentData.paymentUrl,
      });
    } catch (error) {
      console.error("❌ Erreur lors de l'appel au Payment Service:", error);
      res
        .status(500)
        .json(
          createErrorResponse(
            "Service de paiement indisponible",
            "Veuillez réessayer plus tard"
          )
        );
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'orchestration du checkout:", error);
    res
      .status(500)
      .json(
        createErrorResponse(
          "Erreur interne du serveur",
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors du traitement de votre commande"
        )
      );
  }
};
