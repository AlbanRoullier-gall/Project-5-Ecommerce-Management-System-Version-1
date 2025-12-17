import React from "react";
import { CategoryPublicDTO } from "../../../dto";
import { useToggle } from "../../../hooks";
import styles from "../../../styles/components/CategoryFilter.module.css";

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
  const { isOpen, toggle, close } = useToggle(false);

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
    close();
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.dropdown}>
          {/* Bouton principal du dropdown */}
          <button
            className={`${styles.button} ${isOpen ? styles.buttonOpen : ""}`}
            onClick={toggle}
            type="button"
          >
            {/* Label avec icône de filtre */}
            <span className={styles.label}>
              <i className={`fas fa-filter ${styles.labelIcon}`} />
              {selectedLabel}
            </span>
            {/* Icône chevron qui change selon l'état d'ouverture */}
            <i
              className={`fas fa-chevron-${isOpen ? "up" : "down"} ${
                styles.chevron
              }`}
            />
          </button>

          {/* Menu déroulant - affiché uniquement si isOpen est true */}
          {isOpen && (
            <div className={styles.menu}>
              {/* Option "Toutes" - permet de réinitialiser le filtre */}
              <button
                className={`${styles.option} ${
                  selectedCategoryId === 0 ? styles.optionSelected : ""
                }`}
                onClick={() => handleSelect(0)}
                type="button"
              >
                <span className={styles.optionContent}>
                  <i className={`fas fa-th ${styles.optionIcon}`} />
                  <span className={styles.optionLabel}>Toutes</span>
                </span>
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
                    className={`${styles.option} ${
                      isSelected ? styles.optionSelected : ""
                    }`}
                    onClick={() => handleSelect(category.id)}
                    type="button"
                  >
                    {/* Label de la catégorie avec icône */}
                    <span className={styles.optionContent}>
                      <span className={styles.optionLabel}>
                        <i className={`fas fa-gem ${styles.optionIcon}`} />
                        {category.name}
                      </span>
                    </span>
                    {/* Badge de compteur de produits - affiché uniquement si > 0 */}
                    {hasBadge && (
                      <span className={styles.badge}>
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
  );
};

export default CategoryFilter;
