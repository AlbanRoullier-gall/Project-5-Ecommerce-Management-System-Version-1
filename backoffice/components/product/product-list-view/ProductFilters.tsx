import React from "react";
import { SearchInput, FilterContainer } from "../../shared";
import CategoryFilter from "./filters/CategoryFilter";
import StatusFilter from "./filters/StatusFilter";

/**
 * Props du composant ProductFilters
 */
interface ProductFiltersProps {
  /** Terme de recherche */
  searchTerm: string;
  /** Callback appelé lors du changement de recherche */
  onSearchChange: (value: string) => void;
  /** ID de la catégorie sélectionnée */
  selectedCategory: string;
  /** Callback appelé lors du changement de catégorie */
  onCategoryChange: (value: string) => void;
  /** Filtre de statut (vide, "active" ou "inactive") */
  statusFilter: string;
  /** Callback appelé lors du changement de statut */
  onStatusFilterChange: (value: string) => void;
  /** Liste des catégories disponibles */
  categories: Array<{ id: number; name: string }>;
}

/**
 * Composant de filtres de produits
 * Regroupe les trois filtres : recherche, catégorie et statut
 * Utilise une grille responsive pour l'affichage
 *
 * @example
 * <ProductFilters
 *   searchTerm={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   selectedCategory={selectedCategory}
 *   onCategoryChange={setSelectedCategory}
 *   statusFilter={statusFilter}
 *   onStatusFilterChange={setStatusFilter}
 *   categories={categories}
 * />
 */
const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  statusFilter,
  onStatusFilterChange,
  categories,
}) => {
  return (
    <FilterContainer>
        <SearchInput value={searchTerm} onChange={onSearchChange} />
        <CategoryFilter
          value={selectedCategory}
          onChange={onCategoryChange}
          categories={categories}
        />
        <StatusFilter value={statusFilter} onChange={onStatusFilterChange} />
    </FilterContainer>
  );
};

export default ProductFilters;
