/**
 * Handler pour l'orchestration complète du checkout
 * Orchestre les appels aux services (pas de logique métier)
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";
import { extractCartSessionId } from "../middleware/cart-session";
// Type CartPublicDTO défini localement pour éviter les problèmes de résolution TypeScript
interface CartPublicDTO {
  id: string;
  sessionId: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  vatBreakdown: Array<{ rate: number; amount: number }>;
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
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

/**
 * Interface pour les données de checkout reçues du frontend
 * Note: Les données checkout (customerData, addressData) sont maintenant récupérées depuis le cart-service
 * Le frontend envoie uniquement les URLs de redirection
 */
interface CheckoutCompleteRequest {
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

    // Extraire le cartSessionId du header X-Cart-Session-ID
    const cartSessionId =
      extractCartSessionId(req) || (req as any).cartSessionId;

    // Validation HTTP basique (pas de logique métier)
    if (!cartSessionId) {
      res
        .status(400)
        .json(
          createErrorResponse(
            "cartSessionId requis",
            "L'identifiant de session du panier est obligatoire. Le cookie de session doit être présent."
          )
        );
      return;
    }

    if (!body.successUrl || !body.cancelUrl) {
      res
        .status(400)
        .json(
          createErrorResponse(
            "URLs requises",
            "Les URLs de succès et d'annulation sont obligatoires"
          )
        );
      return;
    }

    // 1. Récupérer le panier et les données checkout depuis cart-service
    let cart: CartPublicDTO;
    let checkoutData: {
      customerData?: {
        firstName?: string;
        lastName?: string;
        email: string;
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
    } | null = null;

    try {
      // Récupérer le panier (contient items + checkoutData)
      const cartResponse = await fetch(
        `${SERVICES.cart}/api/cart?sessionId=${cartSessionId}`,
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

      // Vérifier que les données checkout sont présentes
      checkoutData = cart.checkoutData || null;
      if (!checkoutData || !checkoutData.customerData?.email) {
        res
          .status(400)
          .json(
            createErrorResponse(
              "Données checkout manquantes",
              "Veuillez compléter vos informations de checkout avant de finaliser la commande"
            )
          );
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
    // IMPORTANT: On résout le client ici pour garantir qu'il existe avant le paiement
    // Le customerId sera stocké dans les métadonnées Stripe pour éviter la double résolution
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
          body: JSON.stringify(checkoutData.customerData),
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

    // 3. Appeler payment-service pour créer la session Stripe
    // Le service fait maintenant la transformation des items en interne
    try {
      const paymentResponse = await fetch(
        `${SERVICES.payment}/api/payment/create-from-cart-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Service-Request": "api-gateway",
          },
          body: JSON.stringify({
            cart: {
              items: cart.items,
            },
            checkoutData: {
              customerData: checkoutData.customerData,
            },
            successUrl: body.successUrl,
            cancelUrl: body.cancelUrl,
            metadata: {
              customerId: customerId.toString(),
              cartSessionId: cartSessionId,
            },
          }),
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
