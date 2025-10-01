/**
 * AuthMiddleware
 * Middlewares d'authentification
 */
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../../models/JWTPayload";

export class AuthMiddleware {
  private jwtSecret: string;

  constructor(jwtSecret: string) {
    this.jwtSecret = jwtSecret;
  }

  /**
   * Middleware d'authentification JWT
   */
  authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Token d'accès requis" });
      return;
    }

    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
      (req as any).user = decoded;
      next();
    } catch (error) {
      res.status(403).json({ error: "Token invalide" });
    }
  };
}
