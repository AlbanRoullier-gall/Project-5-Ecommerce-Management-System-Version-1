"use client";

import React, { useEffect, useState } from "react";
import StatCard from "./StatCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3020";

interface StatsData {
  productsCount: number;
  customersCount: number;
  ordersCount: number;
  totalRevenue: number; // TTC
  totalRevenueHT?: number; // HT (admin)
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

const StatsOverview: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const getAuthToken = () => localStorage.getItem("auth_token");

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Non authentifié");

      // Appels parallèles vers l'API Gateway (admin routes)
      // Note: Les clients ne sont pas filtrés par année
      const [productsRes, customersRes, ordersRes, revenueRes] =
        await Promise.all([
          fetch(`${API_URL}/api/admin/products?year=${selectedYear}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/admin/customers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/admin/orders?year=${selectedYear}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // Statistiques admin pour récupérer TTC et HT
          fetch(`${API_URL}/api/admin/statistics/orders?year=${selectedYear}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      if (!productsRes.ok) throw new Error("Erreur chargement produits");
      if (!customersRes.ok) throw new Error("Erreur chargement clients");
      if (!ordersRes.ok) throw new Error("Erreur chargement commandes");
      if (!revenueRes.ok) throw new Error("Erreur chargement statistiques");

      const [productsJson, customersJson, ordersJson, revenueJson] =
        await Promise.all([
          productsRes.json(),
          customersRes.json(),
          ordersRes.json(),
          revenueRes.json(),
        ]);

      const productsCount =
        productsJson?.data?.products?.length ??
        productsJson?.products?.length ??
        (Array.isArray(productsJson) ? productsJson.length : 0);

      const customersCount =
        customersJson?.data?.customers?.length ??
        customersJson?.customers?.length ??
        (Array.isArray(customersJson) ? customersJson.length : 0);

      const ordersCount =
        ordersJson?.data?.pagination?.total ??
        ordersJson?.pagination?.total ??
        ordersJson?.data?.orders?.length ??
        ordersJson?.orders?.length ??
        (Array.isArray(ordersJson) ? ordersJson.length : 0);

      const totalRevenue = Number(
        revenueJson?.data?.statistics?.totalAmount ??
          revenueJson?.statistics?.totalAmount ??
          revenueJson?.data?.totalAmount ??
          revenueJson?.totalAmount ??
          0
      );

      const totalRevenueHT = Number(
        revenueJson?.data?.statistics?.totalAmountHT ??
          revenueJson?.statistics?.totalAmountHT ??
          0
      );

      setStats({
        productsCount,
        customersCount,
        ordersCount,
        totalRevenue,
        totalRevenueHT,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [selectedYear]);

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

  // Générer les années disponibles (2025 à année actuelle + 5)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    { length: currentYear - 2025 + 6 },
    (_, i) => 2025 + i
  );

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
