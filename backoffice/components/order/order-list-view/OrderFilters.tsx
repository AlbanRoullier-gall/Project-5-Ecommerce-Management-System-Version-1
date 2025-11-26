import React from "react";
import { SearchInput, FilterContainer, FilterSelect } from "../../shared";

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
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1rem",
        }}
      >
        <button
          onClick={onResetFilters}
          style={{
            padding: "0.75rem 1.5rem",
            border: "2px solid #ef4444",
            borderRadius: "10px",
            fontSize: "1rem",
            fontWeight: "600",
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            color: "white",
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(239, 68, 68, 0.3)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <i className="fas fa-redo" style={{ marginRight: "0.5rem" }}></i>
          Réinitialiser les filtres
        </button>
      </div>
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
        <div style={{ minWidth: "200px", maxWidth: "100%" }}>
          <label
            htmlFor="totalFilter"
            style={{
              display: "block",
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "#13686a",
              marginBottom: "0.75rem",
            }}
          >
            <i
              className="fas fa-euro-sign"
              style={{ marginRight: "0.5rem" }}
            ></i>
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
            style={{
              width: "100%",
              padding: "1rem 1.25rem",
              border: "2px solid #e1e5e9",
              borderRadius: "10px",
              fontSize: "1rem",
              transition: "all 0.3s ease",
              background: "#f8f9fa",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#13686a";
              e.currentTarget.style.background = "white";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(19, 104, 106, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e1e5e9";
              e.currentTarget.style.background = "#f8f9fa";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
        <div style={{ minWidth: "200px", maxWidth: "100%" }}>
          <label
            htmlFor="dateFilter"
            style={{
              display: "block",
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "#13686a",
              marginBottom: "0.75rem",
            }}
          >
            <i
              className="fas fa-calendar-alt"
              style={{ marginRight: "0.5rem" }}
            ></i>
            Date de création
          </label>
          <input
            type="date"
            id="dateFilter"
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            style={{
              width: "100%",
              padding: "1rem 1.25rem",
              border: "2px solid #e1e5e9",
              borderRadius: "10px",
              fontSize: "1rem",
              transition: "all 0.3s ease",
              background: "#f8f9fa",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#13686a";
              e.currentTarget.style.background = "white";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(19, 104, 106, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e1e5e9";
              e.currentTarget.style.background = "#f8f9fa";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
      </FilterContainer>
    </>
  );
};

export default OrderFilters;
