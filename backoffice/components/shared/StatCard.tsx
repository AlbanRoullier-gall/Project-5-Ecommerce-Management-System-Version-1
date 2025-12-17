import React from "react";
import styles from "../../styles/components/DashboardCards.module.css";

/**
 * Props du composant StatCard
 */
interface StatCardProps {
  /** Titre de la statistique */
  title: string;
  /** Valeur de la statistique */
  value: string | number;
  /** Sous-titre optionnel */
  subtitle?: string;
}

/**
 * Composant de carte de statistique réutilisable
 * Affiche une carte avec un titre, une valeur et un sous-titre optionnel
 *
 * @example
 * <StatCard title="Total ventes" value={1250} subtitle="Ce mois" />
 */
const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle }) => {
  return (
    <div className={styles.statCard}>
      <h3 className={styles.statTitle}>{title}</h3>
      <p className={styles.statNumber}>
        {typeof value === "number" ? value : value}
      </p>
      {subtitle ? <p className={styles.statLabel}>{subtitle}</p> : null}
    </div>
  );
};

export default StatCard;
