/**
 * Handler pour l'orchestration complète du checkout
 * Orchestre les appels aux services (pas de logique métier)
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";
import { CartPublicDTO } from "../../../../shared-types/cart-service";
import { extractCartSessionId } from "../middleware/cart-session";

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

    // 3. Construire le payload pour payment-service
    // SIMPLIFICATION : On n'envoie que ce qui est nécessaire pour Stripe
    // - Les items transformés (name, price, quantity)
    // - L'email du client (pour customer_email Stripe)
    // - Les métadonnées (customerId, cartSessionId)
    // Le panier complet et checkoutData ne sont pas nécessaires ici
    // (ils seront récupérés dans payment-finalize depuis cart-service)

    // Transformer les items du panier en format Stripe
    const stripeItems = cart.items.map((item) => ({
      name: item.productName,
      description: item.description || "",
      price: Math.round(item.unitPriceTTC * 100), // Conversion en centimes
      quantity: item.quantity,
      currency: "eur",
    }));

    // Construire le nom du client depuis customerData
    const customerName = checkoutData.customerData
      ? `${checkoutData.customerData.firstName || ""} ${
          checkoutData.customerData.lastName || ""
        }`.trim()
      : "";

    const paymentPayload = {
      items: stripeItems,
      customer: {
        email: checkoutData.customerData!.email,
        name: customerName,
        phone: checkoutData.customerData?.phoneNumber || "",
      },
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
      metadata: {
        customerId: customerId.toString(), // TOUJOURS présent dans les métadonnées
        cartSessionId: cartSessionId,
      },
    };

    // 4. Appeler payment-service pour créer la session Stripe
    // SIMPLIFICATION : Utilise l'endpoint /api/payment/create directement
    // avec les items transformés (au lieu de /api/payment/create-from-cart avec le panier complet)
    try {
      const paymentResponse = await fetch(
        `${SERVICES.payment}/api/payment/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Service-Request": "api-gateway",
          },
          body: JSON.stringify(paymentPayload),
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
