/**
 * AuthController
 * Gère les routes d'authentification
 */

import { Request, Response } from "express";
import { proxyRequest } from "../../core/proxy";
import {
  handlePasswordReset,
  handlePasswordResetConfirm,
  handleRegister,
  handleApproveBackofficeAccess,
  handleRejectBackofficeAccess,
} from "../../handlers/auth-handler";

export class AuthController {
  /**
   * Proxy vers le service auth
   */
  private async proxyToAuth(req: Request, res: Response): Promise<void> {
    await proxyRequest(req, res, "auth");
  }

  /**
   * Wrapper pour les handlers orchestrés
   */
  private wrapHandler(
    handler: (req: Request, res: Response) => Promise<any> | any
  ) {
    return async (req: Request, res: Response): Promise<void> => {
      await handler(req, res);
    };
  }

  // ===== ROUTES PUBLIQUES PROXY =====

  login = this.wrapHandler(this.proxyToAuth);
  validatePassword = this.wrapHandler(this.proxyToAuth);

  // ===== ROUTES ORCHESTRÉES =====

  register = this.wrapHandler(handleRegister);
  resetPassword = this.wrapHandler(handlePasswordReset);
  resetPasswordConfirm = this.wrapHandler(handlePasswordResetConfirm);
  approveBackoffice = this.wrapHandler(handleApproveBackofficeAccess);
  rejectBackoffice = this.wrapHandler(handleRejectBackofficeAccess);

  // ===== ROUTES ADMIN PROXY =====

  changePassword = this.wrapHandler(this.proxyToAuth);
  logout = this.wrapHandler(this.proxyToAuth);
}
