/**
 * Configuration des routes orchestrées (handlers custom)
 */

import { OrchestratedRoute } from "../../core/types";
import {
  handlePasswordReset,
  handlePasswordResetConfirm,
  handleRegister,
  handleApproveBackofficeAccess,
  handleRejectBackofficeAccess,
} from "../../handlers/auth-handler";
import {
  handleCreatePayment,
  handleStripeWebhook,
  handleFinalizePayment,
} from "../../handlers/payment-handler";
import { ExportHandler } from "../../handlers/export-handler";
import { Request, Response } from "express";

const exportHandler = new ExportHandler();

/**
 * Handler pour les snapshots de checkout
 */
const handleCheckoutSnapshot = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }

    const { checkoutSnapshots } = require("../../handlers/payment-handler");
    checkoutSnapshots.set(sessionId as string, req.body);
    res.status(204).send();
  } catch (error) {
    console.error("Attach checkout snapshot error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Handler pour récupérer un snapshot de checkout
 */
const handleGetCheckoutSnapshot = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }

    const { checkoutSnapshots } = require("../../handlers/payment-handler");
    const snapshot = checkoutSnapshots.get(sessionId as string);

    if (!snapshot) {
      res.status(404).json({ error: "Checkout snapshot not found" });
      return;
    }

    res.status(200).json({ snapshot });
  } catch (error) {
    console.error("Get checkout snapshot error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Wrapper pour les handlers qui peuvent retourner une Response
 */
const wrapHandler = (
  handler: (req: Request, res: Response) => Promise<any> | any
) => {
  return async (req: Request, res: Response): Promise<void> => {
    await handler(req, res);
  };
};

/**
 * Configuration complète des routes orchestrées
 */
export const ORCHESTRATED_ROUTES: OrchestratedRoute[] = [
  // Routes d'authentification avec orchestration
  {
    path: "/auth/register",
    method: "POST",
    handler: wrapHandler(handleRegister),
    auth: false,
  },
  {
    path: "/auth/reset-password",
    method: "POST",
    handler: wrapHandler(handlePasswordReset),
    auth: false,
  },
  {
    path: "/auth/reset-password/confirm",
    method: "POST",
    handler: wrapHandler(handlePasswordResetConfirm),
    auth: false,
  },
  {
    path: "/auth/approve-backoffice",
    method: "GET",
    handler: wrapHandler(handleApproveBackofficeAccess),
    auth: false,
  },
  {
    path: "/auth/reject-backoffice",
    method: "GET",
    handler: wrapHandler(handleRejectBackofficeAccess),
    auth: false,
  },

  // Routes de paiement avec orchestration
  {
    path: "/payment/create",
    method: "POST",
    handler: wrapHandler(handleCreatePayment),
    auth: false,
  },
  {
    path: "/webhooks/stripe",
    method: "POST",
    handler: wrapHandler(handleStripeWebhook),
    auth: false,
  },
  {
    path: "/payment/finalize",
    method: "POST",
    handler: wrapHandler(handleFinalizePayment),
    auth: false,
  },

  // Routes de snapshot checkout
  {
    path: "/cart/checkout",
    method: "PATCH",
    handler: handleCheckoutSnapshot,
    auth: false,
  },
  {
    path: "/cart/checkout",
    method: "GET",
    handler: handleGetCheckoutSnapshot,
    auth: false,
  },

  // Routes d'export
  {
    path: "/admin/exports/orders-year/:year",
    method: "GET",
    handler: wrapHandler(exportHandler.exportOrdersYear.bind(exportHandler)),
    auth: true,
  },
];
