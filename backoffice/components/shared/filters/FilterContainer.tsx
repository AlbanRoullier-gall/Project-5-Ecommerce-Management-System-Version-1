import React from "react";

/**
 * Props du composant FilterContainer
 */
interface FilterContainerProps {
  /** Enfants (composants de filtres) */
  children: React.ReactNode;
}

/**
 * Composant conteneur pour les filtres
 * Style uniforme pour tous les conteneurs de filtres
 *
 * @example
 * <FilterContainer>
 *   <SearchInput value={search} onChange={setSearch} />
 *   <FilterSelect ... />
 * </FilterContainer>
 */
const FilterContainer: React.FC<FilterContainerProps> = ({ children }) => {
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
        {children}
      </div>
    </div>
  );
};

export default FilterContainer;
