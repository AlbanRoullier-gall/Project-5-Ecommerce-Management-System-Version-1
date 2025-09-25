import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import Joi from "joi";
import morgan from "morgan";
import CustomerService from "./services/CustomerService";
import dotenv from "dotenv";

import {
  AuthenticatedRequest,
  CustomerData,
  CustomerUpdateData,
  AddressData,
} from "./types";

dotenv.config();

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

// Admin authentication middleware
const authenticateAdmin = (
  req: any,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
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
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", service: "customer-service" });
});

// Note: Authentication routes removed - handled by dedicated auth service

// Customer routes
app.get("/api/customers/profile/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(parseInt(id || "0"));

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json(customer.toPublicDTO());
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/customers/profile/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phoneNumber, birthday } = req.body;

    const customer = await customerService.updateCustomer(parseInt(id || "0"), {
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
    if (error instanceof Error && error.message === "Customer not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof Error && error.message === "Email already exists") {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Address routes
app.get(
  "/api/customers/addresses/:customerId",
  async (req: Request, res: Response) => {
    try {
      const { customerId } = req.params;
      const addresses = await customerService.listCustomerAddresses(
        parseInt(customerId || "0")
      );
      res.json(addresses.map((address) => address.toPublicDTO()));
    } catch (error) {
      console.error("Addresses error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.post(
  "/api/customers/addresses/:customerId",
  async (req: Request, res: Response) => {
    try {
      const { customerId } = req.params;
      const { error, value } = addressSchema.validate(req.body);
      if (error) {
        res
          .status(400)
          .json({ error: error.details[0]?.message || "Validation error" });
        return;
      }

      const address = await customerService.addAddress(
        parseInt(customerId || "0"),
        value as AddressData
      );

      res.status(201).json({
        message: "Address created successfully",
        address: address.toPublicDTO(),
      });
    } catch (error) {
      console.error("Address creation error:", error);
      if (error instanceof Error && error.message === "Customer not found") {
        res.status(404).json({ error: error.message });
        return;
      }
      if (
        error instanceof Error &&
        error.message.includes("Validation failed")
      ) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Admin routes
app.get(
  "/api/admin/customers",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response) => {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const result = await customerService.listCustomers({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
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
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomerById(
        parseInt(id || "0")
      );

      if (!customer) {
        res.status(404).json({ error: "Customer not found" });
        return;
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
  async (req: any, res: Response) => {
    try {
      const { error, value } = customerSchema.validate(req.body);
      if (error) {
        res
          .status(400)
          .json({ error: error.details[0]?.message || "Validation error" });
        return;
      }

      const customer = await customerService.createCustomer(
        value as CustomerData
      );

      res.status(201).json({
        message: "Customer created successfully",
        customer: customer.toPublicDTO(),
      });
    } catch (error) {
      console.error("Admin customer creation error:", error);
      if (
        error instanceof Error &&
        error.message === "Customer with this email already exists"
      ) {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.put(
  "/api/admin/customers/:id",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const customerData = req.body;

      const customer = await customerService.updateCustomer(
        parseInt(id || "0"),
        customerData as CustomerUpdateData
      );

      if (!customer) {
        res.status(404).json({ error: "Customer not found" });
        return;
      }

      res.json({
        message: "Customer updated successfully",
        customer: customer.toPublicDTO(),
      });
    } catch (error) {
      console.error("Admin customer update error:", error);
      if (error instanceof Error && error.message === "Customer not found") {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error instanceof Error && error.message === "Email already exists") {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.delete(
  "/api/admin/customers/:id",
  authenticateToken,
  authenticateAdmin,
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const success = await customerService.deleteCustomer(parseInt(id || "0"));

      if (!success) {
        res.status(404).json({ error: "Customer not found" });
        return;
      }

      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      console.error("Admin customer deletion error:", error);
      if (error instanceof Error && error.message === "Customer not found") {
        res.status(404).json({ error: error.message });
        return;
      }
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
  console.log(`Customer Service running on port ${PORT}`);
});
