import React, { useState, useRef, useEffect } from "react";
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
  /** Variante d'affichage: bandeau (par défaut) ou barre latérale */
  variant?: "banner" | "sidebar";
}

/**
 * Composant de filtrage par catégorie avec dropdown élégant
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
  variant = "banner",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Trouver la catégorie sélectionnée
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedLabel = selectedCategory
    ? selectedCategory.name
    : "Toutes les pierres";

  const handleSelectCategory = (categoryId: number) => {
    onCategoryChange(categoryId);
    setIsOpen(false);
  };

  const Dropdown = (
    <div
      ref={dropdownRef}
      style={{
        position: "relative",
        zIndex: 4000,
      }}
    >
      {/* Bouton principal du dropdown */}
      <button
        className="dropdown-button"
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
          e.currentTarget.style.borderColor = "#13686a";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = "#d1d5db";
          }
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <i
            className="fas fa-filter"
            style={{ fontSize: "1.1rem", color: "#13686a" }}
          ></i>
          {selectedLabel}
        </span>
        <i
          className={`fas fa-chevron-${isOpen ? "up" : "down"}`}
          style={{
            transition: "transform 0.3s ease",
            fontSize: "1rem",
            color: "#6b7280",
          }}
        ></i>
      </button>

      {/* Menu déroulant */}
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
            zIndex: 5000,
            overflow: "hidden",
            animation: "slideDown 0.2s ease",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {/* Option "Toutes les pierres" */}
          <button
            className="dropdown-option"
            onClick={() => handleSelectCategory(0)}
            style={{
              width: "100%",
              padding: "0.9rem 1.2rem",
              background:
                selectedCategoryId === 0 ? "rgba(19, 104, 106, 0.08)" : "white",
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
              if (selectedCategoryId !== 0) {
                e.currentTarget.style.background = "#f9fafb";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategoryId !== 0) {
                e.currentTarget.style.background = "white";
              }
            }}
          >
            <i className="fas fa-th" style={{ fontSize: "1.1rem" }}></i>
            Toutes
          </button>

          {/* Options des catégories */}
          {categories.map((category, index) => (
            <button
              key={category.id}
              className="dropdown-option"
              onClick={() => handleSelectCategory(category.id)}
              style={{
                width: "100%",
                padding: "0.9rem 1.2rem",
                background:
                  selectedCategoryId === category.id
                    ? "rgba(19, 104, 106, 0.08)"
                    : "white",
                border: "none",
                borderBottom:
                  index < categories.length - 1 ? "1px solid #e5e7eb" : "none",
                fontSize: "1.3rem",
                fontWeight: selectedCategoryId === category.id ? "600" : "400",
                cursor: "pointer",
                transition: "all 0.2s ease",
                color:
                  selectedCategoryId === category.id ? "#13686a" : "#4b5563",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onMouseEnter={(e) => {
                if (selectedCategoryId !== category.id) {
                  e.currentTarget.style.background = "#f9fafb";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategoryId !== category.id) {
                  e.currentTarget.style.background = "white";
                }
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.7rem",
                }}
              >
                <i className="fas fa-gem" style={{ fontSize: "1.1rem" }}></i>
                {category.name}
              </span>
              {category.productCount !== undefined &&
                category.productCount > 0 && (
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
          ))}
        </div>
      )}
    </div>
  );

  if (variant === "sidebar") {
    return (
      <div
        style={{
          padding: "0.5rem 0",
          position: "relative",
          zIndex: 3000,
          maxWidth: "280px",
          width: "100%",
        }}
      >
        {Dropdown}
        <style jsx>{`
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
        `}</style>
      </div>
    );
  }

  return (
    <div className="category-filter-container">
      <div className="category-filter-wrapper">
        <div className="category-filter-dropdown">{Dropdown}</div>
      </div>

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

        /* Responsive Design */
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
