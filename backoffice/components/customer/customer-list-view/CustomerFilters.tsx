import React from "react";
import { SearchInput, FilterContainer } from "../../shared";

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
    <FilterContainer>
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Rechercher par nom, email ou téléphone..."
      />
    </FilterContainer>
  );
};

export default CustomerFilters;
