/**
 * Service d'Authentification - Gestion des utilisateurs et des sessions
 *
 * Ce service gère :
 * - L'inscription et la connexion des utilisateurs
 * - La gestion des sessions et tokens JWT
 * - La réinitialisation des mots de passe
 * - L'administration des utilisateurs (admin)
 * - La gestion des sessions actives
 */

// ===== IMPORTS ET CONFIGURATION =====
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

// Configuration du serveur Express
const app = express();
const PORT = process.env.PORT || 3008;

/**
 * Configuration de la connexion à la base de données PostgreSQL
 * SSL activé en production pour la sécurité
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Initialisation du service d'authentification
const authService = new AuthService(pool);

// ===== MIDDLEWARES =====
/**
 * Configuration des middlewares de sécurité et de logging
 */
app.use(helmet()); // Sécurité HTTP
app.use(cors()); // Gestion CORS
app.use(express.json()); // Parsing JSON
app.use(morgan("combined")); // Logging des requêtes

/**
 * Configuration du secret JWT pour la signature des tokens
 * Utilise une variable d'environnement ou une valeur par défaut
 */
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// ===== MIDDLEWARES D'AUTHENTIFICATION =====
/**
 * Middleware d'authentification JWT
 * Vérifie la validité du token dans l'en-tête Authorization
 * Ajoute les informations utilisateur à req.user si valide
 */
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

/**
 * Middleware de vérification des droits administrateur
 * Doit être utilisé après authenticateToken
 * Vérifie que l'utilisateur a le rôle "admin"
 */
const authenticateAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// ===== SCHÉMAS DE VALIDATION JOI =====
/**
 * Schéma de validation pour l'inscription d'un utilisateur
 */
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
  firstName: Joi.string().max(100).required(),
  lastName: Joi.string().max(100).required(),
  role: Joi.string().valid("admin", "customer").optional(),
});

/**
 * Schéma de validation pour la connexion
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

/**
 * Schéma de validation pour le changement de mot de passe
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

/**
 * Schéma de validation pour la réinitialisation de mot de passe
 */
const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

/**
 * Schéma de validation pour la mise à jour d'un utilisateur
 */
const updateUserSchema = Joi.object({
  firstName: Joi.string().max(100).optional(),
  lastName: Joi.string().max(100).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid("admin", "customer").optional(),
  isActive: Joi.boolean().optional(),
});

// ===== ROUTES =====

/**
 * Route de santé du service
 * Permet de vérifier que le service d'authentification fonctionne correctement
 */
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "auth-service" });
});

// ===== ROUTES D'AUTHENTIFICATION =====
/**
 * Route d'inscription d'un nouvel utilisateur
 *
 * @param {Object} req.body - Données d'inscription
 * @param {string} req.body.email - Email de l'utilisateur
 * @param {string} req.body.password - Mot de passe (min 6 caractères)
 * @param {string} req.body.firstName - Prénom
 * @param {string} req.body.lastName - Nom
 * @param {string} [req.body.role] - Rôle (admin/customer, par défaut: customer)
 *
 * @returns {Object} Utilisateur créé et token JWT
 */
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

/**
 * Route de connexion d'un utilisateur
 *
 * @param {Object} req.body - Données de connexion
 * @param {string} req.body.email - Email de l'utilisateur
 * @param {string} req.body.password - Mot de passe
 *
 * @returns {Object} Utilisateur et token JWT
 */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;
    const user = await authService.authenticateUser(email, password);

    // Génération du token JWT
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

// ===== ROUTES DE PROFIL UTILISATEUR =====
/**
 * Route pour récupérer le profil de l'utilisateur connecté
 * Nécessite une authentification valide
 *
 * @returns {Object} Profil de l'utilisateur
 */
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

/**
 * Route pour mettre à jour le profil de l'utilisateur connecté
 * Les utilisateurs ne peuvent modifier que leurs propres informations
 * (pas le rôle ou le statut actif)
 *
 * @param {Object} req.body - Données à mettre à jour
 * @param {string} [req.body.firstName] - Nouveau prénom
 * @param {string} [req.body.lastName] - Nouveau nom
 * @param {string} [req.body.email] - Nouvel email
 *
 * @returns {Object} Profil mis à jour
 */
