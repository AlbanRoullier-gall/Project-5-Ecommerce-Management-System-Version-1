import React, { useState } from "react";
import { CategoryPublicDTO } from "../../dto";

/**
 * Props du composant CategoryFilter
 */
interface CategoryFilterProps {
  /** Liste des catégories disponibles */
  categories: CategoryPublicDTO[];
  /** ID de la catégorie sélectionnée (0 pour "Toutes") */
  selectedCategoryId: number;
  /** Callback appelé quand une catégorie est sélectionnée */
  onCategoryChange: (categoryId: number) => void;
}

/**
 * Composant de filtrage par catégorie avec dropdown
 * Affiche un menu déroulant moderne pour sélectionner une catégorie
 *
 * @example
 * <CategoryFilter
 *   categories={categories}
 *   selectedCategoryId={selectedCategoryId}
 *   onCategoryChange={setSelectedCategoryId}
 * />
 */
const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Trouve la catégorie sélectionnée dans la liste
   */
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  /**
   * Calcule le label à afficher dans le bouton
   * Affiche le nom de la catégorie sélectionnée ou "Toutes les pierres" par défaut
   */
  const selectedLabel = selectedCategory
    ? selectedCategory.name
    : "Toutes les pierres";

  /**
   * Gère la sélection d'une catégorie
   * Met à jour la catégorie sélectionnée et ferme le dropdown
   */
  const handleSelect = (categoryId: number) => {
    onCategoryChange(categoryId);
    setIsOpen(false);
  };

  return (
    <div className="category-filter-container">
      <div className="category-filter-wrapper">
        <div className="category-filter-dropdown">
          {/* Conteneur du dropdown avec z-index pour affichage au-dessus des produits */}
          <div style={{ position: "relative", zIndex: 10 }}>
            {/* Bouton principal du dropdown */}
            <button
              className={`dropdown-button ${isOpen ? "is-open" : ""}`}
              onClick={() => setIsOpen(!isOpen)}
              style={{
                width: "100%",
                padding: "0.8rem 1.2rem",
                background: "white",
                border: `1px solid ${isOpen ? "#13686a" : "#d1d5db"}`,
                borderRadius: "8px",
                fontSize: "1.3rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: isOpen
                  ? "0 2px 8px rgba(19, 104, 106, 0.1)"
                  : "0 1px 3px rgba(0, 0, 0, 0.05)",
                color: "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onMouseEnter={(e) => {
                // Change la couleur de la bordure au survol
                e.currentTarget.style.borderColor = "#13686a";
              }}
              onMouseLeave={(e) => {
                // Remet la bordure par défaut si le dropdown n'est pas ouvert
                if (!isOpen) {
                  e.currentTarget.style.borderColor = "#d1d5db";
                }
              }}
            >
              {/* Label avec icône de filtre */}
              <span
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <i
                  className="fas fa-filter"
                  style={{ fontSize: "1.1rem", color: "#13686a" }}
                />
                {selectedLabel}
              </span>
              {/* Icône chevron qui change selon l'état d'ouverture */}
              <i
                className={`fas fa-chevron-${isOpen ? "up" : "down"}`}
                style={{ fontSize: "1rem", color: "#6b7280" }}
              />
            </button>

            {/* Menu déroulant - affiché uniquement si isOpen est true */}
            {isOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 0.5rem)",
                  left: 0,
                  right: 0,
                  background: "white",
                  borderRadius: "8px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  animation: "slideDown 0.2s ease",
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 10,
                }}
              >
                {/* Option "Toutes" - permet de réinitialiser le filtre */}
                <button
                  className={`dropdown-option ${
                    selectedCategoryId === 0 ? "is-selected" : ""
                  }`}
                  onClick={() => handleSelect(0)}
                  style={{
                    width: "100%",
                    padding: "0.9rem 1.2rem",
                    background:
                      selectedCategoryId === 0
                        ? "rgba(19, 104, 106, 0.08)"
                        : "white",
                    border: "none",
                    borderBottom: "1px solid #e5e7eb",
                    fontSize: "1.3rem",
                    fontWeight: selectedCategoryId === 0 ? "600" : "400",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    color: selectedCategoryId === 0 ? "#13686a" : "#4b5563",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.7rem",
                  }}
                  onMouseEnter={(e) => {
                    // Change le fond au survol si l'option n'est pas sélectionnée
                    if (selectedCategoryId !== 0) {
                      e.currentTarget.style.background = "#f9fafb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Remet le fond par défaut si l'option n'est pas sélectionnée
                    if (selectedCategoryId !== 0) {
                      e.currentTarget.style.background = "white";
                    }
                  }}
                >
                  <i className="fas fa-th" style={{ fontSize: "1.1rem" }} />
                  Toutes
                </button>

                {/* Options des catégories - générées dynamiquement */}
                {categories.map((category, index) => {
                  /**
                   * Vérifie si cette catégorie est actuellement sélectionnée
                   */
                  const isSelected = selectedCategoryId === category.id;

                  /**
                   * Vérifie si la catégorie a un badge de compteur à afficher
                   */
                  const hasBadge =
                    category.productCount !== undefined &&
                    category.productCount > 0;

                  return (
                    <button
                      key={category.id}
                      className={`dropdown-option ${
                        isSelected ? "is-selected" : ""
                      }`}
                      onClick={() => handleSelect(category.id)}
                      style={{
                        width: "100%",
                        padding: "0.9rem 1.2rem",
                        background: isSelected
                          ? "rgba(19, 104, 106, 0.08)"
                          : "white",
                        border: "none",
                        borderBottom:
                          index < categories.length - 1
                            ? "1px solid #e5e7eb"
                            : "none",
                        fontSize: "1.3rem",
                        fontWeight: isSelected ? "600" : "400",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        color: isSelected ? "#13686a" : "#4b5563",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: hasBadge
                          ? "space-between"
                          : "flex-start",
                      }}
                      onMouseEnter={(e) => {
                        // Change le fond au survol si l'option n'est pas sélectionnée
                        if (!isSelected) {
                          e.currentTarget.style.background = "#f9fafb";
                        }
                      }}
                      onMouseLeave={(e) => {
                        // Remet le fond par défaut si l'option n'est pas sélectionnée
                        if (!isSelected) {
                          e.currentTarget.style.background = "white";
                        }
                      }}
                    >
                      {/* Label de la catégorie avec icône */}
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.7rem",
                        }}
                      >
                        <i
                          className="fas fa-gem"
                          style={{ fontSize: "1.1rem" }}
                        />
                        {category.name}
                      </span>
                      {/* Badge de compteur de produits - affiché uniquement si > 0 */}
                      {hasBadge && (
                        <span
                          style={{
                            padding: "0.2rem 0.6rem",
                            background: "rgba(19, 104, 106, 0.1)",
                            borderRadius: "10px",
                            fontSize: "1.1rem",
                            fontWeight: "600",
                            color: "#13686a",
                          }}
                        >
                          {category.productCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Styles CSS pour le layout et les animations */}
      <style jsx>{`
        .category-filter-container {
          background: #f8f9fa;
          padding: 2rem 0 1.5rem 0;
        }

        .category-filter-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .category-filter-dropdown {
          max-width: 300px;
          margin: 0;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-button:hover:not(.is-open) {
          border-color: #13686a;
        }

        .dropdown-option:not(.is-selected):hover {
          background: #f9fafb;
        }

        /* Responsive Design - Tablettes */
        @media (max-width: 768px) {
          .category-filter-container {
            padding: 1.5rem 0 1rem 0;
          }
          .category-filter-wrapper {
            padding: 0 1rem;
          }
          .category-filter-dropdown {
            max-width: 100%;
          }
          .dropdown-button {
            padding: 0.7rem 1rem !important;
            font-size: 1.1rem !important;
          }
          .dropdown-option {
            padding: 0.8rem 1rem !important;
            font-size: 1.1rem !important;
          }
        }

        /* Responsive Design - Mobiles */
        @media (max-width: 480px) {
          .category-filter-container {
            padding: 1rem 0 0.75rem 0;
          }
          .category-filter-wrapper {
            padding: 0 0.75rem;
          }
          .dropdown-button {
            padding: 0.6rem 0.8rem !important;
            font-size: 1rem !important;
          }
          .dropdown-option {
            padding: 0.7rem 0.8rem !important;
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryFilter;
