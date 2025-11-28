/**
 * Handler pour les statistiques du dashboard
 * Orchestre les appels aux services et agrège les données
 */

import { Request, Response } from "express";
import { SERVICES } from "../../config";
import { AuthenticatedUser } from "../middleware/auth";

interface DashboardStatistics {
  productsCount: number;
  customersCount: number;
  ordersCount: number;
  totalRevenue: number; // TTC
  totalRevenueHT: number; // HT
}

/**
 * Helper pour extraire un count depuis différentes structures de réponse
 */
const extractCount = (data: any, paths: string[]): number => {
  for (const path of paths) {
    const value = path.split(".").reduce((obj, key) => obj?.[key], data);
    if (value !== undefined && value !== null) {
      return Array.isArray(value) ? value.length : Number(value) || 0;
    }
  }
  return Array.isArray(data) ? data.length : 0;
};

/**
 * Helper pour extraire un nombre depuis différentes structures de réponse
 */
const extractNumber = (data: any, paths: string[]): number => {
  for (const path of paths) {
    const value = path.split(".").reduce((obj, key) => obj?.[key], data);
    if (value !== undefined && value !== null) {
      return Number(value) || 0;
    }
  }
  return 0;
};

/**
 * Récupère les statistiques du dashboard en orchestrant les appels aux services
 * GET /api/admin/statistics/dashboard?year=2025
 */
export const handleDashboardStatistics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user as AuthenticatedUser;
    if (!user) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }

    const year = req.query["year"]
      ? parseInt(req.query["year"] as string)
      : new Date().getFullYear();

    if (isNaN(year) || year < 2025) {
      res.status(400).json({
        error: "Année invalide",
        message: "L'année doit être >= 2025",
      });
      return;
    }

    const headers = {
      "x-user-id": String(user.userId),
      "x-user-email": user.email,
      "Content-Type": "application/json",
    };

    // Appels parallèles aux services
    const [productsRes, customersRes, ordersRes, revenueRes] =
      await Promise.all([
        fetch(`${SERVICES.product}/api/admin/products?year=${year}`, {
          headers,
        }),
        fetch(`${SERVICES.customer}/api/admin/customers`, { headers }),
        fetch(`${SERVICES.order}/api/admin/orders?year=${year}`, { headers }),
        fetch(`${SERVICES.order}/api/admin/statistics/orders?year=${year}`, {
          headers,
        }),
      ]);

    // Vérifier et parser les réponses
    const responses = [
      { res: productsRes, name: "produits" },
      { res: customersRes, name: "clients" },
      { res: ordersRes, name: "commandes" },
      { res: revenueRes, name: "statistiques de revenus" },
    ];

    for (const { res: response, name } of responses) {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        res.status(response.status).json({
          error: `Erreur lors du chargement des ${name}`,
          details: errorData,
        });
        return;
      }
    }

    // Parser les réponses JSON
    const [productsJson, customersJson, ordersJson, revenueJson] =
      await Promise.all([
        productsRes.json(),
        customersRes.json(),
        ordersRes.json(),
        revenueRes.json(),
      ]);

    // Extraire les statistiques avec normalisation
    const statistics: DashboardStatistics = {
      productsCount: extractCount(productsJson, ["data.products", "products"]),
      customersCount: extractCount(customersJson, [
        "data.customers",
        "customers",
      ]),
      ordersCount: extractCount(ordersJson, [
        "data.pagination.total",
        "pagination.total",
        "data.orders",
        "orders",
      ]),
      totalRevenue: extractNumber(revenueJson, [
        "data.statistics.totalAmountTTC",
        "statistics.totalAmountTTC",
        "data.totalAmountTTC",
        "totalAmountTTC",
        "data.statistics.totalAmount",
        "statistics.totalAmount",
        "data.totalAmount",
        "totalAmount",
      ]),
      totalRevenueHT: extractNumber(revenueJson, [
        "data.statistics.totalAmountHT",
        "statistics.totalAmountHT",
        "data.totalAmountHT",
        "totalAmountHT",
      ]),
    };

    res.json({
      success: true,
      data: { statistics, year },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      message:
        error instanceof Error
          ? error.message
          : "Erreur inconnue lors de l'agrégation des statistiques",
    });
  }
};
