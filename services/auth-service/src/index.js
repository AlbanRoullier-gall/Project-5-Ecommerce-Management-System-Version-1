const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const Joi = require("joi");
const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");
const AuthService = require("./services/AuthService");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3008;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Initialize service
const authService = new AuthService(pool);

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
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().max(100).required(),
  lastName: Joi.string().max(100).required(),
  role: Joi.string().valid("admin", "customer").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().max(100).optional(),
  lastName: Joi.string().max(100).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid("admin", "customer").optional(),
  isActive: Joi.boolean().optional(),
});

// Routes

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "auth-service" });
});

// Authentication routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await authService.registerUser(value);

    // Generate JWT token
    const token = authService.generateJWT(user);

    res.status(201).json({
      message: "User registered successfully",
      user: user.toPublicDTO(),
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.message === "User with this email already exists") {
      return res.status(409).json({ error: error.message });
    }
    if (error.message.includes("Password validation failed")) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === "Invalid email format") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;
    const user = await authService.authenticateUser(email, password);

    // Generate JWT token
    const token = authService.generateJWT(user);

    res.json({
      message: "Login successful",
      user: user.toPublicDTO(),
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    if (
      error.message === "Invalid credentials" ||
      error.message === "Account is deactivated"
    ) {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// User profile routes
app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    res.json(user.toPublicDTO());
  } catch (error) {
    console.error("Profile error:", error);
    if (error.message === "User not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Users can only update their own profile (not role or isActive)
    const allowedFields = {
      firstName: value.firstName,
      lastName: value.lastName,
    };
    if (value.email && req.user.email !== value.email) {
      allowedFields.email = value.email;
    }

    const user = await authService.updateUser(req.user.userId, allowedFields);

    res.json({
      message: "Profile updated successfully",
      user: user.toPublicDTO(),
    });
  } catch (error) {
    console.error("Profile update error:", error);
    if (error.message === "User not found") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === "Invalid email format") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Password management routes
app.post("/api/auth/change-password", authenticateToken, async (req, res) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { currentPassword, newPassword } = value;
    await authService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword
    );

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    if (error.message === "User not found") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === "Current password is incorrect") {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes("Password validation failed")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await authService.getUserByEmail(email);

    // Generate reset token
    const resetToken = require("crypto").randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await authService.createPasswordReset(user.userId, resetToken, expiresAt);

    // In a real application, you would send an email here
    res.json({
      message: "Password reset token generated",
      resetToken, // Only for development - remove in production
      expiresAt,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    if (error.message === "User not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { token, newPassword } = value;
    await authService.resetPassword(token, newPassword);

    res.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    if (error.message === "Password reset not found") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === "Password reset token has expired") {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes("Password validation failed")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin routes
app.get(
  "/api/admin/users",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { role } = req.query;
      const users = await authService.listUsers(role);
      res.json(users.map((user) => user.toPublicDTO()));
    } catch (error) {
      console.error("Admin users list error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.get(
  "/api/admin/users/:id",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await authService.getUserById(parseInt(id));
      res.json(user.toPublicDTO());
    } catch (error) {
      console.error("Admin user details error:", error);
      if (error.message === "User not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.put(
  "/api/admin/users/:id",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { error, value } = updateUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const user = await authService.updateUser(parseInt(id), value);

      res.json({
        message: "User updated successfully",
        user: user.toPublicDTO(),
      });
    } catch (error) {
      console.error("Admin user update error:", error);
      if (error.message === "User not found") {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "Invalid email format") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.delete(
  "/api/admin/users/:id",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      await authService.deleteUser(parseInt(id));

      res.json({
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Admin user deletion error:", error);
      if (error.message === "User not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.post(
  "/api/admin/users/:id/activate",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      await authService.activateUser(parseInt(id));

      res.json({
        message: "User activated successfully",
      });
    } catch (error) {
      console.error("Admin user activation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.post(
  "/api/admin/users/:id/deactivate",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      await authService.deactivateUser(parseInt(id));

      res.json({
        message: "User deactivated successfully",
      });
    } catch (error) {
      console.error("Admin user deactivation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Session management routes
app.get("/api/auth/sessions", authenticateToken, async (req, res) => {
  try {
    const sessions = await authService.getUserSessions(req.user.userId);
    res.json(sessions.map((session) => session.toPublicDTO()));
  } catch (error) {
    console.error("User sessions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete(
  "/api/auth/sessions/:sessionId",
  authenticateToken,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      await authService.deleteSession(parseInt(sessionId));

      res.json({
        message: "Session deleted successfully",
      });
    } catch (error) {
      console.error("Session deletion error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.post("/api/auth/logout", authenticateToken, async (req, res) => {
  try {
    // In a real application, you would invalidate the JWT token
    // For now, we'll just return a success message
    res.json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Cleanup routes (for maintenance)
app.post(
  "/api/admin/cleanup/sessions",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const deletedCount = await authService.cleanupExpiredSessions();
      res.json({
        message: "Expired sessions cleaned up",
        deletedCount,
      });
    } catch (error) {
      console.error("Session cleanup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.post(
  "/api/admin/cleanup/password-resets",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    try {
      const deletedCount = await authService.cleanupExpiredPasswordResets();
      res.json({
        message: "Expired password resets cleaned up",
        deletedCount,
      });
    } catch (error) {
      console.error("Password reset cleanup error:", error);
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
  console.log(`Auth service running on port ${PORT}`);
});

module.exports = app;
