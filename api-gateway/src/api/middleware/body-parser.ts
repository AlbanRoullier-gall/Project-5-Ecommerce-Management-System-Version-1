/**
 * Middlewares pour le parsing du body
 */

import { Request, Response, NextFunction } from "express";
import express from "express";

/**
 * Middleware pour capturer le raw body pour les webhooks Stripe
 */
export const stripeWebhookBody = (
  req: any,
  _res: Response,
  next: NextFunction
): void => {
  let data: Buffer[] = [];
  req.on("data", (chunk: Buffer) => data.push(chunk));
  req.on("end", () => {
    req.rawBody = Buffer.concat(data);
    next();
  });
};

/**
 * Middleware pour parser JSON uniquement si Content-Type est application/json
 */
export const jsonParser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.headers["content-type"]?.includes("application/json")) {
    express.json({ limit: "10mb" })(req, res, next);
  } else {
    next();
  }
};

/**
 * Middleware pour parser urlencoded uniquement si Content-Type est application/x-www-form-urlencoded
 */
export const urlencodedParser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (
    req.headers["content-type"]?.includes("application/x-www-form-urlencoded")
  ) {
    express.urlencoded({ extended: true })(req, res, next);
  } else {
    next();
  }
};
