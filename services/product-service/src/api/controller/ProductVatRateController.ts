/**
 * ProductVatRateController
 * Manage per-country VAT rates and price computation
 */

import { Request, Response } from "express";
import ProductService from "../../services/ProductService";
import { ResponseMapper } from "../mapper";

export class ProductVatRateController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  async listProductVatRates(req: Request, res: Response): Promise<void> {
    try {
      const productId = parseInt(req.params.id);
      const vatRates = await this.productService.listProductVatRates(productId);
      res.json({
        productId,
        vatRates: vatRates.map((r: any) => ({
          countryCode: r.countryCode,
          vatRate: r.vatRate,
        })),
      });
    } catch (error: any) {
      if (error.message === "Product not found") {
        res.status(404).json(ResponseMapper.notFoundError("Product"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  async upsertProductVatRates(req: Request, res: Response): Promise<void> {
    try {
      const productId = parseInt(req.params.id);
      const { vatRates } = req.body as {
        vatRates: { countryCode: string; vatRate: number }[];
      };
      const updated = await this.productService.upsertProductVatRates(
        productId,
        vatRates
      );
      res.json({
        message: "Taux de TVA mis à jour",
        productId,
        vatRates: updated.map((r: any) => ({
          countryCode: r.countryCode,
          vatRate: r.vatRate,
        })),
      });
    } catch (error: any) {
      if (error.message === "Product not found") {
        res.status(404).json(ResponseMapper.notFoundError("Product"));
        return;
      }
      if (error.message?.startsWith("Invalid")) {
        res.status(400).json(ResponseMapper.validationError(error.message));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  async deleteProductVatRate(req: Request, res: Response): Promise<void> {
    try {
      const productId = parseInt(req.params.id);
      const countryCode = (req.params.country || "").toUpperCase();
      const deleted = await this.productService.deleteProductVatRate(
        productId,
        countryCode
      );
      if (!deleted) {
        res.status(404).json(ResponseMapper.notFoundError("Product VAT rate"));
        return;
      }
      res.json(ResponseMapper.success("Taux de TVA supprimé"));
    } catch (error: any) {
      if (error.message === "Product not found") {
        res.status(404).json(ResponseMapper.notFoundError("Product"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }

  async getProductPrice(req: Request, res: Response): Promise<void> {
    try {
      const productId = parseInt(req.params.id);
      const countryCode = (
        req.query.country as string | undefined
      )?.toUpperCase();
      const { priceExcl, vatRate, priceIncl } =
        await this.productService.computePriceWithVat(productId, countryCode);
      res.json({ productId, priceExcl, vatRate, priceIncl, countryCode });
    } catch (error: any) {
      if (error.message === "Product not found") {
        res.status(404).json(ResponseMapper.notFoundError("Product"));
        return;
      }
      res.status(500).json(ResponseMapper.internalServerError());
    }
  }
}

export default ProductVatRateController;
