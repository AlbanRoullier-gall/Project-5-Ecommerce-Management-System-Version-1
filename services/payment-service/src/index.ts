import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import Joi from "joi";
import morgan from "morgan";
import Stripe from "stripe";
import axios from "axios";
import dotenv from "dotenv";

import { AuthenticatedRequest } from "./types";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Stripe configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-08-16",
});

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
const paymentIntentSchema = Joi.object({
  orderId: Joi.number().integer().required(),
  amount: Joi.number().positive().precision(2).required(),
  currency: Joi.string().length(3).default("eur"),
  paymentMethod: Joi.string()
    .valid("card", "sepa_debit", "ideal")
    .default("card"),
});

const confirmPaymentSchema = Joi.object({
  paymentIntentId: Joi.string().required(),
  paymentMethodId: Joi.string().optional(),
});

// Routes

// Health check
app.get("/health", (req: Request, res: Response): void => {
  res.json({ status: "OK", service: "payment-service" });
});

// Create payment intent
app.post(
  "/api/payments/create-intent",
  authenticateToken,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { error, value } = paymentIntentSchema.validate(req.body);
      if (error) {
        res
          .status(400)
          .json({ error: error.details[0]?.message || "Validation error" });
        return;
      }

      const { orderId, amount, currency, paymentMethod } = value;
      const customerId = req.user.customerId;

      // Verify order exists and belongs to customer
      const orderResponse = await axios.get(
        `${
          process.env.ORDER_SERVICE_URL || "http://localhost:3003"
        }/api/orders/${orderId}`,
        {
          headers: {
            Authorization: req.headers.authorization as string,
          },
        }
      );

      if (!orderResponse.data) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      const order = orderResponse.data;

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        customer: customerId.toString(),
        metadata: {
          orderId: orderId.toString(),
          customerId: customerId.toString(),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Save payment intent to database
      const result = await pool.query(
        `INSERT INTO payment_intents (stripe_payment_intent_id, customer_id, order_id, 
                                     amount, currency, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id, stripe_payment_intent_id, amount, currency, status, created_at`,
        [
          paymentIntent.id,
          customerId,
          orderId,
          amount,
          currency,
          paymentIntent.status,
        ]
      );

      res.status(201).json({
        message: "Payment intent created successfully",
        paymentIntent: {
          id: result.rows[0].id,
          stripePaymentIntentId: result.rows[0].stripe_payment_intent_id,
          amount: result.rows[0].amount,
          currency: result.rows[0].currency,
          status: result.rows[0].status,
          clientSecret: paymentIntent.client_secret,
        },
      });
    } catch (error) {
      console.error("Create payment intent error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Confirm payment
app.post(
  "/api/payments/confirm",
  authenticateToken,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { error, value } = confirmPaymentSchema.validate(req.body);
      if (error) {
        res
          .status(400)
          .json({ error: error.details[0]?.message || "Validation error" });
        return;
      }

      const { paymentIntentId, paymentMethodId } = value;

      // Get payment intent from database
      const paymentResult = await pool.query(
        "SELECT * FROM payment_intents WHERE stripe_payment_intent_id = $1",
        [paymentIntentId]
      );

      if (paymentResult.rows.length === 0) {
        res.status(404).json({ error: "Payment intent not found" });
        return;
      }

      const payment = paymentResult.rows[0];

      // Confirm payment with Stripe
      const confirmParams: any = {};
      if (paymentMethodId) {
        confirmParams.payment_method = paymentMethodId;
      }

      const confirmedPayment = await stripe.paymentIntents.confirm(
        paymentIntentId,
        confirmParams
      );

      // Update payment status in database
      await pool.query(
        "UPDATE payment_intents SET status = $1, updated_at = NOW() WHERE id = $2",
        [confirmedPayment.status, payment.id]
      );

      // If payment succeeded, update order status
      if (confirmedPayment.status === "succeeded") {
        // Here you would typically update the order status
        // and trigger any necessary business logic
        console.log(`Payment succeeded for order ${payment.order_id}`);
      }

      res.json({
        message: "Payment confirmed",
        payment: {
          id: payment.id,
          status: confirmedPayment.status,
          amount: payment.amount,
          currency: payment.currency,
        },
      });
    } catch (error) {
      console.error("Confirm payment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get payment status
app.get(
  "/api/payments/:paymentIntentId/status",
  authenticateToken,
  async (req: any, res: Response): Promise<void> => {
    try {
      const { paymentIntentId } = req.params;

      const result = await pool.query(
        "SELECT id, stripe_payment_intent_id, amount, currency, status, created_at, updated_at FROM payment_intents WHERE stripe_payment_intent_id = $1",
        [paymentIntentId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "Payment intent not found" });
        return;
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Get payment status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get customer payments
app.get(
  "/api/payments",
  authenticateToken,
  async (req: any, res: Response): Promise<void> => {
    try {
      const customerId = req.user.customerId;
      const { page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const result = await pool.query(
        `SELECT id, stripe_payment_intent_id, order_id, amount, currency, status, 
                created_at, updated_at
         FROM payment_intents 
         WHERE customer_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [customerId, limit, offset]
      );

      // Get total count
      const countResult = await pool.query(
        "SELECT COUNT(*) FROM payment_intents WHERE customer_id = $1",
        [customerId]
      );

      res.json({
        payments: result.rows,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: parseInt(countResult.rows[0].count),
          pages: Math.ceil(
            parseInt(countResult.rows[0].count) / parseInt(limit as string)
          ),
        },
      });
    } catch (error) {
      console.error("Get payments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Stripe webhook handler
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err) {
      console.error(
        "Webhook signature verification failed:",
        (err as Error).message
      );
      res.status(400).send(`Webhook Error: ${(err as Error).message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("PaymentIntent succeeded:", paymentIntent.id);

        // Update payment status in database
        await pool.query(
          "UPDATE payment_intents SET status = $1, updated_at = NOW() WHERE stripe_payment_intent_id = $2",
          ["succeeded", paymentIntent.id]
        );
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log("PaymentIntent failed:", failedPayment.id);

        // Update payment status in database
        await pool.query(
          "UPDATE payment_intents SET status = $1, updated_at = NOW() WHERE stripe_payment_intent_id = $2",
          ["failed", failedPayment.id]
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use("*", (req: Request, res: Response): void => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});
