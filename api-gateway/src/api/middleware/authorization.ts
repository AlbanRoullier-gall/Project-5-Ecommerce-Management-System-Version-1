/**
 * Module d'autorisation pour l'API Gateway
 * Gère la vérification des permissions (super admin, etc.)
 */

import { Request, Response, NextFunction } from "express";
import { SERVICES } from "../../config";
import { AuthenticatedUser } from "./auth";

/**
 * Middleware pour vérifier que l'utilisateur est super admin
 * Doit être utilisé APRÈS requireAuth
 *
 * Vérifie le statut isSuperAdmin en appelant le auth-service
 */
export const requireSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user as AuthenticatedUser;

    if (!user || !user.userId) {
      res.status(401).json({
        error: "Utilisateur non authentifié",
        message: "Vous devez être authentifié pour accéder à cette ressource",
        code: "NOT_AUTHENTICATED",
      });
      return;
    }

    // Appeler le auth-service pour vérifier le statut super admin
    const response = await fetch(
      `${SERVICES.auth}/api/admin/users/${user.userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Service-Request": "api-gateway",
          "x-user-id": String(user.userId),
          "x-user-email": user.email,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        res.status(403).json({
          error: "Accès refusé",
          message: "Utilisateur non trouvé",
          code: "USER_NOT_FOUND",
        });
        return;
      }
      res.status(500).json({
        error: "Erreur de vérification",
        message: "Impossible de vérifier les permissions",
        code: "VERIFICATION_ERROR",
      });
      return;
    }

    const data = (await response.json()) as {
      success: boolean;
      data: { user: { isSuperAdmin: boolean } };
    };

    if (!data.success || !data.data?.user?.isSuperAdmin) {
      res.status(403).json({
        error: "Accès refusé",
        message:
          "Vous devez être super administrateur pour accéder à cette ressource",
        code: "NOT_SUPER_ADMIN",
      });
      return;
    }

    // L'utilisateur est super admin, continuer
    next();
  } catch (error) {
    console.error("Error in requireSuperAdmin middleware:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      message:
        "Une erreur est survenue lors de la vérification des permissions",
      code: "INTERNAL_ERROR",
    });
  }
};
