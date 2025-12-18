/**
 * Handler pour vérifier le stock d'un produit
 * Orchestre l'appel au product-service via l'API Gateway
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";

/**
 * Vérifie le stock disponible d'un produit
 * GET /api/stock/check/:productId?quantity=5
 */
export async function handleCheckStock(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { productId } = req.params;
    const quantity =
      parseInt((req.query["quantity"] as string) || "1", 10) || 1;

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

    // Appeler le product-service pour récupérer le produit
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

    // Vérifier le stock disponible
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
