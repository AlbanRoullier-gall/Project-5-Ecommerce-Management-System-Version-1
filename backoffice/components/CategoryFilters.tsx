"use client";

import React, { useState, useEffect } from "react";

interface CategoryFiltersProps {
  filters: {
    search: string;
    sortBy: string;
  };
  onFiltersChange: (filters: any) => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: "",
      sortBy: "name",
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <div className="product-filters">
      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="search">Recherche</label>
          <input
            id="search"
            type="text"
            placeholder="Rechercher une catégorie..."
            value={localFilters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="sortBy">Trier par</label>
          <select
            id="sortBy"
            value={localFilters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          >
            <option value="name">Nom</option>
            <option value="createdAt">Date de création</option>
          </select>
        </div>
      </div>

      <div className="filter-actions">
        <button className="btn btn-primary" onClick={handleApplyFilters}>
          Appliquer les filtres
        </button>
        <button className="btn btn-secondary" onClick={handleResetFilters}>
          Réinitialiser
        </button>
      </div>
    </div>
  );
};

export default CategoryFilters;
