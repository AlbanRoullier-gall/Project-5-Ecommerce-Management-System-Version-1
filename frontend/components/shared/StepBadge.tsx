import React from "react";
import styles from "../../styles/components/StepBadge.module.css";

interface StepBadgeProps {
  number: number | string;
  size?: "small" | "medium" | "large";
}

const StepBadge: React.FC<StepBadgeProps> = ({ number, size = "medium" }) => {
  const sizeClass =
    size === "small"
      ? styles.small
      : size === "large"
      ? styles.large
      : styles.medium;

  return <div className={`${styles.badge} ${sizeClass}`}>{number}</div>;
};

export default StepBadge;
