import React from "react";
import SearchInput from "../product/filters/SearchInput";

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  onSearchChange,
}) => {
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
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Rechercher par ID, client ou email..."
        />
      </div>
    </div>
  );
};

export default OrderFilters;
