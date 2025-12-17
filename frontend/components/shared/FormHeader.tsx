import React from "react";
import StepBadge from "./StepBadge";
import styles from "../../styles/components/FormHeader.module.css";

interface FormHeaderProps {
  stepNumber: number | string;
  title: string;
  badgeSize?: "small" | "medium" | "large";
}

const FormHeader: React.FC<FormHeaderProps> = ({
  stepNumber,
  title,
  badgeSize = "medium",
}) => {
  return (
    <div className={styles.header}>
      <StepBadge number={stepNumber} size={badgeSize} />
      <h2 className={styles.title}>{title}</h2>
    </div>
  );
};

export default FormHeader;
