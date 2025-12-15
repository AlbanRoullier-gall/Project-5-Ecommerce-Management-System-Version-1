import React from "react";
import { CategoryPublicDTO } from "dto";
import CategoryTableRow from "./CategoryTableRow";
import TableLayout, {
  TableHeader,
  TableRow,
  TableCell,
} from "../../../shared/TableLayout";

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

  // Empty state handled below inside TableLayout for consistency

  const headers: TableHeader[] = [
    { label: "Nom" },
    { label: "Description", className: "mobile-hide" },
    { label: "Date création", className: "mobile-hide" },
    { label: "Actions", align: "right", width: "160px" },
  ];

  return (
    <TableLayout headers={headers} minWidth="600px" headerGradient="gold">
      {categories.length === 0 && (
        <TableRow>
          <TableCell
            colSpan={4}
            align="center"
            style={{ color: "#6b7280", padding: "1rem" }}
          >
            Aucune catégorie créée
          </TableCell>
        </TableRow>
      )}
      {categories.map((category, index) => (
        <CategoryTableRow
          key={category.id}
          category={category}
          rowIndex={index}
          onEdit={onEdit}
          onDelete={onDelete}
          formatDate={formatDate}
        />
      ))}
    </TableLayout>
  );
};

export default CategoryTable;
