import React from "react";

/**
 * Variante de ligne de résumé
 */
export type SummaryRowVariant = "default" | "total";

/**
 * Props du composant SummaryRow
 */
interface SummaryRowProps {
  /** Label de la ligne */
  label: string;
  /** Valeur à afficher */
  value: string | number;
  /** Variante de la ligne (default ou total) */
  variant?: SummaryRowVariant;
  /** Callback de formatage personnalisé (optionnel) */
  formatValue?: (value: string | number) => string;
}

/**
 * Composant de ligne de résumé réutilisable
 * Affiche une ligne avec un label et une valeur (pour les totaux, prix, etc.)
 *
 * @example
 * <SummaryRow label="Total HT" value={100.50} />
 * <SummaryRow label="Total TTC" value={121.60} variant="total" />
 */
const SummaryRow: React.FC<SummaryRowProps> = ({
  label,
  value,
  variant = "default",
  formatValue,
}) => {
  const formattedValue = formatValue
    ? formatValue(value)
    : typeof value === "number"
    ? value.toFixed(2)
    : value;

  const isTotal = variant === "total";

  const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    padding: isTotal ? "1.5rem 0" : "0.6rem 0",
    fontSize: isTotal ? "1.8rem" : "1.4rem",
    color: isTotal ? "#13686a" : "#555",
    fontWeight: isTotal ? "700" : "700",
    borderTop: isTotal ? "2px solid #e0e0e0" : "none",
    marginTop: isTotal ? "1rem" : "0",
  };

  return (
    <div className="summary-row" style={rowStyle}>
      <span>{label}</span>
      <span>{formattedValue}</span>
    </div>
  );
};

export default SummaryRow;
