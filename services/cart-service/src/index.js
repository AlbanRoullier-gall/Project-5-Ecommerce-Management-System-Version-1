const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const { createClient } = require("redis");
const Joi = require("joi");
const morgan = require("morgan");
const axios = require("axios");
require("dotenv").config();

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
const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => console.log("Redis Client Error", err));
redis.connect();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Validation schemas
const cartItemSchema = Joi.object({
  productId: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required(),
});

// Helper function to get product details
async function getProductDetails(productId) {
  try {
    const response = await axios.get(
      `${
        process.env.PRODUCT_SERVICE_URL || "http://localhost:3002"
      }/api/products/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product details:", error.message);
    return null;
  }
}

// Helper function to calculate cart totals
function calculateCartTotals(items) {
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
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "cart-service" });
});

// Get cart
app.get("/api/cart", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const cartKey = `cart:${customerId}`;

    // Get cart from Redis
    const cartData = await redis.get(cartKey);
    let cart = cartData
      ? JSON.parse(cartData)
      : { items: [], totals: { totalHT: 0, totalTTC: 0, totalVAT: 0 } };

    // Update totals
    cart.totals = calculateCartTotals(cart.items);

    // Save updated cart
    await redis.set(cartKey, JSON.stringify(cart), "EX", 86400); // 24 hours

    res.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add item to cart
app.post("/api/cart/items", authenticateToken, async (req, res) => {
  try {
    const { error, value } = cartItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { productId, quantity } = value;
    const customerId = req.user.customerId;
    const cartKey = `cart:${customerId}`;

    // Get product details
    const product = await getProductDetails(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (!product.is_active) {
      return res.status(400).json({ error: "Product is not available" });
    }

    // Get current cart
    const cartData = await redis.get(cartKey);
    let cart = cartData ? JSON.parse(cartData) : { items: [] };

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const cartItem = {
        productId: product.id,
        name: product.name,
        unitPriceHT: product.price,
        vatRate: product.vat_rate,
        quantity: quantity,
        image:
          product.images && product.images.length > 0
            ? product.images[0].file_path
            : null,
      };
      cart.items.push(cartItem);
    }

    // Calculate totals
    cart.totals = calculateCartTotals(cart.items);

    // Save cart to Redis
    await redis.set(cartKey, JSON.stringify(cart), "EX", 86400); // 24 hours

    res.json({
      message: "Item added to cart successfully",
      cart: cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update item quantity
app.put("/api/cart/items/:productId", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    const customerId = req.user.customerId;
    const cartKey = `cart:${customerId}`;

    // Get current cart
    const cartData = await redis.get(cartKey);
    if (!cartData) {
      return res.status(404).json({ error: "Cart not found" });
    }

    let cart = JSON.parse(cartData);

    // Find and update item
    const itemIndex = cart.items.findIndex(
      (item) => item.productId === parseInt(productId)
    );
    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;

    // Calculate totals
    cart.totals = calculateCartTotals(cart.items);

    // Save cart to Redis
    await redis.set(cartKey, JSON.stringify(cart), "EX", 86400); // 24 hours

    res.json({
      message: "Item updated successfully",
      cart: cart,
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove item from cart
app.delete(
  "/api/cart/items/:productId",
  authenticateToken,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const customerId = req.user.customerId;
      const cartKey = `cart:${customerId}`;

      // Get current cart
      const cartData = await redis.get(cartKey);
      if (!cartData) {
        return res.status(404).json({ error: "Cart not found" });
      }

      let cart = JSON.parse(cartData);

      // Remove item
      cart.items = cart.items.filter(
        (item) => item.productId !== parseInt(productId)
      );

      // Calculate totals
      cart.totals = calculateCartTotals(cart.items);

      // Save cart to Redis
      await redis.set(cartKey, JSON.stringify(cart), "EX", 86400); // 24 hours

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
app.delete("/api/cart", authenticateToken, async (req, res) => {
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
app.post("/api/cart/checkout", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const cartKey = `cart:${customerId}`;

    // Get current cart
    const cartData = await redis.get(cartKey);
    if (!cartData) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const cart = JSON.parse(cartData);

    if (cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Create order via Order Service
    const orderData = {
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
            Authorization: req.headers.authorization,
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
      console.error("Order creation error:", orderError.message);
      res.status(500).json({ error: "Failed to create order" });
    }
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Cart Service running on port ${PORT}`);
});
