const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const Joi = require("joi");
const morgan = require("morgan");
const axios = require("axios");
const Stripe = require("stripe");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3003;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Stripe configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize services
const OrderService = require("./services/OrderService");
const orderService = new OrderService(pool);

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

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Validation schemas
const orderSchema = Joi.object({
  customerId: Joi.number().integer().required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().integer().required(),
        quantity: Joi.number().integer().min(1).required(),
        unitPriceHT: Joi.number().positive().precision(2).required(),
        vatRate: Joi.number().min(0).max(100).precision(2).required(),
      })
    )
    .min(1)
    .required(),
  totals: Joi.object({
    totalHT: Joi.number().positive().precision(2).required(),
    totalTTC: Joi.number().positive().precision(2).required(),
    totalVAT: Joi.number().min(0).precision(2).required(),
  }).required(),
  paymentMethod: Joi.string()
    .valid("card", "paypal", "bank_transfer")
    .optional(),
  notes: Joi.string().optional(),
});

const creditNoteSchema = Joi.object({
  orderId: Joi.number().integer().required(),
  reason: Joi.string().required(),
  description: Joi.string().optional(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().integer().required(),
        quantity: Joi.number().integer().min(1).required(),
        unitPriceHT: Joi.number().positive().precision(2).required(),
        vatRate: Joi.number().min(0).max(100).precision(2).required(),
      })
    )
    .min(1)
    .required(),
});

