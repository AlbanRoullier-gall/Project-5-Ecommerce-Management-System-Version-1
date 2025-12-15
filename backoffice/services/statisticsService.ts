/**
 * Service pour les statistiques (backoffice)
 * Gère tous les appels API liés aux statistiques admin
 */

import { apiClient } from "./apiClient";
import {
  OrderStatisticsRequestDTO,
  DashboardStatisticsResponseDTO,
} from "dto";
import { ApiResponse } from "./apiClient";

/**
 * Interface pour les statistiques du dashboard
 */
export interface DashboardStatistics {
  productsCount?: number;
  customersCount?: number;
  ordersCount?: number;
  totalRevenue?: number;
  totalRevenueHT?: number;
}

/**
 * Interface pour la réponse complète du dashboard
 */
export interface DashboardStatisticsResponse {
  statistics: DashboardStatistics;
  availableYears?: number[];
  defaultYear?: number;
  year?: number;
}

/**
 * Récupère les statistiques du dashboard
 */
export async function getDashboardStatistics(
  year?: number
): Promise<DashboardStatisticsResponse> {
  const endpoint = year
    ? `/api/admin/statistics/dashboard?year=${year}`
    : `/api/admin/statistics/dashboard`;

  const response = await apiClient.get<
    ApiResponse<{
      statistics: DashboardStatistics;
      availableYears?: number[];
      defaultYear?: number;
      year?: number;
    }>
  >(endpoint);

  if (!response.data) {
    throw new Error("Format de réponse invalide pour les statistiques");
  }

  return {
    statistics: response.data.statistics,
    availableYears: response.data.availableYears,
    defaultYear: response.data.defaultYear,
    year: response.data.year,
  };
}

