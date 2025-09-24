const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const Joi = require("joi");
const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");
const CustomerService = require("./services/CustomerService");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Initialize service
const customerService = new CustomerService(pool);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// Authentication middleware - expects token validation from API Gateway
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
const customerSchema = Joi.object({
  civilityId: Joi.number().integer().required(),
  firstName: Joi.string().max(100).required(),
  lastName: Joi.string().max(100).required(),
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(6).required(),
  socioProfessionalCategoryId: Joi.number().integer().required(),
  phoneNumber: Joi.string().max(20).optional(),
  birthday: Joi.date().optional(),
});

// Note: loginSchema removed - authentication handled elsewhere

const addressSchema = Joi.object({
  addressType: Joi.string().valid("shipping", "billing").required(),
  address: Joi.string().required(),
  postalCode: Joi.string().max(10).required(),
  city: Joi.string().max(100).required(),
  countryId: Joi.number().integer().required(),
  isDefault: Joi.boolean().optional(),
});

// Routes

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "customer-service" });
});

// Note: Authentication routes removed - handled by dedicated auth service

// Customer routes
app.get("/api/customers/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(parseInt(id));

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(customer.toPublicDTO());
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/customers/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phoneNumber, birthday } = req.body;

    const customer = await customerService.updateCustomer(parseInt(id), {
      firstName,
      lastName,
      phoneNumber,
      birthday,
    });

    res.json({
      message: "Profile updated successfully",
      customer: customer.toPublicDTO(),
    });
  } catch (error) {
    console.error("Profile update error:", error);
    if (error.message === "Customer not found") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === "Email already exists") {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Address routes
app.get("/api/customers/addresses/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const addresses = await customerService.listCustomerAddresses(
      parseInt(customerId)
    );
    res.json(addresses.map((address) => address.toPublicDTO()));
  } catch (error) {
    console.error("Addresses error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/customers/addresses/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const { error, value } = addressSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const address = await customerService.addAddress(
      parseInt(customerId),
      value
    );

    res.status(201).json({
      message: "Address created successfully",
      address: address.toPublicDTO(),
    });
  } catch (error) {
    console.error("Address creation error:", error);
    if (error.message === "Customer not found") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes("Validation failed")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin routes
app.get(
  "/api/admin/customers",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const result = await customerService.listCustomers({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        activeOnly: false,
      });

      res.json(result);
    } catch (error) {
      console.error("Admin customers list error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.get(
  "/api/admin/customers/:id",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomerById(parseInt(id));

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      res.json(customer.toPublicDTO());
    } catch (error) {
      console.error("Admin customer details error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.post(
  "/api/admin/customers",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { error, value } = customerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const customer = await customerService.createCustomer(value);

      res.status(201).json({
        message: "Customer created successfully",
        customer: customer.toPublicDTO(),
      });
    } catch (error) {
      console.error("Admin customer creation error:", error);
      if (error.message === "Customer with this email already exists") {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.put(
  "/api/admin/customers/:id",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const customerData = req.body;

      const customer = await customerService.updateCustomer(
        parseInt(id),
        customerData
      );

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      res.json({
        message: "Customer updated successfully",
        customer: customer.toPublicDTO(),
      });
    } catch (error) {
      console.error("Admin customer update error:", error);
      if (error.message === "Customer not found") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "Email already exists") {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.delete(
  "/api/admin/customers/:id",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const success = await customerService.deleteCustomer(parseInt(id));

      if (!success) {
        return res.status(404).json({ error: "Customer not found" });
      }

      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      console.error("Admin customer deletion error:", error);
      if (error.message === "Customer not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

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
  console.log(`Customer Service running on port ${PORT}`);
});
