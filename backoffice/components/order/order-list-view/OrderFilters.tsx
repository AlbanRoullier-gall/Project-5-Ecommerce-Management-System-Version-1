import React from "react";
import SearchInput from "../../shared/filters/SearchInput";

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
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "2rem",
        marginBottom: "2rem",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        border: "2px solid rgba(19, 104, 106, 0.1)",
      }}
    >
      <div
        className="filters-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Rechercher par ID, client ou email..."
        />

        {/* Filtre par état de livraison */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#13686a",
              marginBottom: "0.5rem",
            }}
          >
            État de livraison
          </label>
          <select
            value={deliveryFilter}
            onChange={(e) => onDeliveryFilterChange(e.target.value)}
            style={{
              padding: "0.75rem 1rem",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "1rem",
              backgroundColor: "white",
              color: "#333",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#13686a";
              e.target.style.boxShadow = "0 0 0 3px rgba(19, 104, 106, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e0e0e0";
              e.target.style.boxShadow = "none";
            }}
          >
            <option value="">Toutes les commandes</option>
            <option value="delivered">Livrées</option>
            <option value="pending">En attente</option>
          </select>
        </div>

        {/* Filtre par année */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#13686a",
              marginBottom: "0.5rem",
            }}
          >
            Année
          </label>
          <select
            value={yearFilter}
            onChange={(e) => onYearFilterChange(e.target.value)}
            style={{
              padding: "0.75rem 1rem",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "1rem",
              backgroundColor: "white",
              color: "#333",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#13686a";
              e.target.style.boxShadow = "0 0 0 3px rgba(19, 104, 106, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e0e0e0";
              e.target.style.boxShadow = "none";
            }}
          >
            <option value="">Toutes les années</option>
            {availableYears.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
