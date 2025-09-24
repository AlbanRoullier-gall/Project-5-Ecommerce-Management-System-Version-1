"use client";

import React, { useState, useEffect } from "react";
import { Category } from "../shared-types";

interface ProductFiltersProps {
  filters: {
    search: string;
    category: string;
    status: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
  categories: Category[];
  onFiltersChange: (filters: any) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  categories,
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
      category: "",
      status: "",
      sortBy: "name",
      sortOrder: "asc" as "asc" | "desc",
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
            placeholder="Rechercher un produit..."
            value={localFilters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category">Catégorie</label>
          <select
            id="category"
            value={localFilters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="status">Statut</label>
          <select
            id="status"
            value={localFilters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sortBy">Trier par</label>
          <select
            id="sortBy"
            value={localFilters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          >
            <option value="name">Nom</option>
            <option value="price">Prix</option>
            <option value="createdAt">Date de création</option>
            <option value="updatedAt">Date de modification</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sortOrder">Ordre</label>
          <select
            id="sortOrder"
            value={localFilters.sortOrder}
            onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
          >
            <option value="asc">Croissant</option>
            <option value="desc">Décroissant</option>
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

export default ProductFilters;
