const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { createClient } = require("redis");
const Joi = require("joi");
const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3008;

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

// Event schemas
const eventSchema = Joi.object({
  eventType: Joi.string().required(),
  aggregateId: Joi.string().required(),
  aggregateType: Joi.string().required(),
  eventData: Joi.object().required(),
  metadata: Joi.object({
    correlationId: Joi.string().optional(),
    causationId: Joi.string().optional(),
    timestamp: Joi.string().optional(),
    version: Joi.number().optional(),
  }).optional(),
});

const subscriptionSchema = Joi.object({
  serviceName: Joi.string().required(),
  eventTypes: Joi.array().items(Joi.string()).required(),
  webhookUrl: Joi.string().uri().required(),
});

// Event handlers registry
const eventHandlers = new Map();

// Routes

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "event-bus" });
});

// Publish event
app.post("/api/events/publish", async (req, res) => {
  try {
    const { error, value } = eventSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const event = {
      eventId: uuidv4(),
      ...value,
      metadata: {
        correlationId: uuidv4(),
        timestamp: new Date().toISOString(),
        version: 1,
        ...value.metadata,
      },
    };

    // Store event in Redis
    await redis.lpush("events", JSON.stringify(event));
    await redis.ltrim("events", 0, 9999); // Keep last 10000 events

    // Publish to Redis pub/sub
    await redis.publish("events", JSON.stringify(event));

    // Notify registered handlers
    await notifyHandlers(event);

    res.status(201).json({
      message: "Event published successfully",
      eventId: event.eventId,
    });
  } catch (error) {
    console.error("Publish event error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Subscribe to events
app.post("/api/events/subscribe", async (req, res) => {
  try {
    const { error, value } = subscriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { serviceName, eventTypes, webhookUrl } = value;

    // Store subscription
    const subscription = {
      serviceName,
      eventTypes,
      webhookUrl,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    await redis.hset(
      "subscriptions",
      serviceName,
      JSON.stringify(subscription)
    );

    res.status(201).json({
      message: "Subscription created successfully",
      subscription,
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get events
app.get("/api/events", async (req, res) => {
  try {
    const { limit = 50, offset = 0, eventType } = req.query;

    let events = await redis.lrange("events", offset, offset + limit - 1);
    events = events.map((event) => JSON.parse(event));

    if (eventType) {
      events = events.filter((event) => event.eventType === eventType);
    }

    res.json({
      events,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: events.length,
      },
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get subscriptions
app.get("/api/events/subscriptions", async (req, res) => {
  try {
    const subscriptions = await redis.hgetall("subscriptions");
    const result = Object.values(subscriptions).map((sub) => JSON.parse(sub));

    res.json(result);
  } catch (error) {
    console.error("Get subscriptions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper function to notify handlers
async function notifyHandlers(event) {
  try {
    const subscriptions = await redis.hgetall("subscriptions");

    for (const [serviceName, subscriptionData] of Object.entries(
      subscriptions
    )) {
      const subscription = JSON.parse(subscriptionData);

      if (
        subscription.isActive &&
        subscription.eventTypes.includes(event.eventType)
      ) {
        try {
          await axios.post(subscription.webhookUrl, event, {
            timeout: 5000,
            headers: {
              "Content-Type": "application/json",
              "X-Event-Source": "event-bus",
            },
          });

          console.log(`Event ${event.eventType} delivered to ${serviceName}`);
        } catch (error) {
          console.error(
            `Failed to deliver event to ${serviceName}:`,
            error.message
          );
        }
      }
    }
  } catch (error) {
    console.error("Notify handlers error:", error);
  }
}

// Redis subscriber for real-time events
redis.subscribe("events", (message) => {
  try {
    const event = JSON.parse(message);
    console.log(
      `Received event: ${event.eventType} for ${event.aggregateType}:${event.aggregateId}`
    );
  } catch (error) {
    console.error("Redis subscriber error:", error);
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
  console.log(`Event Bus running on port ${PORT}`);
  console.log("Event Bus ready to handle events and subscriptions");
});
