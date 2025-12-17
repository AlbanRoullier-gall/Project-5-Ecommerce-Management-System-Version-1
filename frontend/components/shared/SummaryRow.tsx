import React from "react";
import styles from "../../styles/components/SummaryRow.module.css";

export type SummaryRowVariant = "default" | "total";

interface SummaryRowProps {
  label: string;
  value: string | number;
  variant?: SummaryRowVariant;
  formatValue?: (value: string | number) => string;
}

const SummaryRow: React.FC<SummaryRowProps> = ({
  label,
  value,
  variant = "default",
  formatValue,
}) => {
  const formattedValue = formatValue
    ? formatValue(value)
    : typeof value === "number"
    ? `${Number(value).toFixed(2)} €`
    : value;

  const isTotal = variant === "total";

  return (
    <div className={`${styles.row} ${isTotal ? styles.total : ""}`}>
      <span>{label}</span>
      <span>{formattedValue}</span>
    </div>
  );
};

export default SummaryRow;
