/**
 * Handlers pour les routes de paiement
 * Orchestre les appels aux services (pas de logique métier)
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";
import { proxyRequest } from "../proxy";

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

export const handleFinalizePayment = async (
  req: Request,
  res: Response
) => {
  console.log(
    `[Payment Finalize Handler] ✅ Handler appelé pour ${req.method} ${req.path}`
  );
  try {
    console.log("[Payment Finalize] Début de la finalisation du paiement");
    const { csid } = req.body || {};
    console.log(
      `[Payment Finalize] csid reçu: ${
        csid ? csid.substring(0, 20) + "..." : "aucun"
      }`
    );

    // Le cartSessionId est déjà extrait par le middleware cartSessionMiddleware
    // et ajouté à req.cartSessionId
    const cartSessionId = (req as any).cartSessionId;
    console.log(
      `[Payment Finalize] cartSessionId: ${
        cartSessionId ? cartSessionId.substring(0, 20) + "..." : "aucun"
      }`
    );

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
      console.log(
        `[Payment Finalize] Étape 1: Récupération de la session Stripe: ${csid}`
      );
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

      console.log(
        `[Payment Finalize] Session récupérée - customerId: ${customerId}, paymentIntentId: ${
          paymentIntentId?.substring(0, 20) || "aucun"
        }...`
      );

      // Le customerId est TOUJOURS dans les métadonnées (garanti par checkout-complete)
      if (!customerId) {
        console.error(
          `[Payment Finalize] ❌ customerId manquant dans les métadonnées`
        );
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
      console.log(
        `[Payment Finalize] Étape 2: Récupération du panier avec sessionId: ${cartSessionId.substring(
          0,
          20
        )}...`
      );
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

      console.log(
        `[Payment Finalize] Panier récupéré: ${
          cart?.items?.length || 0
        } articles`
      );

      if (!cart || !cart.items || cart.items.length === 0) {
        console.error(`[Payment Finalize] ❌ Panier vide`);
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
      console.log(
        `[Payment Finalize] Étape 3: Enregistrement des adresses pour customerId: ${customerId}`
      );
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

    console.log(
      `[Payment Finalize] Étape 4: Création de la commande pour customerId: ${customerId}`
    );
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
        console.error(
          `[Payment Finalize] ❌ Order ID non retourné par le service`
        );
        throw new Error("Order ID non retourné par le service");
      }

      console.log(
        `[Payment Finalize] ✅ Commande créée avec succès: orderId=${orderId}`
      );
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
      console.log(
        `[Payment Finalize] ✅ Stock décrémenté pour tous les produits`
      );
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

    // 6. Vider le panier et les données checkout IMMÉDIATEMENT après création réussie (BLOQUANT)
    // PRIORITÉ: Vider le panier en premier pour que l'utilisateur voie le résultat rapidement
    // IMPORTANT: Le vidage est maintenant bloquant pour garantir qu'il soit exécuté
    // Utiliser un timeout pour éviter de bloquer trop longtemps
    console.log(
      `[Payment Finalize] Étape 6: Vidage du panier (BLOQUANT avec timeout de 3 secondes)`
    );
    console.log(
      `[Payment Finalize] cartSessionId pour vidage: ${cartSessionId.substring(
        0,
        20
      )}...`
    );
    console.log(
      `[Payment Finalize] URL du service cart: ${SERVICES.cart}/api/cart`
    );

    try {
      const clearCartUrl = `${SERVICES.cart}/api/cart`;
      const clearCartBody = JSON.stringify({ sessionId: cartSessionId });

      console.log(
        `[Payment Finalize] Envoi de la requête DELETE vers: ${clearCartUrl}`
      );

      // Créer un AbortController pour le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 3000); // Timeout de 3 secondes (le vidage est généralement rapide)

      const clearCartResponse = await fetch(clearCartUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Request": "api-gateway",
        },
        body: clearCartBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await clearCartResponse.text();
      console.log(
        `[Payment Finalize] Réponse du vidage du panier: status=${
          clearCartResponse.status
        }, body=${responseText.substring(0, 200)}`
      );

      if (!clearCartResponse.ok) {
        console.error(
          `[Payment Finalize] ❌ Erreur lors du vidage du panier: status=${clearCartResponse.status}, ${clearCartResponse.statusText}`
        );
        // Ne pas bloquer la réponse même si le vidage échoue - la commande est déjà créée
        // Mais loguer l'erreur pour investigation
      } else {
        console.log(
          `[Payment Finalize] ✅ Panier et données checkout vidés avec succès`
        );
        // Note: Pas de vérification supplémentaire nécessaire car le vidage est bloquant
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.error(
          `[Payment Finalize] ❌ Timeout de 3s atteint lors du vidage du panier`
        );
        // Ne pas bloquer la réponse même en cas de timeout - la commande est déjà créée
      } else {
        console.error(
          `[Payment Finalize] ❌ Erreur lors du vidage du panier:`,
          error
        );
        // Ne pas bloquer la réponse même si le vidage échoue - la commande est déjà créée
      }
    }

    // Envoyer la réponse immédiatement après le vidage du panier
    // L'envoi d'email sera fait en arrière-plan (non-bloquant)
    console.log(
      `[Payment Finalize] ✅ Finalisation complète - orderId: ${orderId}`
    );

    // Envoyer la réponse HTTP immédiatement
    res.status(200).json({
      success: true,
      orderId,
      message: "Paiement finalisé avec succès",
      timestamp: new Date().toISOString(),
    });

    // 7. Appeler email-service pour envoyer l'email de confirmation (NON-BLOQUANT)
    // IMPORTANT: L'envoi de l'email est maintenant non-bloquant pour ne pas retarder la réponse
    // L'email sera envoyé en arrière-plan après que la réponse HTTP soit déjà partie
    // email-service construit les données à partir des données brutes
    // SIMPLIFICATION : Utiliser directement checkoutData depuis le panier
    console.log(
      `[Payment Finalize] Étape 7: Envoi de l'email de confirmation (NON-BLOQUANT en arrière-plan)`
    );

    // Vérifier que les données nécessaires sont présentes
    const customerEmail = checkoutData?.customerData?.email;
    if (!customerEmail) {
      console.error(
        `[Payment Finalize] ❌ EMAIL MANQUANT: customerData.email est absent ou vide`
      );
      console.error(
        `[Payment Finalize] checkoutData:`,
        JSON.stringify(checkoutData, null, 2)
      );
      return; // Ne pas essayer d'envoyer l'email si l'email est manquant
    } else {
      console.log(`[Payment Finalize] 📧 Email du client: ${customerEmail}`);
    }

    if (!cart?.items || cart.items.length === 0) {
      console.error(
        `[Payment Finalize] ❌ CART VIDE: Le panier n'a pas d'articles`
      );
      return; // Ne pas essayer d'envoyer l'email si le panier est vide
    } else {
      console.log(
        `[Payment Finalize] 📦 Panier contient ${cart.items.length} article(s)`
      );
    }

    // Lancer l'envoi d'email en arrière-plan (fire-and-forget)
    // Ne pas utiliser await pour ne pas bloquer
    (async () => {
      try {
        const emailUrl = `${SERVICES.email}/api/email/order-confirmation`;
        const customerData = checkoutData?.customerData || {
          email: customerEmail,
          firstName: checkoutData?.customerData?.firstName,
          lastName: checkoutData?.customerData?.lastName,
        };
        const emailPayload = {
          orderId,
          cart,
          customerData,
          addressData: checkoutData?.addressData || {},
        };

        // Log des données envoyées (sans les détails complets du cart pour éviter les logs trop longs)
        console.log(
          `[Payment Finalize] 📧 Données email à envoyer:`,
          JSON.stringify(
            {
              orderId: emailPayload.orderId,
              customerEmail: customerData.email,
              customerFirstName: customerData.firstName,
              customerLastName: customerData.lastName,
              cartItemsCount: emailPayload.cart?.items?.length || 0,
              cartTotal: emailPayload.cart?.total,
              hasAddressData: !!emailPayload.addressData,
            },
            null,
            2
          )
        );

        const emailBody = JSON.stringify(emailPayload);

        console.log(
          `[Payment Finalize] Envoi de la requête POST vers: ${emailUrl} (en arrière-plan)`
        );

        // Créer un AbortController pour le timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 30000); // Timeout de 30 secondes (plus généreux car non-bloquant)

        const emailResponse = await fetch(emailUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Service-Request": "api-gateway",
          },
          body: emailBody,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseText = await emailResponse.text();
        console.log(
          `[Payment Finalize] Réponse de l'envoi d'email: status=${
            emailResponse.status
          }, body=${responseText.substring(0, 500)}`
        );

        if (!emailResponse.ok) {
          console.error(
            `[Payment Finalize] ❌ Erreur lors de l'envoi de l'email: status=${emailResponse.status}, ${emailResponse.statusText}`
          );
          console.error(
            `[Payment Finalize] ❌ Réponse complète du service email: ${responseText}`
          );
        } else {
          try {
            const emailResponseData = JSON.parse(responseText);
            console.log(
              `[Payment Finalize] ✅ Email de confirmation envoyé avec succès (en arrière-plan)`
            );
            console.log(
              `[Payment Finalize] ✅ MessageId: ${
                emailResponseData.messageId || "N/A"
              }`
            );
          } catch (parseError) {
            console.log(
              `[Payment Finalize] ✅ Email de confirmation envoyé (réponse non-JSON, en arrière-plan)`
            );
          }
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.error(
            `[Payment Finalize] ❌ Timeout de 30s atteint lors de l'envoi de l'email (en arrière-plan)`
          );
        } else {
          console.error(
            `[Payment Finalize] ❌ Erreur lors de l'envoi de l'email (en arrière-plan):`,
            error
          );
        }
      }
    })(); // IIFE (Immediately Invoked Function Expression) pour exécuter en arrière-plan
    return; // Retour explicite après avoir lancé l'envoi d'email en arrière-plan
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