app.put("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Les utilisateurs ne peuvent modifier que certains champs de leur profil
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

// ===== ROUTES DE GESTION DES MOTS DE PASSE =====
/**
 * Route pour changer le mot de passe de l'utilisateur connecté
 * Nécessite le mot de passe actuel pour validation
 *
 * @param {Object} req.body - Données de changement de mot de passe
 * @param {string} req.body.currentPassword - Mot de passe actuel
 * @param {string} req.body.newPassword - Nouveau mot de passe (min 6 caractères)
 *
 * @returns {Object} Message de succès
 */
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

/**
 * Route pour demander une réinitialisation de mot de passe
 * Génère un token de réinitialisation valide pendant 1 heure
 *
 * @param {Object} req.body - Données de la demande
 * @param {string} req.body.email - Email de l'utilisateur
 *
 * @returns {Object} Token de réinitialisation (dev uniquement)
 */
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await authService.getUserByEmail(email);

    // Génération d'un token de réinitialisation sécurisé
    const resetToken = require("crypto").randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 heure

    await authService.createPasswordReset(user.userId, resetToken, expiresAt);

    // En production, envoyer un email avec le token
    res.json({
      message: "Password reset token generated",
      resetToken, // Uniquement pour le développement - à supprimer en production
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

/**
 * Route pour réinitialiser le mot de passe avec un token
 * Le token doit être valide et non expiré
 *
 * @param {Object} req.body - Données de réinitialisation
 * @param {string} req.body.token - Token de réinitialisation
 * @param {string} req.body.newPassword - Nouveau mot de passe (min 6 caractères)
 *
 * @returns {Object} Message de succès
 */
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

// ===== ROUTES D'ADMINISTRATION =====
/**
 * Route pour lister tous les utilisateurs (admin uniquement)
 * Peut filtrer par rôle via le paramètre query
 *
 * @param {string} [req.query.role] - Filtrer par rôle (admin/customer)
 * @returns {Array} Liste des utilisateurs
 */
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

/**
 * Route pour récupérer les détails d'un utilisateur spécifique (admin uniquement)
 *
 * @param {string} req.params.id - ID de l'utilisateur
 * @returns {Object} Détails de l'utilisateur
 */
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

/**
 * Route pour mettre à jour un utilisateur (admin uniquement)
 * Permet de modifier tous les champs y compris le rôle et le statut
 *
 * @param {string} req.params.id - ID de l'utilisateur
 * @param {Object} req.body - Données à mettre à jour
 * @returns {Object} Utilisateur mis à jour
 */
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

/**
 * Route pour supprimer un utilisateur (admin uniquement)
 *
 * @param {string} req.params.id - ID de l'utilisateur à supprimer
 * @returns {Object} Message de succès
 */
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

/**
 * Route pour activer un utilisateur (admin uniquement)
 *
 * @param {string} req.params.id - ID de l'utilisateur à activer
 * @returns {Object} Message de succès
 */
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

/**
 * Route pour désactiver un utilisateur (admin uniquement)
 *
 * @param {string} req.params.id - ID de l'utilisateur à désactiver
 * @returns {Object} Message de succès
 */
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

// ===== ROUTES DE GESTION DES SESSIONS =====
/**
 * Route pour récupérer les sessions actives de l'utilisateur connecté
 * Permet de voir toutes les sessions ouvertes
 *
 * @returns {Array} Liste des sessions actives
 */
app.get("/api/auth/sessions", authenticateToken, async (req, res) => {
  try {
    const sessions = await authService.getUserSessions(req.user.userId);
    res.json(sessions.map((session) => session.toPublicDTO()));
  } catch (error) {
    console.error("User sessions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Route pour supprimer une session spécifique
 * Permet de déconnecter une session particulière
 *
 * @param {string} req.params.sessionId - ID de la session à supprimer
 * @returns {Object} Message de succès
 */
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

/**
 * Route pour déconnecter l'utilisateur (logout)
 * Dans une vraie application, on invaliderait le token JWT
 *
 * @returns {Object} Message de succès
 */
app.post("/api/auth/logout", authenticateToken, async (req, res) => {
  try {
    // Dans une vraie application, on invaliderait le token JWT
    // Pour l'instant, on retourne juste un message de succès
    res.json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===== ROUTES DE MAINTENANCE (ADMIN UNIQUEMENT) =====
/**
 * Route pour nettoyer les sessions expirées (admin uniquement)
 * Supprime automatiquement les sessions qui ont expiré
 *
 * @returns {Object} Nombre de sessions supprimées
 */
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

/**
 * Route pour nettoyer les tokens de réinitialisation expirés (admin uniquement)
 * Supprime automatiquement les tokens de réinitialisation expirés
 *
 * @returns {Object} Nombre de tokens supprimés
 */
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

// ===== GESTION DES ERREURS GLOBALES =====
/**
 * Middleware de gestion des erreurs globales
 * Capture toutes les erreurs non gérées dans l'application
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

/**
 * Handler pour les routes non trouvées (404)
 * Doit être placé en dernier pour capturer toutes les routes non définies
 */
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ===== DÉMARRAGE DU SERVEUR =====
/**
 * Démarrage du serveur sur le port configuré
 */
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});

module.exports = app;
