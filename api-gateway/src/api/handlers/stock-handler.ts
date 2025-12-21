/**
 * Handler pour vérifier et réserver le stock d'un produit
 * Orchestre l'appel au product-service via l'API Gateway
 *
 * Si sessionId est fourni, réserve le stock de manière atomique
 * Sinon, vérifie uniquement le stock disponible
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";

/**
 * Vérifie ou réserve le stock disponible d'un produit
 * GET /api/stock/check/:productId?quantity=5&sessionId=xxx
 *
 * Si sessionId est fourni, réserve le stock atomiquement
 * Sinon, vérifie uniquement le stock disponible
 */
export async function handleCheckStock(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { productId } = req.params;
    const quantity =
      parseInt((req.query["quantity"] as string) || "1", 10) || 1;
    const sessionId = req.query["sessionId"] as string | undefined;

    if (!productId) {
      res.status(400).json({
        success: false,
        error: "productId est requis",
      });
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      res.status(400).json({
        success: false,
        error: "quantity doit être un nombre positif",
      });
      return;
    }

    // Si sessionId est fourni, réserver le stock de manière atomique
    if (sessionId) {
      try {
        const reserveResponse = await fetch(
          `${SERVICES.product}/api/stock/reserve`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: parseInt(productId, 10),
              quantity,
              sessionId,
              ttlMinutes: 30, // Réservation valide 30 minutes
            }),
          }
        );

        if (!reserveResponse.ok) {
          const errorData = (await reserveResponse
            .json()
            .catch(() => ({}))) as any;
          const errorMessage =
            errorData.error || "Erreur lors de la réservation du stock";

          // Si stock insuffisant, retourner une erreur claire
          if (
            reserveResponse.status === 400 &&
            (errorMessage.includes("Stock insuffisant") ||
              errorMessage.includes("non trouvé") ||
              errorMessage.includes("plus disponible"))
          ) {
            res.status(400).json({
              success: false,
              error: errorMessage,
              available: false,
            });
            return;
          }

          res.status(reserveResponse.status).json({
            success: false,
            error: errorMessage,
          });
          return;
        }

        const reservationData = (await reserveResponse.json()) as any;
        const reservation = reservationData.data?.reservation;

        if (!reservation) {
          res.status(500).json({
            success: false,
            error: "Erreur lors de la réservation du stock",
          });
          return;
        }

        // Retourner les informations de réservation
        res.status(200).json({
          success: true,
          data: {
            productId: parseInt(productId, 10),
            availableStock: reservation.availableStock,
            requestedQuantity: quantity,
            isAvailable: true,
            reservationId: reservation.id,
            expiresAt: reservation.expiresAt,
            message: `Stock réservé: ${reservation.availableStock} disponibles`,
          },
        });
        return;
      } catch (error: any) {
        console.error("Erreur lors de la réservation du stock:", error);
        res.status(500).json({
          success: false,
          error: "Erreur lors de la réservation du stock",
        });
        return;
      }
    }

    // Sinon, vérifier uniquement le stock disponible (comportement legacy)
    const productResponse = await fetch(
      `${SERVICES.product}/api/products/${productId}`
    );

    if (!productResponse.ok) {
      if (productResponse.status === 404) {
        res.status(404).json({
          success: false,
          error: `Produit ${productId} non trouvé`,
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: "Erreur lors de la récupération du produit",
      });
      return;
    }

    const productData = (await productResponse.json()) as any;
    const product = productData.data?.product;

    if (!product) {
      res.status(404).json({
        success: false,
        error: `Produit ${productId} non trouvé`,
      });
      return;
    }

    // Vérifier si le produit est actif
    if (!product.isActive) {
      res.status(400).json({
        success: false,
        error: "Ce produit n'est plus disponible",
        available: false,
      });
      return;
    }

    // Obtenir le stock disponible (stock réel - réservations actives)
    try {
      const availableStockResponse = await fetch(
        `${SERVICES.product}/api/stock/available/${productId}`
      );

      if (availableStockResponse.ok) {
        const availableData = (await availableStockResponse.json()) as any;
        const availableStock =
          availableData.data?.availableStock ?? product.stock ?? 0;
        const isAvailable = availableStock >= quantity;

        res.status(200).json({
          success: true,
          data: {
            productId: parseInt(productId, 10),
            availableStock,
            requestedQuantity: quantity,
            isAvailable,
            message: isAvailable
              ? `Stock disponible: ${availableStock}`
              : "Stock insuffisant",
          },
        });
        return;
      }
    } catch (error) {
      console.warn(
        "Impossible de récupérer le stock disponible, utilisation du stock brut"
      );
    }

    // Fallback: utiliser le stock brut si l'endpoint de stock disponible échoue
    const availableStock = product.stock ?? 0;
    const isAvailable = availableStock >= quantity;

    res.status(200).json({
      success: true,
      data: {
        productId: parseInt(productId, 10),
        availableStock,
        requestedQuantity: quantity,
        isAvailable,
        message: isAvailable
          ? `Stock disponible: ${availableStock}`
          : "Stock insuffisant",
      },
    });
  } catch (error: any) {
    console.error("Check stock error:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la vérification du stock",
    });
  }
}
