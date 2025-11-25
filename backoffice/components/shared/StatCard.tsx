import React from "react";

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
    <div className="stat-card">
      <h3>{title}</h3>
      <p className="stat-number">{typeof value === "number" ? value : value}</p>
      {subtitle ? <p className="stat-label">{subtitle}</p> : null}
    </div>
  );
};

export default StatCard;

