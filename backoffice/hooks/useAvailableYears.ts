/**
 * Hook personnalisé pour récupérer les années disponibles depuis l'API
 * Centralise la logique de récupération des années pour éviter la duplication
 */

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook pour récupérer les années disponibles depuis l'API
 * @returns {number[]} Liste des années disponibles
 */
export const useAvailableYears = (): number[] => {
  const { apiCall } = useAuth();
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        // Récupérer les années depuis l'endpoint dashboard avec l'année actuelle
        const currentYear = new Date().getFullYear();
        const response = await apiCall<{
          data: {
            availableYears?: number[];
          };
        }>({
          url: `/api/admin/statistics/dashboard?year=${currentYear}`,
          method: "GET",
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
  }, [apiCall]);

  return availableYears;
};
