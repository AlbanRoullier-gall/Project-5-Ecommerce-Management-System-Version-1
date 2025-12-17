import React from "react";
import { CategoryPublicDTO } from "dto";
import ActionButtons from "../../product-list-view/table/ActionButtons";
import { TableRow, TableCell } from "../../../shared/TableLayout";
import styles from "../../../../styles/components/CategoryTableRow.module.css";

interface CategoryTableRowProps {
  category: CategoryPublicDTO;
  rowIndex: number;
  onEdit: (category: CategoryPublicDTO) => void;
  onDelete: (categoryId: number, categoryName: string) => void;
  formatDate: (date: Date | string) => string;
}

const CategoryTableRow: React.FC<CategoryTableRowProps> = ({
  category,
  rowIndex,
  onEdit,
  onDelete,
  formatDate,
}) => {
  return (
    <TableRow backgroundColor={rowIndex % 2 === 0 ? "#ffffff" : "#fafafa"}>
      <TableCell>
        <div className={styles.nameRow}>
          <div className={styles.tagIcon}>
            <i className="fas fa-tag"></i>
          </div>
          <span className={styles.name}>{category.name}</span>
        </div>
      </TableCell>
      <TableCell className="mobile-hide">
        <span className={styles.description}>
          {category.description || "-"}
        </span>
      </TableCell>

      <TableCell className="mobile-hide">
        <span className={styles.date}>{formatDate(category.createdAt)}</span>
      </TableCell>
      <TableCell width="160px">
        <div className={styles.actions}>
          <ActionButtons
            onEdit={() => onEdit(category)}
            onDelete={() => {
              if (
                window.confirm(
                  `Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`
                )
              ) {
                onDelete(category.id, category.name);
              }
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CategoryTableRow;
