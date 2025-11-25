import React from "react";
import SearchInput from "../shared/filters/SearchInput";

/**
 * Props du composant CustomerFilters
 */
interface CustomerFiltersProps {
  /** Terme de recherche actuel */
  searchTerm: string;
  /** Callback appelé lors du changement de recherche */
  onSearchChange: (value: string) => void;
}

/**
 * Composant de filtres pour la liste des clients
 * Affiche les filtres de recherche et de statut
 */
const CustomerFilters: React.FC<CustomerFiltersProps> = ({
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
        className="filters-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* Recherche */}
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Rechercher par nom, email ou téléphone..."
        />
      </div>
    </div>
  );
};

export default CustomerFilters;
