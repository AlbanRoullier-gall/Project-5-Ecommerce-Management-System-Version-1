"use client";

import React, { useEffect, useState, useCallback } from "react";
import { StatCard } from "../shared";
import { OrderStatisticsRequestDTO } from "../../dto";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../shared/utils/formatPrice";

interface StatsData {
  productsCount: number;
  customersCount: number;
  ordersCount: number;
  totalRevenue: number; // TTC
  totalRevenueHT: number; // HT (admin)
}

const StatsOverview: React.FC = () => {
  const { apiCall } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  // Utilise le type year de OrderStatisticsRequestDTO pour cohérence
  const [selectedYear, setSelectedYear] = useState<
    OrderStatisticsRequestDTO["year"]
  >(new Date().getFullYear());

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCall<{
        data: {
          statistics: {
            productsCount?: number;
            customersCount?: number;
            ordersCount?: number;
            totalRevenue?: number;
            totalRevenueHT?: number;
          };
          availableYears?: number[];
        };
      }>({
        url: `/api/admin/statistics/dashboard?year=${selectedYear}`,
        method: "GET",
        requireAuth: true,
      });

      const { statistics, availableYears: years } = response.data;

      if (!statistics) {
        throw new Error("Format de réponse invalide");
      }

      // Utiliser les années disponibles depuis l'API
      if (years && Array.isArray(years)) {
        setAvailableYears(years);
      }

      setStats({
        productsCount: statistics.productsCount ?? 0,
        customersCount: statistics.customersCount ?? 0,
        ordersCount: statistics.ordersCount ?? 0,
        totalRevenue: statistics.totalRevenue ?? 0,
        totalRevenueHT: statistics.totalRevenueHT ?? 0,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, apiCall]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (isLoading) {
    return (
      <div className="stats-container">
        <div className="stat-card">
          <h3>Chargement...</h3>
          <p className="stat-number">—</p>
          <p className="stat-label">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-container">
        <div className="stat-card">
          <h3>Erreur</h3>
          <p className="stat-number">!</p>
          <p className="stat-label">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 1rem",
      }}
    >
      {/* Filtre par année - En haut, centré */}
      <div
        style={{
          marginBottom: "2rem",
          textAlign: "center",
          padding: "1rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #e9ecef",
        }}
      >
        <label
          htmlFor="year-select"
          style={{
            display: "inline-block",
            marginRight: "1rem",
            fontWeight: "600",
            color: "#13686a",
            fontSize: "1.1rem",
          }}
        >
          Filtrer par année :
        </label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          style={{
            padding: "0.5rem 1rem",
            border: "2px solid #13686a",
            borderRadius: "6px",
            backgroundColor: "white",
            color: "#13686a",
            fontSize: "1rem",
            fontWeight: "600",
            minWidth: "120px",
            cursor: "pointer",
          }}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Cards de statistiques - Grille responsive */}
      <div
        className="stats-container"
        style={{
          marginBottom: "2rem",
        }}
      >
        <StatCard title="Produits" value={stats?.productsCount ?? 0} />
        <StatCard title="Clients" value={stats?.customersCount ?? 0} />
        <StatCard title="Commandes" value={stats?.ordersCount ?? 0} />
        <StatCard
          title="Chiffre d'Affaires"
          value={formatCurrency(stats?.totalRevenueHT ?? 0)}
        />
      </div>
    </div>
  );
};

export default StatsOverview;
