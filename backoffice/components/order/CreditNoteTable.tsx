import React from "react";
import { CreditNotePublicDTO, OrderPublicDTO } from "../../dto";

interface CreditNoteTableProps {
  creditNotes: CreditNotePublicDTO[];
  isLoading?: boolean;
  orders?: OrderPublicDTO[];
  onView?: (creditNoteId: number) => void;
  onDelete?: (creditNoteId: number) => void;
}

const CreditNoteTable: React.FC<CreditNoteTableProps> = ({
  creditNotes,
  isLoading,
  orders = [],
  onView,
  onDelete,
}) => {
  const orderById = React.useMemo(() => {
    const map = new Map<number, OrderPublicDTO>();
    orders.forEach((o) => map.set(o.id, o));
    return map;
  }, [orders]);

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
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                #
              </th>
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Client
              </th>
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Commande
              </th>
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Motif
              </th>
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "right",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Total HT
              </th>
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "right",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Total TTC
              </th>
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Émise
              </th>
              <th
                style={{
                  padding: "1.25rem 1.25rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={7}
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
            {!isLoading && creditNotes.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  Aucun avoir trouvé
                </td>
              </tr>
            )}
            {!isLoading &&
              creditNotes.map((c) => {
                const order = orderById.get(c.orderId);
                const customerName = order
                  ? `${order.customerFirstName || ""} ${
                      order.customerLastName || ""
                    }`.trim() ||
                    order.customerEmail ||
                    `Client #${c.customerId}`
                  : `Client #${c.customerId}`;
                const emitted = c.issueDate
                  ? new Date(c.issueDate as any).toLocaleDateString()
                  : c.createdAt
                  ? new Date(c.createdAt as any).toLocaleDateString()
                  : "—";
                return (
                  <tr key={c.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.75rem 1rem", color: "#111827" }}>
                      {c.id}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#111827" }}>
                      {customerName}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>{c.orderId}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>{c.reason}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      {(Number(c.totalAmountHT) || 0).toFixed(2)} €
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      {(Number(c.totalAmountTTC) || 0).toFixed(2)} €
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>{emitted}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        {onView && (
                          <button
                            onClick={() => onView(c.id)}
                            title="Voir"
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
                            <i className="fas fa-eye"></i>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(c.id)}
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
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreditNoteTable;
