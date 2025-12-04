/**
 * Hook personnalisé pour gérer les statistiques du dashboard
 * Centralise la logique de récupération des statistiques
 */

import { useState, useEffect, useCallback } from "react";
import { OrderStatisticsRequestDTO } from "../../dto";
import { getDashboardStatistics } from "../../services/statisticsService";
import { executeWithLoading } from "../../utils";

interface StatsData {
  productsCount: number;
  customersCount: number;
  ordersCount: number;
  totalRevenue: number;
  totalRevenueHT: number;
}

interface UseDashboardStatsReturn {
  stats: StatsData | null;
  isLoading: boolean;
  error: string | null;
  availableYears: number[];
  selectedYear: OrderStatisticsRequestDTO["year"] | undefined;
  setSelectedYear: (
    year: OrderStatisticsRequestDTO["year"] | undefined
  ) => void;
  loadStats: () => Promise<void>;
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<
    OrderStatisticsRequestDTO["year"] | undefined
  >(undefined);

  const loadStats = useCallback(async () => {
    const result = await executeWithLoading(
      async () => await getDashboardStatistics(selectedYear),
      setIsLoading,
      setError,
      {
        defaultMessage: "Erreur lors du chargement des statistiques",
      }
    );

    if (result) {
      if (result.availableYears && Array.isArray(result.availableYears)) {
        setAvailableYears(result.availableYears);
      }

      // Au premier chargement (selectedYear undefined), utiliser defaultYear de l'API
      if (selectedYear === undefined) {
        const yearToUse =
          result.defaultYear !== undefined ? result.defaultYear : result.year;
        if (yearToUse !== undefined) {
          setSelectedYear(yearToUse);
          // Les stats sont déjà chargées, pas besoin de recharger
        }
      }

      setStats({
        productsCount: result.statistics.productsCount ?? 0,
        customersCount: result.statistics.customersCount ?? 0,
        ordersCount: result.statistics.ordersCount ?? 0,
        totalRevenue: result.statistics.totalRevenue ?? 0,
        totalRevenueHT: result.statistics.totalRevenueHT ?? 0,
      });
    }
  }, [selectedYear]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    isLoading,
    error,
    availableYears,
    selectedYear,
    setSelectedYear,
    loadStats,
  };
}
