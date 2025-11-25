import React from "react";
import { SearchInput, FilterContainer, FilterSelect } from "../../shared";

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  deliveryFilter: string;
  onDeliveryFilterChange: (value: string) => void;
  yearFilter: string;
  onYearFilterChange: (value: string) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  onSearchChange,
  deliveryFilter,
  onDeliveryFilterChange,
  yearFilter,
  onYearFilterChange,
}) => {
  // Générer les années disponibles (de 2025 à l'année actuelle + 5)
  const currentYear = new Date().getFullYear();
  const availableYears = [];
  for (let year = 2025; year <= currentYear + 5; year++) {
    availableYears.push(year);
  }

  const yearOptions = availableYears.map((year) => ({
    value: year.toString(),
    label: year.toString(),
  }));

  return (
    <FilterContainer>
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Rechercher par ID, client ou email..."
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
    </FilterContainer>
  );
};

export default OrderFilters;
