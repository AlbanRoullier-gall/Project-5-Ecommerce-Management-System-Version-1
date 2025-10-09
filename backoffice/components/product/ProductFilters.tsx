import React from "react";

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  categories: Array<{ id: number; name: string }>;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  statusFilter,
  onStatusFilterChange,
  categories,
}) => {
  const inputStyle: React.CSSProperties = {
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
        {/* Recherche */}
        <div style={{ minWidth: "300px", maxWidth: "100%" }}>
          <label htmlFor="search" style={labelStyle}>
            <i className="fas fa-search" style={{ marginRight: "0.5rem" }}></i>
            Rechercher
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nom du produit..."
            style={inputStyle}
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
          />
        </div>

        {/* Filtre par catégorie */}
        <div style={{ minWidth: "300px", maxWidth: "100%" }}>
          <label htmlFor="category" style={labelStyle}>
            <i className="fas fa-tags" style={{ marginRight: "0.5rem" }}></i>
            Catégorie
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            style={inputStyle}
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

        {/* Filtre par statut */}
        <div style={{ minWidth: "300px", maxWidth: "100%" }}>
          <label htmlFor="status" style={labelStyle}>
            <i
              className="fas fa-toggle-on"
              style={{ marginRight: "0.5rem" }}
            ></i>
            Statut
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            style={inputStyle}
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
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
