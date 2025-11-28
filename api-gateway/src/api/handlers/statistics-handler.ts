/**
 * Handler pour les statistiques du dashboard
 * Orchestre les appels aux services (pas de logique métier)
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
 * Récupère les statistiques du dashboard en orchestrant les appels aux services
 * GET /api/admin/statistics/dashboard?year=2025
 */
export const handleDashboardStatistics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user as AuthenticatedUser; // requireAuth garantit que user existe
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
    const [productsStatsRes, customersStatsRes, ordersStatsRes] =
      await Promise.all([
        fetch(
          `${SERVICES.product}/api/admin/statistics/dashboard?year=${year}`,
          {
            headers,
          }
        ),
        fetch(`${SERVICES.customer}/api/admin/statistics/dashboard`, {
          headers,
        }),
        fetch(`${SERVICES.order}/api/admin/statistics/dashboard?year=${year}`, {
          headers,
        }),
      ]);

    // Vérifier et parser les réponses
    const responses = [
      { res: productsStatsRes, name: "statistiques de produits" },
      { res: customersStatsRes, name: "statistiques de clients" },
      { res: ordersStatsRes, name: "statistiques de commandes" },
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
    const [productsStatsJson, customersStatsJson, ordersStatsJson] =
      await Promise.all([
        productsStatsRes.json(),
        customersStatsRes.json(),
        ordersStatsRes.json(),
      ]);

    // Extraire les statistiques (déjà formatées par les services)
    const productsStats = (productsStatsJson as any)?.data?.statistics || {};
    const customersStats = (customersStatsJson as any)?.data?.statistics || {};
    const ordersStats = (ordersStatsJson as any)?.data?.statistics || {};

    const statistics: DashboardStatistics = {
      productsCount: productsStats.productsCount || 0,
      customersCount: customersStats.customersCount || 0,
      ordersCount: ordersStats.ordersCount || 0,
      totalRevenue: ordersStats.totalRevenue || 0,
      totalRevenueHT: ordersStats.totalRevenueHT || 0,
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
