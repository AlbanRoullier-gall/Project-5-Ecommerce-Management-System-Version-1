import React from "react";
import { CategoryPublicDTO } from "../../../dto";
import CategoryTableRow from "./CategoryTableRow";

/**
 * Props du composant CategoryTable
 */
interface CategoryTableProps {
  /** Liste des catégories à afficher */
  categories: CategoryPublicDTO[];
  /** Callback appelé pour éditer une catégorie */
  onEdit: (category: CategoryPublicDTO) => void;
  /** Callback appelé pour supprimer une catégorie */
  onDelete: (categoryId: number, categoryName: string) => void;
}

/**
 * Composant tableau de catégories
 * Affiche les catégories dans un tableau avec :
 * - Nom avec icône
 * - Description
 * - Nombre de produits
 * - Date de création
 * - Actions (éditer/supprimer)
 *
 * Affiche un message si aucune catégorie n'existe
 */
const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  onEdit,
  onDelete,
}) => {
  /**
   * Formate une date au format DD/MM/YYYY (fr-BE)
   */
  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("fr-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  if (categories.length === 0) {
    return (
      <div
        style={{
          background: "#f8f9fa",
          padding: "3rem 2rem",
          borderRadius: "12px",
          textAlign: "center",
          border: "2px dashed #d1d5db",
        }}
      >
        <i
          className="fas fa-tags"
          style={{
            fontSize: "3rem",
            color: "#d1d5db",
            marginBottom: "1rem",
          }}
        ></i>
        <p style={{ fontSize: "1.1rem", color: "#6b7280" }}>
          Aucune catégorie créée
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive" style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: "1rem",
          minWidth: "600px",
        }}
      >
        <thead
          style={{
            background: "linear-gradient(135deg, #d9b970 0%, #f4d03f 100%)",
            color: "#13686a",
          }}
        >
          <tr>
            <th
              style={{
                padding: "1.25rem 1.5rem",
                textAlign: "left",
                fontSize: "1rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Nom
            </th>
            <th
              className="mobile-hide"
              style={{
                padding: "1.25rem 1.5rem",
                textAlign: "left",
                fontSize: "1rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Description
            </th>
            <th
              style={{
                padding: "1.25rem 1.5rem",
                textAlign: "left",
                fontSize: "1rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Produits
            </th>
            <th
              className="mobile-hide"
              style={{
                padding: "1.25rem 1.5rem",
                textAlign: "left",
                fontSize: "1rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Date création
            </th>
            <th
              style={{
                padding: "1.25rem 1.5rem",
                textAlign: "left",
                fontSize: "1rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <CategoryTableRow
              key={category.id}
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
              formatDate={formatDate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
