"use client";

import React from "react";
import { StatCard } from "../shared";
import { useDashboardStats } from "../../hooks";
import styles from "../../styles/components/DashboardCards.module.css";

/**
 * Composant d'affichage des statistiques du dashboard
 * Toute la logique métier est gérée par le hook useDashboardStats
 */
const StatsOverview: React.FC = () => {
  const {
    stats,
    isLoading,
    error,
    availableYears,
    selectedYear,
    setSelectedYear,
  } = useDashboardStats();

  if (isLoading) {
    return (
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Chargement...</h3>
          <p className={styles.statNumber}>—</p>
          <p className={styles.statLabel}>Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Erreur</h3>
          <p className={styles.statNumber}>!</p>
          <p className={styles.statLabel}>{error}</p>
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
          value={selectedYear || ""}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          disabled={!selectedYear}
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
      <div className={styles.statsContainer} style={{ marginBottom: "2rem" }}>
        <StatCard title="Produits" value={stats?.productsCount ?? 0} />
        <StatCard title="Clients" value={stats?.customersCount ?? 0} />
        <StatCard title="Commandes" value={stats?.ordersCount ?? 0} />
        <StatCard
          title="Chiffre d'Affaires"
          value={`${stats?.totalRevenueHT ?? 0} €`}
        />
      </div>
    </div>
  );
};

export default StatsOverview;
