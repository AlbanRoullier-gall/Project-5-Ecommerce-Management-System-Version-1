/**
 * AuthController
 * Gère les routes d'authentification
 */

import { Request, Response } from "express";
import { proxyRequest } from "../proxy";
import {
  handlePasswordReset,
  handlePasswordResetConfirm,
  handleRegister,
  handleApproveBackofficeAccess,
  handleRejectBackofficeAccess,
} from "../handlers/auth-handler";

export class AuthController {
  /**
   * Proxy vers le service auth
   */
  private async proxyToAuth(req: Request, res: Response): Promise<void> {
    await proxyRequest(req, res, "auth");
  }

  // ===== ROUTES PUBLIQUES PROXY =====

  login = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToAuth(req, res);
  };

  validatePassword = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToAuth(req, res);
  };

  // ===== ROUTES ORCHESTRÉES =====

  register = async (req: Request, res: Response): Promise<void> => {
    await handleRegister(req, res);
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    await handlePasswordReset(req, res);
  };

  resetPasswordConfirm = async (req: Request, res: Response): Promise<void> => {
    await handlePasswordResetConfirm(req, res);
  };

  approveBackoffice = async (req: Request, res: Response): Promise<void> => {
    await handleApproveBackofficeAccess(req, res);
  };

  rejectBackoffice = async (req: Request, res: Response): Promise<void> => {
    await handleRejectBackofficeAccess(req, res);
  };

  // ===== ROUTES ADMIN PROXY =====

  changePassword = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToAuth(req, res);
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    await this.proxyToAuth(req, res);
  };
}
