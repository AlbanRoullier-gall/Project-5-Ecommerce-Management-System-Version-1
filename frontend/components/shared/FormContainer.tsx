import React from "react";
import styles from "../../styles/components/FormContainer.module.css";

interface FormContainerProps {
  children: React.ReactNode;
  className?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div className={`${styles.container} ${className ?? ""}`}>{children}</div>
  );
};

export default FormContainer;
