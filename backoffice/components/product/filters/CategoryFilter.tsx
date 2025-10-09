import React from "react";

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
  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "1rem 1.25rem",
    border: "2px solid #e1e5e9",
    borderRadius: "10px",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    background: "#f8f9fa",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#13686a",
    marginBottom: "0.75rem",
  };

  return (
    <div style={{ minWidth: "300px", maxWidth: "100%" }}>
      <label htmlFor="category" style={labelStyle}>
        <i className="fas fa-tags" style={{ marginRight: "0.5rem" }}></i>
        Catégorie
      </label>
      <select
        id="category"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={selectStyle}
        onFocus={(e) => {
          e.target.style.borderColor = "#13686a";
          e.target.style.background = "white";
          e.target.style.boxShadow = "0 0 0 3px rgba(19, 104, 106, 0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e1e5e9";
          e.target.style.background = "#f8f9fa";
          e.target.style.boxShadow = "none";
        }}
      >
        <option value="">Toutes les catégories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id.toString()}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;
