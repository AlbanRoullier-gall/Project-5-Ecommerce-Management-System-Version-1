/**
 * Handlers pour les routes de paiement
 * Orchestre les appels aux services (pas de logique métier)
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";
import { proxyRequest } from "../proxy";
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
    const { csid } = req.body || {};

    // Extraire le cartSessionId du cookie (via le middleware)
    const cartSessionId =
      extractCartSessionId(req) || (req as any).cartSessionId;

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
            "L'identifiant de session du panier est obligatoire. Le cookie de session doit être présent."
          )
        );
    }

    // 1. Récupérer la session de paiement depuis payment-service
    // Le service extrait maintenant les métadonnées en interne
    let paymentIntentId: string | undefined;
    let customerId: number | undefined;

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

      if (!paymentResponse.ok) {
        return res
          .status(404)
          .json(
            createErrorResponse(
              "Session de paiement introuvable",
              "La session de paiement Stripe n'existe pas"
            )
          );
      }

      const paymentResponseData = (await paymentResponse.json()) as {
        success: boolean;
        session: any; // Stripe.Checkout.Session
        paymentIntentId?: string;
        metadata?: {
          customerId?: number;
          paymentIntentId?: string;
          cartSessionId?: string;
        };
      };

      paymentIntentId =
        paymentResponseData.paymentIntentId ||
        paymentResponseData.metadata?.paymentIntentId;
      customerId = paymentResponseData.metadata?.customerId;

      // Le customerId est TOUJOURS dans les métadonnées (garanti par checkout-complete)
      if (!customerId) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Données de session invalides",
              "Le customerId est manquant dans les métadonnées de paiement"
            )
          );
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'appel au Payment Service:", error);
      return res
        .status(500)
        .json(
          createErrorResponse(
            "Service de paiement indisponible",
            "Veuillez réessayer plus tard"
          )
        );
    }

    // 2. Récupérer le panier et les données checkout depuis cart-service
    // Tout est dans le panier : items, totaux, et checkoutData
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

      // Vérifier que les données checkout sont présentes
      if (!cart.checkoutData || !cart.checkoutData.customerData?.email) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "Données checkout manquantes",
              "Les données de checkout sont obligatoires"
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

    // 3. Ajouter les adresses au customer-service AVANT la création de la commande (bloquant)
    // Utilise le nouvel endpoint qui gère shipping + billing en une fois
    // Cette étape doit réussir avant de créer la commande pour garantir la cohérence des données
    const checkoutData = cart.checkoutData;
    if (customerId && checkoutData?.addressData) {
      try {
        const addressResponse = await fetch(
          `${SERVICES.customer}/api/customers/${customerId}/addresses/bulk`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Service-Request": "api-gateway",
            },
            body: JSON.stringify({
              shipping: checkoutData.addressData.shipping,
              billing: checkoutData.addressData.billing,
              useSameBillingAddress:
                checkoutData.addressData.useSameBillingAddress,
            }),
          }
        );

        if (!addressResponse.ok) {
          const addressError = (await addressResponse.json()) as any;
          console.error(
            `❌ Customer Service error (adresses): ${addressError.message}`
          );
          return res
            .status(500)
            .json(
              createErrorResponse(
                "Erreur lors de l'enregistrement des adresses",
                addressError.message ||
                  "Impossible d'enregistrer les adresses de livraison et de facturation"
              )
            );
        }
      } catch (error) {
        console.error(
          "❌ Erreur lors de l'appel au Customer Service (adresses):",
          error
        );
        return res
          .status(500)
          .json(
            createErrorResponse(
              "Service client indisponible",
              "Impossible d'enregistrer les adresses. Veuillez réessayer plus tard."
            )
          );
      }
    }

    // 4. Appeler order-service pour créer la commande
    // Le service construit maintenant le payload en interne depuis le panier avec checkoutData
    // Les adresses sont maintenant garanties d'être enregistrées avant cette étape
    let orderId: number;

    try {
      const orderResponse = await fetch(
        `${SERVICES.order}/api/orders/create-from-cart-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Service-Request": "api-gateway",
          },
          body: JSON.stringify({
            cart,
            customerId, // Garanti depuis les métadonnées Stripe
            paymentIntentId,
            paymentMethod: "stripe",
          }),
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

    // 5. Décrémenter le stock de chaque produit commandé (bloquant)
    // Cette étape doit réussir pour garantir la cohérence des données
    try {
      const stockUpdatePromises = cart.items.map(async (item: any) => {
        // Ajouter un timeout pour éviter les blocages (10 secondes par produit)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const stockResponse = await fetch(
            `${SERVICES.product}/api/products/${item.productId}/decrement-stock`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Service-Request": "api-gateway",
              },
              body: JSON.stringify({
                quantity: item.quantity,
              }),
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (!stockResponse.ok) {
            const stockError = (await stockResponse.json()) as any;
            throw new Error(
              `Erreur lors de la décrémentation du stock pour le produit ${
                item.productId
              }: ${
                stockError.message || stockError.error || "Stock insuffisant"
              }`
            );
          }

          return stockResponse.json();
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === "AbortError") {
            throw new Error(
              `Timeout lors de la décrémentation du stock pour le produit ${item.productId}`
            );
          }
          throw fetchError;
        }
      });

      await Promise.all(stockUpdatePromises);
      console.log("✅ Stock décrémenté pour tous les produits");
    } catch (error) {
      console.error("❌ Erreur lors de la décrémentation du stock:", error);
      // En cas d'erreur, on retourne une erreur car la commande a été créée
      // mais le stock n'a pas été décrémenté - cela nécessite une intervention manuelle
      return res
        .status(500)
        .json(
          createErrorResponse(
            "Erreur lors de la mise à jour du stock",
            (error as any)?.message ||
              "La commande a été créée mais le stock n'a pas pu être mis à jour. Veuillez contacter le support."
          )
        );
    }

    // 6. Appeler email-service pour envoyer l'email de confirmation (non-bloquant)
    // email-service construit les données à partir des données brutes
    // SIMPLIFICATION : Utiliser directement checkoutData depuis le panier
    try {
      const emailResponse = await fetch(
        `${SERVICES.email}/api/email/order-confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Service-Request": "api-gateway",
          },
          body: JSON.stringify({
            orderId,
            cart,
            customerData: checkoutData?.customerData || {},
            addressData: checkoutData?.addressData || {},
          }),
        }
      );

      if (!emailResponse.ok) {
        console.error("⚠️ Email Service error - email non envoyé");
      }
    } catch (error) {
      console.warn("⚠️ Erreur lors de l'envoi de l'email:", error);
    }

    // 7. Vider le panier et les données checkout après création réussie (non-bloquant)
    // Le panier sera vidé automatiquement, ce qui supprime aussi les données checkout
    try {
      const clearCartResponse = await fetch(`${SERVICES.cart}/api/cart`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Request": "api-gateway",
        },
        body: JSON.stringify({ sessionId: cartSessionId }),
      });

      if (!clearCartResponse.ok) {
        console.warn(
          "⚠️ Erreur lors du vidage du panier:",
          clearCartResponse.statusText
        );
      } else {
        console.log("✅ Panier et données checkout vidés avec succès");
      }
    } catch (error) {
      console.warn("⚠️ Erreur lors du vidage du panier:", error);
      // Ne pas bloquer la réponse - la commande est déjà créée
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
