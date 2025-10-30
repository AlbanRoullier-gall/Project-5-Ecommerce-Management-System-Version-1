import React from "react";
import { CategoryPublicDTO } from "../../../dto";
import ActionButtons from "../table/ActionButtons";
import { TableRow, TableCell } from "../../ui/TableLayout";

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #d9b970 0%, #f4d03f 100%)",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#13686a",
            }}
          >
            <i className="fas fa-tag" style={{ fontSize: "1rem" }}></i>
          </div>
          <span
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#111827",
            }}
          >
            {category.name}
          </span>
        </div>
      </TableCell>
      <TableCell className="mobile-hide">
        <span
          style={{
            fontSize: "1rem",
            color: "#6b7280",
            maxWidth: "420px",
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {category.description || "-"}
        </span>
      </TableCell>

      <TableCell
        className="mobile-hide"
        style={{ fontSize: "1rem", color: "#6b7280" }}
      >
        {formatDate(category.createdAt)}
      </TableCell>
      <TableCell width="160px">
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
