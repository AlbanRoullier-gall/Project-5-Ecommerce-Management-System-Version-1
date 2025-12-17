import React from "react";
import styles from "../../../styles/components/FilterContainer.module.css";

interface FilterContainerProps {
  children: React.ReactNode;
}

const FilterContainer: React.FC<FilterContainerProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>{children}</div>
    </div>
  );
};

export default FilterContainer;
