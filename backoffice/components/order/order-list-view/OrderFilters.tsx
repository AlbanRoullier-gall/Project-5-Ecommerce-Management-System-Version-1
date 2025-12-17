import React from "react";
import { SearchInput, FilterContainer, FilterSelect } from "../../shared";
import { useAvailableYears } from "../../../hooks";
import styles from "../../../styles/components/OrderFilters.module.css";

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  deliveryFilter: string;
  onDeliveryFilterChange: (value: string) => void;
  yearFilter: string;
  onYearFilterChange: (value: string) => void;
  totalFilter: string;
  onTotalFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  onResetFilters: () => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  onSearchChange,
  deliveryFilter,
  onDeliveryFilterChange,
  yearFilter,
  onYearFilterChange,
  totalFilter,
  onTotalFilterChange,
  dateFilter,
  onDateFilterChange,
  onResetFilters,
}) => {
  // Récupérer les années disponibles depuis l'API
  const availableYears = useAvailableYears();

  const yearOptions = availableYears.map((year) => ({
    value: year.toString(),
    label: year.toString(),
  }));

  return (
    <FilterContainer>
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Rechercher par référence, client ou email..."
      />
      <FilterSelect
        id="delivery"
        label="État de livraison"
        value={deliveryFilter}
        onChange={onDeliveryFilterChange}
        placeholder="Toutes les commandes"
        options={[
          { value: "delivered", label: "Livrées" },
          { value: "pending", label: "En attente" },
        ]}
      />
      <FilterSelect
        id="year"
        label="Année"
        value={yearFilter}
        onChange={onYearFilterChange}
        placeholder="Toutes les années"
        options={yearOptions}
      />
      <div className={styles.field}>
        <label htmlFor="totalFilter" className={styles.label}>
          <i className={`fas fa-euro-sign ${styles.icon}`}></i>
          Total HT/TTC
        </label>
        <input
          type="number"
          id="totalFilter"
          value={totalFilter}
          onChange={(e) => onTotalFilterChange(e.target.value)}
          placeholder="Rechercher par montant..."
          step="0.01"
          min="0"
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="dateFilter" className={styles.label}>
          <i className={`fas fa-calendar-alt ${styles.icon}`}></i>
          Date de création
        </label>
        <input
          type="date"
          id="dateFilter"
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
          className={styles.input}
        />
      </div>
      <div className={styles.actions}>
        <button onClick={onResetFilters} className={styles.resetButton}>
          <i className={`fas fa-redo ${styles.resetIcon}`}></i>
          <span>Réinitialiser les filtres</span>
        </button>
      </div>
    </FilterContainer>
  );
};

export default OrderFilters;
