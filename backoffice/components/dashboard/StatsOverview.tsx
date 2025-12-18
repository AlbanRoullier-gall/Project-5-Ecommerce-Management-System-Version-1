"use client";

import React from "react";
import { StatCard } from "../shared";
import { useDashboardStats } from "../../hooks";
import cardStyles from "../../styles/components/DashboardCards.module.css";
import pageStyles from "../../styles/components/DashboardPage.module.css";

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
      <div className={cardStyles.statsContainer}>
        <div className={cardStyles.statCard}>
          <h3 className={cardStyles.statTitle}>Chargement...</h3>
          <p className={cardStyles.statNumber}>—</p>
          <p className={cardStyles.statLabel}>Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cardStyles.statsContainer}>
        <div className={cardStyles.statCard}>
          <h3 className={cardStyles.statTitle}>Erreur</h3>
          <p className={cardStyles.statNumber}>!</p>
          <p className={cardStyles.statLabel}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={pageStyles.wrapper}>
      {/* Filtre par année - En haut, centré */}
      <div className={pageStyles.filterBox}>
        <label htmlFor="year-select" className={pageStyles.filterLabel}>
          Filtrer par année :
        </label>
        <select
          id="year-select"
          value={selectedYear || ""}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          disabled={!selectedYear}
          className={pageStyles.yearSelect}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Cards de statistiques - Grille responsive */}
      <div className={`${cardStyles.statsContainer} ${pageStyles.statsBlock}`}>
        <StatCard title="Produits" value={stats?.productsCount ?? 0} />
        <StatCard title="Clients" value={stats?.customersCount ?? 0} />
        <StatCard title="Commandes" value={stats?.ordersCount ?? 0} />
        <StatCard
          title="Chiffre d'Affaires"
          value={`${stats?.totalRevenueHT ?? 0} €`}
        />
        <StatCard
          title="Commandes Non Livrées"
          value={stats?.undeliveredOrdersCount ?? 0}
        />
        <StatCard
          title="Avoirs Non Remboursés"
          value={stats?.unrefundedCreditNotesCount ?? 0}
        />
      </div>
    </div>
  );
};

export default StatsOverview;
