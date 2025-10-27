import React from "react";
import { CategoryPublicDTO } from "../../../dto";

interface CategoryTableRowProps {
  category: CategoryPublicDTO;
  onEdit: (category: CategoryPublicDTO) => void;
  onDelete: (categoryId: number, categoryName: string) => void;
  formatDate: (date: Date | string) => string;
}

const CategoryTableRow: React.FC<CategoryTableRowProps> = ({
  category,
  onEdit,
  onDelete,
  formatDate,
}) => {
  return (
    <tr
      style={{
        borderBottom: "1px solid #e1e5e9",
        transition: "all 0.2s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background =
          "linear-gradient(90deg, rgba(217, 185, 112, 0.05) 0%, rgba(244, 208, 63, 0.05) 100%)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = "white";
      }}
    >
      <td style={{ padding: "1.25rem 1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #d9b970 0%, #f4d03f 100%)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#13686a",
            }}
          >
            <i className="fas fa-tag" style={{ fontSize: "1.2rem" }}></i>
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
      </td>
      <td className="mobile-hide" style={{ padding: "1.25rem 1.5rem" }}>
        <span
          style={{
            fontSize: "1rem",
            color: "#6b7280",
            maxWidth: "300px",
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {category.description || "-"}
        </span>
      </td>
      <td style={{ padding: "1.25rem 1.5rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            background: "#f3f4f6",
            borderRadius: "20px",
            fontSize: "0.9rem",
            fontWeight: "600",
            color: "#13686a",
          }}
        >
          <i className="fas fa-box"></i>
          {category.productCount || 0}
        </div>
      </td>
      <td
        className="mobile-hide"
        style={{
          padding: "1.25rem 1.5rem",
          fontSize: "1rem",
          color: "#6b7280",
        }}
      >
        {formatDate(category.createdAt)}
      </td>
      <td style={{ padding: "1.25rem 1.5rem" }}>
        <div
          className="action-buttons"
          style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
        >
          <button
            onClick={() => onEdit(category)}
            title="Modifier"
            className="action-btn action-btn-edit"
            style={{
              padding: "0.75rem",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#3b82f6",
              transition: "all 0.2s ease",
              borderRadius: "8px",
              fontSize: "1.2rem",
              minWidth: "44px",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={() => onDelete(category.id, category.name)}
            title="Supprimer"
            className="action-btn action-btn-delete"
            style={{
              padding: "0.75rem",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#ef4444",
              transition: "all 0.2s ease",
              borderRadius: "8px",
              fontSize: "1.2rem",
              minWidth: "44px",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CategoryTableRow;
