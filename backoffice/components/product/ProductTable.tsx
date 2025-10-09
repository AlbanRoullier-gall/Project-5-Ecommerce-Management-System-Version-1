import React from "react";
import { ProductPublicDTO } from "../../dto";

interface ProductTableProps {
  products: ProductPublicDTO[];
  onEdit: (product: ProductPublicDTO) => void;
  onDelete: (productId: number) => void;
  onToggleStatus: (productId: number, currentStatus: boolean) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-BE", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("fr-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  if (products.length === 0) {
    return (
      <div
        style={{
          background: "white",
          padding: "4rem 2rem",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          textAlign: "center",
          border: "2px solid rgba(19, 104, 106, 0.1)",
        }}
      >
        <i
          className="fas fa-inbox"
          style={{ fontSize: "4rem", color: "#d1d5db", marginBottom: "1rem" }}
        ></i>
        <p style={{ fontSize: "1.2rem", color: "#6b7280" }}>
          Aucun produit trouvé
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        border: "2px solid rgba(19, 104, 106, 0.1)",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: "1rem",
          }}
        >
          <thead
            style={{
              background: "linear-gradient(135deg, #13686a 0%, #0dd3d1 100%)",
              color: "white",
            }}
          >
            <tr>
              <th
                style={{
                  padding: "1.5rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Produit
              </th>
              <th
                style={{
                  padding: "1.5rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Catégorie
              </th>
              <th
                style={{
                  padding: "1.5rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Prix
              </th>
              <th
                style={{
                  padding: "1.5rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                TVA
              </th>
              <th
                style={{
                  padding: "1.5rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Statut
              </th>
              <th
                style={{
                  padding: "1.5rem 1.25rem",
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
                  padding: "1.5rem 1.25rem",
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
            {products.map((product) => (
              <tr
                key={product.id}
                style={{
                  borderBottom: "1px solid #e1e5e9",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(90deg, rgba(19, 104, 106, 0.05) 0%, rgba(13, 211, 209, 0.05) 100%)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "white";
                }}
              >
                <td style={{ padding: "1.5rem 1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        flexShrink: 0,
                        width: "50px",
                        height: "50px",
                        background: "#f3f4f6",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={`http://localhost:3020/${product.images[0].filePath}`}
                          alt={product.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            // Si l'image ne charge pas, afficher l'icône
                            e.currentTarget.style.display = "none";
                            const icon =
                              e.currentTarget.parentElement?.querySelector("i");
                            if (icon) {
                              (icon as HTMLElement).style.display =
                                "inline-block";
                            }
                          }}
                        />
                      ) : null}
                      <i
                        className="fas fa-image"
                        style={{
                          fontSize: "1.5rem",
                          color: "#9ca3af",
                          display:
                            product.images && product.images.length > 0
                              ? "none"
                              : "inline-block",
                        }}
                      ></i>
                    </div>
                    <div style={{ marginLeft: "1rem" }}>
                      <div
                        style={{
                          fontSize: "1rem",
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {product.name}
                      </div>
                      {product.description && (
                        <div
                          style={{
                            fontSize: "0.9rem",
                            color: "#6b7280",
                            maxWidth: "300px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {product.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "1.5rem 1.25rem" }}>
                  <span style={{ fontSize: "1rem", color: "#111827" }}>
                    {product.categoryName || "-"}
                  </span>
                </td>
                <td style={{ padding: "1.5rem 1.25rem" }}>
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "#13686a",
                    }}
                  >
                    {formatPrice(product.price)}
                  </span>
                </td>
                <td style={{ padding: "1.5rem 1.25rem" }}>
                  <span style={{ fontSize: "1rem", color: "#111827" }}>
                    {product.vatRate}%
                  </span>
                </td>
                <td style={{ padding: "1.5rem 1.25rem" }}>
                  <button
                    onClick={() => onToggleStatus(product.id, product.isActive)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 1.25rem",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      border: "none",
                      transition: "all 0.3s ease",
                      background: product.isActive
                        ? "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                        : "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
                      color: "white",
                      boxShadow: product.isActive
                        ? "0 2px 8px rgba(16, 185, 129, 0.3)"
                        : "0 2px 8px rgba(239, 68, 68, 0.3)",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(0, 0, 0, 0.2)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = product.isActive
                        ? "0 2px 8px rgba(16, 185, 129, 0.3)"
                        : "0 2px 8px rgba(239, 68, 68, 0.3)";
                    }}
                  >
                    <i
                      className={`fas fa-${
                        product.isActive ? "check-circle" : "times-circle"
                      }`}
                    ></i>
                    {product.isActive ? "Actif" : "Inactif"}
                  </button>
                </td>
                <td
                  style={{
                    padding: "1.5rem 1.25rem",
                    fontSize: "1rem",
                    color: "#6b7280",
                  }}
                >
                  {formatDate(product.createdAt)}
                </td>
                <td style={{ padding: "1.5rem 1.25rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={() => onEdit(product)}
                      title="Modifier"
                      style={{
                        padding: "0.75rem",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "#3b82f6",
                        transition: "all 0.2s ease",
                        borderRadius: "8px",
                        fontSize: "1.2rem",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background =
                          "rgba(59, 130, 246, 0.1)";
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
                      onClick={() => {
                        if (
                          window.confirm(
                            `Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`
                          )
                        ) {
                          onDelete(product.id);
                        }
                      }}
                      title="Supprimer"
                      style={{
                        padding: "0.75rem",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "#ef4444",
                        transition: "all 0.2s ease",
                        borderRadius: "8px",
                        fontSize: "1.2rem",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background =
                          "rgba(239, 68, 68, 0.1)";
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
