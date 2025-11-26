import React from "react";
import FilterSelect from "../../../shared/filters/FilterSelect";

/**
 * Props du composant StatusFilter
 */
interface StatusFilterProps {
  /** Valeur du filtre de statut (vide, "active" ou "inactive") */
  value: string;
  /** Callback appelé lors du changement de statut */
  onChange: (value: string) => void;
}

/**
 * Composant de filtre par statut
 * Affiche un select permettant de filtrer les produits par statut actif/inactif
 *
 * @example
 * <StatusFilter
 *   value={statusFilter}
 *   onChange={setStatusFilter}
 * />
 */
const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  return (
    <FilterSelect
        id="status"
      label="Statut"
      icon="fas fa-toggle-on"
        value={value}
      onChange={onChange}
      placeholder="Tous les statuts"
      options={[
        { value: "active", label: "Actif" },
        { value: "inactive", label: "Inactif" },
      ]}
    />
  );
};

export default StatusFilter;
