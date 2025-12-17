import React from "react";
import styles from "../../../styles/components/SearchInput.module.css";

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
  return (
    <div className={styles.field}>
      <label htmlFor="search" className={styles.label}>
        <i className={`fas fa-search ${styles.icon}`}></i>
        Rechercher
      </label>
      <input
        type="text"
        id="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
      />
    </div>
  );
};

export default SearchInput;
