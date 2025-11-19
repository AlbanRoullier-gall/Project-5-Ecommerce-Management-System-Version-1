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
 * Props du composant Icon
 */
interface IconProps {
  /** Classe CSS FontAwesome */
  className: string;
  /** Taille de l'icône */
  fontSize?: string;
  /** Couleur de l'icône */
  color?: string;
}

/**
 * Composant Icon pour afficher des icônes FontAwesome
 */
const Icon: React.FC<IconProps> = ({
  className,
  fontSize = "1.1rem",
  color,
}) => {
  return (
    <i
      className={className}
      style={{
        fontSize,
        ...(color && { color }),
      }}
    />
  );
};

/**
 * Props du composant CategoryBadge
 */
interface CategoryBadgeProps {
  /** Nombre de produits */
  count: number;
}

/**
 * Composant badge de compteur de produits
 */
const CategoryBadge: React.FC<CategoryBadgeProps> = ({ count }) => {
  return (
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
      {count}
    </span>
  );
};

/**
 * Props du composant DropdownOption
 */
interface DropdownOptionProps {
  /** ID de la catégorie (0 pour "Toutes") */
  categoryId: number;
  /** Label à afficher */
  label: string;
  /** Icône FontAwesome à afficher */
  icon: string;
  /** ID de la catégorie sélectionnée */
  selectedCategoryId: number;
  /** Callback appelé quand l'option est sélectionnée */
  onSelect: (categoryId: number) => void;
  /** Nombre de produits (optionnel, affiche un badge si > 0) */
  productCount?: number;
  /** Afficher la bordure du bas */
  showBottomBorder: boolean;
}

/**
 * Composant d'option dans le menu déroulant
 */
const DropdownOption: React.FC<DropdownOptionProps> = ({
  categoryId,
  label,
  icon,
  selectedCategoryId,
  onSelect,
  productCount,
  showBottomBorder,
}) => {
  const isSelected = selectedCategoryId === categoryId;
  const hasBadge = productCount !== undefined && productCount > 0;

  return (
    <button
      className={`dropdown-option ${isSelected ? "is-selected" : ""}`}
      onClick={() => onSelect(categoryId)}
      style={{
        width: "100%",
        padding: "0.9rem 1.2rem",
        background: isSelected ? "rgba(19, 104, 106, 0.08)" : "white",
        border: "none",
        borderBottom: showBottomBorder ? "1px solid #e5e7eb" : "none",
        fontSize: "1.3rem",
        fontWeight: isSelected ? "600" : "400",
        cursor: "pointer",
        transition: "all 0.2s ease",
        color: isSelected ? "#13686a" : "#4b5563",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        justifyContent: hasBadge ? "space-between" : "flex-start",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.7rem",
        }}
      >
        <Icon className={icon} />
        {label}
      </span>
      {hasBadge && <CategoryBadge count={productCount!} />}
    </button>
  );
};

/**
 * Props du composant DropdownButton
 */
interface DropdownButtonProps {
  /** Label à afficher */
  label: string;
  /** État d'ouverture du dropdown */
  isOpen: boolean;
  /** Callback appelé quand le bouton est cliqué */
  onToggle: () => void;
}

/**
 * Composant bouton principal du dropdown
 */
const DropdownButton: React.FC<DropdownButtonProps> = ({
  label,
  isOpen,
  onToggle,
}) => {
  return (
    <button
      className={`dropdown-button ${isOpen ? "is-open" : ""}`}
      onClick={onToggle}
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
    >
      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Icon className="fas fa-filter" color="#13686a" />
        {label}
      </span>
      <Icon
        className={`fas fa-chevron-${isOpen ? "up" : "down"}`}
        fontSize="1rem"
        color="#6b7280"
      />
    </button>
  );
};

/**
 * Props du composant DropdownMenu
 */
interface DropdownMenuProps {
  /** État d'ouverture du menu */
  isOpen: boolean;
  /** Liste des catégories */
  categories: CategoryPublicDTO[];
  /** ID de la catégorie sélectionnée */
  selectedCategoryId: number;
  /** Callback appelé quand une catégorie est sélectionnée */
  onSelect: (categoryId: number) => void;
}

/**
 * Composant menu déroulant
 */
const DropdownMenu: React.FC<DropdownMenuProps> = ({
  isOpen,
  categories,
  selectedCategoryId,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
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
      <DropdownOption
        categoryId={0}
        label="Toutes"
        icon="fas fa-th"
        selectedCategoryId={selectedCategoryId}
        onSelect={onSelect}
        showBottomBorder={true}
      />

      {categories.map((category, index) => (
        <DropdownOption
          key={category.id}
          categoryId={category.id}
          label={category.name}
          icon="fas fa-gem"
          selectedCategoryId={selectedCategoryId}
          onSelect={onSelect}
          productCount={category.productCount}
          showBottomBorder={index < categories.length - 1}
        />
      ))}
    </div>
  );
};

/**
 * Props du composant FilterLayout
 */
interface FilterLayoutProps {
  /** Contenu à afficher */
  children: React.ReactNode;
}

/**
 * Composant layout pour le filtre de catégorie
 */
const FilterLayout: React.FC<FilterLayoutProps> = ({ children }) => {
  return (
    <div className="category-filter-container">
      <div className="category-filter-wrapper">
        <div className="category-filter-dropdown">{children}</div>
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

        .dropdown-button:hover:not(.is-open) {
          border-color: #13686a;
        }

        .dropdown-option:not(.is-selected):hover {
          background: #f9fafb;
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

  // Trouver la catégorie sélectionnée
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedLabel = selectedCategory
    ? selectedCategory.name
    : "Toutes les pierres";

  const handleSelectCategory = (categoryId: number) => {
    onCategoryChange(categoryId);
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const dropdownContent = (
    <div
      style={{
        position: "relative",
        zIndex: 10,
      }}
    >
      <DropdownButton
        label={selectedLabel}
        isOpen={isOpen}
        onToggle={handleToggle}
      />
      <DropdownMenu
        isOpen={isOpen}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelect={handleSelectCategory}
      />
    </div>
  );

  return <FilterLayout>{dropdownContent}</FilterLayout>;
};

export default CategoryFilter;
