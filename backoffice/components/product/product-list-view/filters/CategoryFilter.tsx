import React from "react";
import FilterSelect from "../../../shared/filters/FilterSelect";

/**
 * Props du composant CategoryFilter
 */
interface CategoryFilterProps {
  /** ID de la catégorie sélectionnée (string vide pour "toutes") */
  value: string;
  /** Callback appelé lors du changement de catégorie */
  onChange: (value: string) => void;
  /** Liste des catégories disponibles */
  categories: Array<{ id: number; name: string }>;
}

/**
 * Composant de filtre par catégorie
 * Affiche un select permettant de filtrer les produits par catégorie
 *
 * @example
 * <CategoryFilter
 *   value={selectedCategory}
 *   onChange={setSelectedCategory}
 *   categories={categories}
 * />
 */
const CategoryFilter: React.FC<CategoryFilterProps> = ({
  value,
  onChange,
  categories,
}) => {
  const options = categories.map((cat) => ({
    value: cat.id.toString(),
    label: cat.name,
  }));

  return (
    <FilterSelect
        id="category"
      label="Catégorie"
      icon="fas fa-tags"
        value={value}
      onChange={onChange}
      placeholder="Toutes les catégories"
      options={options}
    />
  );
};

export default CategoryFilter;
