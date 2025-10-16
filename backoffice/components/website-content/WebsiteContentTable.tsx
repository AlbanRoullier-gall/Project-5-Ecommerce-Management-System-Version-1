import React from "react";
import { WebsitePagePublicDTO } from "../../dto";

interface WebsiteContentTableProps {
  pages: WebsitePagePublicDTO[];
  isLoading?: boolean;
  onEdit?: (page: WebsitePagePublicDTO) => void;
  onDelete?: (page: WebsitePagePublicDTO) => void;
}

const WebsiteContentTable: React.FC<WebsiteContentTableProps> = ({
  pages,
  isLoading,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
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
              <th style={{ padding: "1.25rem 1.25rem", textAlign: "left" }}>
                Slug
              </th>
              <th style={{ padding: "1.25rem 1.25rem", textAlign: "left" }}>
                Titre
              </th>
              <th style={{ padding: "1.25rem 1.25rem", textAlign: "left" }}>
                Version
              </th>
              <th style={{ padding: "1.25rem 1.25rem", textAlign: "left" }}>
                Modifiée
              </th>
              <th style={{ padding: "1.25rem 1.25rem", textAlign: "left" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  Chargement...
                </td>
              </tr>
            )}
            {!isLoading && pages.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  Aucune page
                </td>
              </tr>
            )}
            {!isLoading &&
              pages
                .filter((p) => {
                  const allowed = [
                    "contact",
                    "mentions-legales",
                    "politique-de-confidentialite",
                    "conditions-generales",
                  ];
                  const slug = (p.pageSlug || "").toLowerCase();
                  return allowed.includes(slug);
                })
                .map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.75rem 1rem", color: "#111827" }}>
                    {p.pageSlug}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#111827" }}>
                    {p.pageTitle}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>{p.version}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {new Date(p.updatedAt).toLocaleString()}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      {onEdit && (
                        <button
                          onClick={() => onEdit(p)}
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
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(p)}
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
                      )}
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

export default WebsiteContentTable;
