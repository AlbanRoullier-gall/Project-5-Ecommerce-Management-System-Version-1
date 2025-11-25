import React from "react";

/**
 * Props du composant SearchInput
 */
interface SearchInputProps {
  /** Valeur du champ de recherche */
  value: string;
  /** Callback appelé lors du changement de valeur */
  onChange: (value: string) => void;
  /** Texte de placeholder */
  placeholder?: string;
}

/**
 * Composant de champ de recherche
 * Affiche un input de texte avec icône de recherche pour filtrer les produits
 *
 * @example
 * <SearchInput
 *   value={searchTerm}
 *   onChange={setSearchTerm}
 * />
 */
const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Nom du produit...",
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
    <div style={{ minWidth: "300px", maxWidth: "100%" }}>
      <label htmlFor="search" style={labelStyle}>
        <i className="fas fa-search" style={{ marginRight: "0.5rem" }}></i>
        Rechercher
      </label>
      <input
        type="text"
        id="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
  );
};

export default SearchInput;
