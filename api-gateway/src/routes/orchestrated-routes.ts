/**
 * Configuration des routes orchestrées (handlers custom)
 */

import { Route } from "../core/types";
import { createOrchestratedRoute } from "./helpers";
import {
  handlePasswordReset,
  handlePasswordResetConfirm,
  handleRegister,
  handleApproveBackofficeAccess,
  handleRejectBackofficeAccess,
} from "../handlers/auth-handler";
import {
  handleCreatePayment,
  handleStripeWebhook,
  handleFinalizePayment,
} from "../handlers/payment-handler";
import { ExportHandler } from "../handlers/export-handler";
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

    const { checkoutSnapshots } = require("../handlers/payment-handler");
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

    const { checkoutSnapshots } = require("../handlers/payment-handler");
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
export const ORCHESTRATED_ROUTES: Route[] = [
  // Routes d'authentification avec orchestration
  createOrchestratedRoute(
    "/auth/register",
    "POST",
    wrapHandler(handleRegister)
  ),
  createOrchestratedRoute(
    "/auth/reset-password",
    "POST",
    wrapHandler(handlePasswordReset)
  ),
  createOrchestratedRoute(
    "/auth/reset-password/confirm",
    "POST",
    wrapHandler(handlePasswordResetConfirm)
  ),
  createOrchestratedRoute(
    "/auth/approve-backoffice",
    "GET",
    wrapHandler(handleApproveBackofficeAccess)
  ),
  createOrchestratedRoute(
    "/auth/reject-backoffice",
    "GET",
    wrapHandler(handleRejectBackofficeAccess)
  ),

  // Routes de paiement avec orchestration
  createOrchestratedRoute(
    "/payment/create",
    "POST",
    wrapHandler(handleCreatePayment)
  ),
  createOrchestratedRoute(
    "/webhooks/stripe",
    "POST",
    wrapHandler(handleStripeWebhook)
  ),
  createOrchestratedRoute(
    "/payment/finalize",
    "POST",
    wrapHandler(handleFinalizePayment)
  ),

  // Routes de snapshot checkout
  createOrchestratedRoute("/cart/checkout", "PATCH", handleCheckoutSnapshot),
  createOrchestratedRoute("/cart/checkout", "GET", handleGetCheckoutSnapshot),

  // Routes d'export (auth automatique via convention /admin/*)
  createOrchestratedRoute(
    "/admin/exports/orders-year/:year",
    "GET",
    wrapHandler(exportHandler.exportOrdersYear.bind(exportHandler))
  ),
];
