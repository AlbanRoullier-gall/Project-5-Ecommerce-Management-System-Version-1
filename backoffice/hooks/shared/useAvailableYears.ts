/**
 * Hook personnalisé pour récupérer les années disponibles depuis l'API
 * Centralise la logique de récupération des années pour éviter la duplication
 */

import { useState, useEffect } from "react";
import { apiClient } from "../../services/apiClient";
import { ApiResponse } from "../../services/apiClient";

/**
 * Hook pour récupérer les années disponibles depuis l'API
 * @returns {number[]} Liste des années disponibles
 */
export const useAvailableYears = (): number[] => {
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        // Récupérer les années depuis l'endpoint dashboard avec l'année actuelle
        const currentYear = new Date().getFullYear();
        const response = await apiClient.get<
          ApiResponse<{
            availableYears?: number[];
          }>
        >(`/api/admin/statistics/dashboard?year=${currentYear}`, {
          requireAuth: true,
        });

        if (
          response.data?.availableYears &&
          Array.isArray(response.data.availableYears)
        ) {
          setAvailableYears(response.data.availableYears);
        }
      } catch (error) {
        console.error("Error fetching available years:", error);
      }
    };

    fetchAvailableYears();
  }, []);

  return availableYears;
};
