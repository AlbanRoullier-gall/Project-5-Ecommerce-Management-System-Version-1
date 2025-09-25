import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import { createClient, RedisClientType } from "redis";
import Joi from "joi";
import morgan from "morgan";
import axios from "axios";
import dotenv from "dotenv";

import {
  AuthenticatedRequest,
  Cart,
  CartItem,
  CartTotals,
  Product,
  CartItemRequest,
  OrderData,
} from "./types";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Redis connection
const redis: RedisClientType = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err: Error) => console.log("Redis Client Error", err));
redis.connect();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// Authentication middleware
const authenticateToken = (
  req: any,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token =
    authHeader && typeof authHeader === "string"
      ? authHeader.split(" ")[1]
      : undefined;

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      res.status(403).json({ error: "Invalid or expired token" });
      return;
    }
    req.user = user as AuthenticatedRequest["user"];
    next();
  });
};

// Validation schemas
const cartItemSchema = Joi.object({
  productId: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required(),
});

// Helper function to get product details
async function getProductDetails(productId: number): Promise<Product | null> {
  try {
    const response = await axios.get<Product>(
      `${
        process.env.PRODUCT_SERVICE_URL || "http://localhost:3002"
      }/api/products/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product details:", error);
    return null;
  }
}

// Helper function to calculate cart totals
function calculateCartTotals(items: CartItem[]): CartTotals {
  let totalHT = 0;
  let totalTTC = 0;
  let totalVAT = 0;

  items.forEach((item) => {
    const itemTotalHT = item.unitPriceHT * item.quantity;
    const itemVAT = itemTotalHT * (item.vatRate / 100);
    const itemTotalTTC = itemTotalHT + itemVAT;

    totalHT += itemTotalHT;
    totalTTC += itemTotalTTC;
    totalVAT += itemVAT;
  });

  return {
    totalHT: Math.round(totalHT * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100,
    totalVAT: Math.round(totalVAT * 100) / 100,
  };
}

// Routes

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", service: "cart-service" });
});

// Get cart
app.get("/api/cart", authenticateToken, async (req: any, res: Response) => {
  try {
    const customerId = req.user.customerId;
    const cartKey = `cart:${customerId}`;

    // Get cart from Redis
    const cartData = await redis.get(cartKey);
    let cart: Cart = cartData
      ? JSON.parse(cartData)
      : { items: [], totals: { totalHT: 0, totalTTC: 0, totalVAT: 0 } };

    // Update totals
    cart.totals = calculateCartTotals(cart.items);

    // Save updated cart
    await redis.set(cartKey, JSON.stringify(cart), { EX: 86400 }); // 24 hours

    res.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add item to cart
app.post(
  "/api/cart/items",
  authenticateToken,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { error, value } = cartItemSchema.validate(req.body);
      if (error) {
        res
          .status(400)
          .json({ error: error.details[0]?.message || "Validation error" });
        return;
      }

      const { productId, quantity } = value as CartItemRequest;
      const customerId = req.user.customerId;
      const cartKey = `cart:${customerId}`;

      // Get product details
      const product = await getProductDetails(productId);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      if (!product.is_active) {
        res.status(400).json({ error: "Product is not available" });
        return;
      }

      // Get current cart
      const cartData = await redis.get(cartKey);
      let cart: Cart = cartData
        ? JSON.parse(cartData)
        : { items: [], totals: { totalHT: 0, totalTTC: 0, totalVAT: 0 } };

      // Check if item already exists
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex >= 0) {
        // Update quantity
        cart.items[existingItemIndex]!.quantity += quantity;
      } else {
        // Add new item
        const cartItem: CartItem = {
          productId: product.id,
          name: product.name,
          unitPriceHT: product.price,
          vatRate: product.vat_rate,
          quantity: quantity,
          image:
            product.images && product.images.length > 0
              ? product.images[0]?.file_path || null
              : null,
        };
        cart.items.push(cartItem);
      }

      // Calculate totals
      cart.totals = calculateCartTotals(cart.items);

      // Save cart to Redis
      await redis.set(cartKey, JSON.stringify(cart), { EX: 86400 }); // 24 hours

      res.json({
        message: "Item added to cart successfully",
        cart: cart,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update item quantity
app.put(
  "/api/cart/items/:productId",
  authenticateToken,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        res.status(400).json({ error: "Quantity must be at least 1" });
        return;
      }

      const customerId = req.user.customerId;
      const cartKey = `cart:${customerId}`;

      // Get current cart
      const cartData = await redis.get(cartKey);
      if (!cartData) {
        res.status(404).json({ error: "Cart not found" });
        return;
      }

      let cart: Cart = JSON.parse(cartData);

      // Find and update item
      const itemIndex = cart.items.findIndex(
        (item) => item.productId === parseInt(productId || "0")
      );
      if (itemIndex === -1) {
        res.status(404).json({ error: "Item not found in cart" });
        return;
      }

      if (cart.items[itemIndex]) {
        cart.items[itemIndex]!.quantity = quantity;
      }

      // Calculate totals
      cart.totals = calculateCartTotals(cart.items);

      // Save cart to Redis
      await redis.set(cartKey, JSON.stringify(cart), { EX: 86400 }); // 24 hours

      res.json({
        message: "Item updated successfully",
        cart: cart,
      });
    } catch (error) {
      console.error("Update cart item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Remove item from cart
app.delete(
  "/api/cart/items/:productId",
  authenticateToken,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;
      const customerId = req.user.customerId;
      const cartKey = `cart:${customerId}`;

      // Get current cart
      const cartData = await redis.get(cartKey);
      if (!cartData) {
        res.status(404).json({ error: "Cart not found" });
        return;
      }

      let cart: Cart = JSON.parse(cartData);

      // Remove item
      cart.items = cart.items.filter(
        (item) => item.productId !== parseInt(productId || "0")
      );

      // Calculate totals
      cart.totals = calculateCartTotals(cart.items);

      // Save cart to Redis
      await redis.set(cartKey, JSON.stringify(cart), { EX: 86400 }); // 24 hours

      res.json({
        message: "Item removed from cart successfully",
        cart: cart,
      });
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Clear cart
app.delete("/api/cart", authenticateToken, async (req: any, res: Response) => {
  try {
    const customerId = req.user.customerId;
    const cartKey = `cart:${customerId}`;

    await redis.del(cartKey);

    res.json({
      message: "Cart cleared successfully",
      cart: { items: [], totals: { totalHT: 0, totalTTC: 0, totalVAT: 0 } },
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Checkout cart (create order)
app.post(
  "/api/cart/checkout",
  authenticateToken,
  async (req: any, res: Response): Promise<void> => {
    try {
      const customerId = req.user.customerId;
      const cartKey = `cart:${customerId}`;

      // Get current cart
      const cartData = await redis.get(cartKey);
      if (!cartData) {
        res.status(404).json({ error: "Cart not found" });
        return;
      }

      const cart: Cart = JSON.parse(cartData);

      if (cart.items.length === 0) {
        res.status(400).json({ error: "Cart is empty" });
        return;
      }

      // Create order via Order Service
      const orderData: OrderData = {
        customerId: customerId,
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPriceHT: item.unitPriceHT,
          vatRate: item.vatRate,
        })),
        totals: cart.totals,
      };

      try {
        const orderResponse = await axios.post(
          `${
            process.env.ORDER_SERVICE_URL || "http://localhost:3003"
          }/api/orders`,
          orderData,
          {
            headers: {
              Authorization: req.headers.authorization as string,
              "Content-Type": "application/json",
            },
          }
        );

        // Clear cart after successful order creation
        await redis.del(cartKey);

        res.json({
          message: "Order created successfully",
          order: orderResponse.data.order,
        });
      } catch (orderError) {
        console.error("Order creation error:", orderError);
        res.status(500).json({ error: "Failed to create order" });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Cart Service running on port ${PORT}`);
});
