/**
 * Hook personnalisé pour récupérer les années disponibles depuis l'API
 * Centralise la logique de récupération des années pour éviter la duplication
 */

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

/**
 * Hook pour récupérer les années disponibles depuis l'API
 * @returns {number[]} Liste des années disponibles
 */
export const useAvailableYears = (): number[] => {
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          console.warn("No auth token available for fetching available years");
          return;
        }

        // Récupérer les années depuis l'endpoint dashboard avec l'année actuelle
        const currentYear = new Date().getFullYear();
        const response = await fetch(
          `${API_URL}/api/admin/statistics/dashboard?year=${currentYear}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (
            data.data?.availableYears &&
            Array.isArray(data.data.availableYears)
          ) {
            setAvailableYears(data.data.availableYears);
          }
        } else {
          console.error("Failed to fetch available years from API");
        }
      } catch (error) {
        console.error("Error fetching available years:", error);
      }
    };

    fetchAvailableYears();
  }, []);

  return availableYears;
};