// Helper function to get customer details
async function getCustomerDetails(customerId) {
  try {
    const response = await axios.get(
      `${
        process.env.CUSTOMER_SERVICE_URL || "http://localhost:3001"
      }/api/customers/profile`,
      {
        headers: {
          Authorization: `Bearer ${jwt.sign(
            { customerId, role: "admin" },
            JWT_SECRET,
            { expiresIn: "1h" }
          )}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching customer details:", error.message);
    return null;
  }
}

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

// Routes

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "order-service" });
});

// Create order
app.post("/api/orders", authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { error, value } = orderSchema.validate(req.body);
    if (error) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: error.details[0].message });
    }

    const { customerId, items, totals, paymentMethod = "card", notes } = value;

    // Verify customer exists
    const customer = await getCustomerDetails(customerId);
    if (!customer) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Customer not found" });
    }

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
                          payment_method, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, customer_id, total_amount_ht, total_amount_ttc, payment_method, notes, created_at`,
      [
        customerId,
        JSON.stringify(customer),
        totals.totalHT,
        totals.totalTTC,
        paymentMethod,
        notes,
      ]
    );

    const order = orderResult.rows[0];

    // Create order items
    const orderItems = [];
    for (const item of items) {
      const product = await getProductDetails(item.productId);
      if (!product) {
        await client.query("ROLLBACK");
        return res
          .status(404)
          .json({ error: `Product ${item.productId} not found` });
      }

      const unitPriceTTC = item.unitPriceHT * (1 + item.vatRate / 100);
      const totalPriceHT = item.unitPriceHT * item.quantity;
      const totalPriceTTC = unitPriceTTC * item.quantity;

      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price_ht, unit_price_ttc, 
                                 vat_rate, total_price_ht, total_price_ttc, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING id, product_id, quantity, unit_price_ht, unit_price_ttc, vat_rate, 
                   total_price_ht, total_price_ttc, created_at`,
        [
          order.id,
          item.productId,
          item.quantity,
          item.unitPriceHT,
          unitPriceTTC,
          item.vatRate,
          totalPriceHT,
          totalPriceTTC,
        ]
      );

      orderItems.push(itemResult.rows[0]);
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Order created successfully",
      order: {
        ...order,
        items: orderItems,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create order error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

// Get order by ID
app.get("/api/orders/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.customerId;

    const orderResult = await pool.query(
      `SELECT id, customer_id, customer_snapshot, total_amount_ht, total_amount_ttc, 
              payment_method, notes, created_at, updated_at
       FROM orders 
       WHERE id = $1 AND customer_id = $2`,
      [id, customerId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await pool.query(
      `SELECT id, product_id, quantity, unit_price_ht, unit_price_ttc, vat_rate, 
              total_price_ht, total_price_ttc, created_at
       FROM order_items 
       WHERE order_id = $1
       ORDER BY created_at`,
      [id]
    );

    order.items = itemsResult.rows;

    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get customer orders
app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const ordersResult = await pool.query(
      `SELECT id, customer_id, total_amount_ht, total_amount_ttc, payment_method, 
              notes, created_at, updated_at
       FROM orders 
       WHERE customer_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [customerId, limit, offset]
    );

    // Get total count
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE customer_id = $1",
      [customerId]
    );

    res.json({
      orders: ordersResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create credit note
app.post(
  "/api/orders/:id/credit-notes",
  authenticateToken,
  async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { id } = req.params;
      const { error, value } = creditNoteSchema.validate(req.body);
      if (error) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: error.details[0].message });
      }

      const { reason, description, items } = value;

      // Verify order exists
      const orderResult = await client.query(
        "SELECT id, customer_id, total_amount_ht, total_amount_ttc FROM orders WHERE id = $1",
        [id]
      );

      if (orderResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Order not found" });
      }

      const order = orderResult.rows[0];

      // Calculate credit note totals
      let totalHT = 0;
      let totalTTC = 0;
      let totalVAT = 0;

      const creditNoteItems = [];
      for (const item of items) {
        const unitPriceTTC = item.unitPriceHT * (1 + item.vatRate / 100);
        const totalPriceHT = item.unitPriceHT * item.quantity;
        const totalPriceTTC = unitPriceTTC * item.quantity;
        const itemVAT = totalPriceTTC - totalPriceHT;

        totalHT += totalPriceHT;
        totalTTC += totalPriceTTC;
        totalVAT += itemVAT;

        creditNoteItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPriceHT: item.unitPriceHT,
          unitPriceTTC: unitPriceTTC,
          vatRate: item.vatRate,
          totalPriceHT: totalPriceHT,
          totalPriceTTC: totalPriceTTC,
        });
      }

      // Create credit note
      const creditNoteResult = await client.query(
        `INSERT INTO credit_notes (customer_id, order_id, total_amount_ht, total_amount_ttc, 
                                 reason, description, issue_date, payment_method, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7, $8, NOW(), NOW())
       RETURNING id, customer_id, order_id, total_amount_ht, total_amount_ttc, 
                 reason, description, issue_date, created_at`,
        [
          order.customer_id,
          order.id,
          totalHT,
          totalTTC,
          reason,
          description,
          order.payment_method,
          `Credit note for order ${order.id}`,
        ]
      );

      const creditNote = creditNoteResult.rows[0];

      // Create credit note items
      for (const item of creditNoteItems) {
        await client.query(
          `INSERT INTO credit_note_items (credit_note_id, product_id, quantity, unit_price_ht, 
                                        unit_price_ttc, vat_rate, total_price_ht, total_price_ttc, 
                                        created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
          [
            creditNote.id,
            item.productId,
            item.quantity,
            item.unitPriceHT,
            item.unitPriceTTC,
            item.vatRate,
            item.totalPriceHT,
            item.totalPriceTTC,
          ]
        );
      }

      await client.query("COMMIT");

      res.status(201).json({
        message: "Credit note created successfully",
        creditNote: creditNote,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Create credit note error:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      client.release();
    }
  }
);

// Admin routes
app.get(
  "/api/admin/orders",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, customerId, status } = req.query;
      const offset = (page - 1) * limit;

      let query = `
      SELECT o.id, o.customer_id, o.total_amount_ht, o.total_amount_ttc, o.payment_method, 
             o.notes, o.created_at, o.updated_at,
             c.first_name, c.last_name, c.email
      FROM orders o
      LEFT JOIN LATERAL (
        SELECT first_name, last_name, email 
        FROM jsonb_to_record(o.customer_snapshot) AS t(first_name text, last_name text, email text)
      ) c ON true
    `;

      const params = [];
      let paramCount = 0;
      const conditions = [];

      if (customerId) {
        conditions.push(`o.customer_id = $${++paramCount}`);
        params.push(customerId);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      query += ` ORDER BY o.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      // Get total count
      let countQuery = "SELECT COUNT(*) FROM orders o";
      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(" AND ")}`;
      }
      const countResult = await pool.query(countQuery, params.slice(0, -2));

      res.json({
        orders: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].count),
          pages: Math.ceil(countResult.rows[0].count / limit),
        },
      });
    } catch (error) {
      console.error("Admin orders list error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Admin routes
app.get("/api/admin/orders", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sort } = req.query;
    const offset = (page - 1) * limit;

    const orders = await orderService.getOrders({
      offset: parseInt(offset),
      limit: parseInt(limit),
      status,
      sort,
    });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin order statistics - MUST be before /:id route
app.get(
  "/api/admin/orders/statistics",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { startDate, endDate, customerId } = req.query;
      const statistics = await orderService.getOrderStatistics({
        startDate,
        endDate,
        customerId: customerId ? parseInt(customerId) : undefined,
      });

      res.json(statistics);
    } catch (error) {
      console.error("Error fetching order statistics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.get("/api/admin/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(parseInt(id));

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching admin order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/admin/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const orderData = req.body;
    const updatedOrder = await orderService.updateOrder(
      parseInt(id),
      orderData
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating admin order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/admin/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await orderService.deleteOrder(parseInt(id));

    if (!deleted) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting admin order:", error);
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
  console.log(`Order Service running on port ${PORT}`);
});
